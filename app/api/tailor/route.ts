import { z } from "zod";
import {
  buildScoreComparison,
  evaluateResumeAgainstJDRaw,
  evaluateTailoredResumeAgainstJDRaw,
  generateTailoredResumeFromRaw,
  renderTailoredResumeText,
} from "@/lib/ai/pipeline";
import { extractResumeText } from "@/lib/resume/extract-text";
import { hashJD, extractJobMeta } from "@/lib/resume/normalize";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIdentifier } from "@/lib/ratelimit";
import {
  ChangeLogSchema,
  ResumeEvaluationSchema,
  ScoreComparisonSchema,
  TailoredResumeSchema,
} from "@/types";
import type { TailorResponse } from "@/types/api";
import { isClientError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

const TailorResponseSchema = z.object({
  tailoredResume: TailoredResumeSchema,
  originalEvaluation: ResumeEvaluationSchema,
  tailoredEvaluation: ResumeEvaluationSchema,
  scoreComparison: ScoreComparisonSchema,
  evaluationMode: z.literal("llm"),
  changeLog: ChangeLogSchema,
});

export async function POST(request: Request) {
  let userId: string | null = null;
  let resumeId: string | null = null;
  let isRegen = false;
  let creditWasSpent = false;

  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resumeFile");
    const jobDescriptionText = formData.get("jobDescriptionText");

    if (!(resumeFile instanceof File)) {
      return Response.json({ error: "resumeFile is required." }, { status: 400 });
    }

    if (typeof jobDescriptionText !== "string" || !jobDescriptionText.trim()) {
      return Response.json(
        { error: "jobDescriptionText is required." },
        { status: 400 },
      );
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "Resume file is too large. Maximum size is 5 MB." },
        { status: 400 },
      );
    }

    if (jobDescriptionText.length > 15_000) {
      return Response.json(
        { error: "Job description is too long. Maximum is 15 000 characters." },
        { status: 400 },
      );
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }
    userId = user.id;

    // Rate limit
    const { success: rlSuccess, reset: rlReset } = await checkRateLimit(getIdentifier(request, user.id));
    if (!rlSuccess) {
      const retryAfter = Math.max(0, Math.ceil((rlReset - Date.now()) / 1000));
      return Response.json(
        { error: "rate_limited", retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const jdHash = await hashJD(jobDescriptionText);
    const { jobTitle, companyName } = extractJobMeta(jobDescriptionText);

    const { data: rpcData, error: rpcError } = await supabase.rpc("start_or_regen_resume", {
      p_jd_hash: jdHash,
      p_job_title: jobTitle,
      p_company_name: companyName,
    });

    if (rpcError) {
      if (rpcError.code === "P0001") {
        return Response.json({ error: "no_credits" }, { status: 402 });
      }
      if (rpcError.code === "P0002") {
        return Response.json({ error: "regen_limit_reached" }, { status: 403 });
      }
      if (rpcError.code === "P0003") {
        return Response.json({ error: "paid_credit_required" }, { status: 403 });
      }
      return Response.json({ error: rpcError.message }, { status: 500 });
    }

    const rpcRow = (rpcData as Array<{ resume_id: string; is_regen: boolean; regen_count: number }>)[0];
    resumeId = rpcRow.resume_id;
    isRegen = rpcRow.is_regen;
    creditWasSpent = !isRegen;

    const restoreCredit = async () => {
      if (!creditWasSpent) return;
      await supabase.rpc("restore_credit", { p_resume_id: resumeId }).then(
        undefined,
        (e) => console.error("[restore_credit] failed for resumeId", resumeId, e),
      );
    };

    try {
      const pipelineStart = Date.now();
      const resumeText = await extractResumeText(resumeFile);

      if (!resumeText.trim()) {
        await restoreCredit();
        return Response.json(
          { error: "Uploaded resume text is empty." },
          { status: 400 },
        );
      }

      const { data: originalEvaluation, usage: usageEval1 } = await evaluateResumeAgainstJDRaw(
        resumeText,
        jobDescriptionText,
      );

      const { tailoredResume, changeLog, usage: usageTailor } = await generateTailoredResumeFromRaw({
        resumeText,
        jobDescriptionText,
        originalEvaluation,
      });

      const { data: tailoredEvaluation, usage: usageEval2 } = await evaluateTailoredResumeAgainstJDRaw(
        renderTailoredResumeText(tailoredResume),
        jobDescriptionText,
      );
      const scoreComparison = buildScoreComparison({
        originalEvaluation,
        tailoredEvaluation,
      });

      const totalDurationMs = Date.now() - pipelineStart;
      const totalCostUsd = usageEval1.estimatedCostUsd + usageTailor.estimatedCostUsd + usageEval2.estimatedCostUsd;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: logError } = await (getAdminClient().from("pipeline_runs") as any).insert({
          user_id: userId,
          resume_id: resumeId,
          is_regen: isRegen,
          total_duration_ms: totalDurationMs,
          score_before: scoreComparison.before,
          score_after: scoreComparison.after,
          score_delta: scoreComparison.delta,
          tokens_eval1: usageEval1.totalTokens,
          tokens_tailor: usageTailor.totalTokens,
          tokens_eval2: usageEval2.totalTokens,
          estimated_cost_usd: totalCostUsd,
        });
        if (logError) console.error("[pipeline_runs] combined route insert error:", logError);
      } catch (logErr) {
        console.error("[pipeline_runs] combined route failed to log run:", logErr);
      }

      const response: TailorResponse = TailorResponseSchema.parse({
        tailoredResume,
        originalEvaluation,
        tailoredEvaluation,
        scoreComparison,
        evaluationMode: "llm",
        changeLog,
      });

      return Response.json(response);
    } catch (err) {
      await restoreCredit();
      throw err;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tailoring request failed.";

    if (userId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (getAdminClient().from("pipeline_runs") as any).insert({
          user_id: userId,
          resume_id: resumeId,
          is_regen: isRegen,
          error_step: "combined",
          error_code: message,
        });
      } catch {
        // ignore logging errors
      }
    }

    if (isClientError(error)) {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
