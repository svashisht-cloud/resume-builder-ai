import {
  buildScoreComparison,
  evaluateTailoredResumeAgainstJDRaw,
  renderTailoredResumeText,
} from "@/lib/ai/pipeline";
import {
  ChangeLogSchema,
  ResumeEvaluationSchema,
  TailoredResumeSchema,
} from "@/types";
import type { TailorResponse } from "@/types/api";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIdentifier } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let userId: string | null = null;
  let parsedResumeId: string | null = null;

  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
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

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    const {
      tailoredResume,
      jobDescriptionText,
      originalEvaluation,
      changeLog,
      // threading fields from steps 1 & 2
      step1DurationMs,
      step2DurationMs,
      resumeId,
      tokensEval1,
      tokensTailor,
      eval1CostUsd,
      tailorCostUsd,
      isRegen,
    } = body as Record<string, unknown>;

    parsedResumeId = typeof resumeId === "string" ? resumeId : null;

    if (typeof jobDescriptionText !== "string" || !jobDescriptionText.trim()) {
      return Response.json(
        { error: "jobDescriptionText is required." },
        { status: 400 },
      );
    }

    const parsedResume = TailoredResumeSchema.safeParse(tailoredResume);
    if (!parsedResume.success) {
      return Response.json({ error: "tailoredResume is invalid." }, { status: 400 });
    }

    const parsedOriginalEval = ResumeEvaluationSchema.safeParse(originalEvaluation);
    if (!parsedOriginalEval.success) {
      return Response.json(
        { error: "originalEvaluation is invalid." },
        { status: 400 },
      );
    }

    const parsedChangeLog = ChangeLogSchema.safeParse(changeLog);
    if (!parsedChangeLog.success) {
      return Response.json({ error: "changeLog is invalid." }, { status: 400 });
    }

    const step3Start = Date.now();
    const { data: tailoredEvaluation, usage: usageEval2 } = await evaluateTailoredResumeAgainstJDRaw(
      renderTailoredResumeText(parsedResume.data),
      jobDescriptionText,
    );
    const step3DurationMs = Date.now() - step3Start;

    const scoreComparison = buildScoreComparison({
      originalEvaluation: parsedOriginalEval.data,
      tailoredEvaluation,
    });

    const s1 = typeof step1DurationMs === "number" ? step1DurationMs : 0;
    const s2 = typeof step2DurationMs === "number" ? step2DurationMs : 0;
    const totalDurationMs = s1 + s2 + step3DurationMs;

    const c1 = typeof eval1CostUsd === "number" ? eval1CostUsd : 0;
    const c2 = typeof tailorCostUsd === "number" ? tailorCostUsd : 0;
    const totalCostUsd = c1 + c2 + usageEval2.estimatedCostUsd;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: logError } = await (getAdminClient().from("pipeline_runs") as any).insert({
        user_id: userId,
        resume_id: parsedResumeId,
        is_regen: typeof isRegen === "boolean" ? isRegen : false,
        step1_duration_ms: typeof step1DurationMs === "number" ? step1DurationMs : null,
        step2_duration_ms: typeof step2DurationMs === "number" ? step2DurationMs : null,
        step3_duration_ms: step3DurationMs,
        total_duration_ms: totalDurationMs,
        score_before: scoreComparison.before,
        score_after: scoreComparison.after,
        score_delta: scoreComparison.delta,
        tokens_eval1: typeof tokensEval1 === "number" ? tokensEval1 : null,
        tokens_tailor: typeof tokensTailor === "number" ? tokensTailor : null,
        tokens_eval2: usageEval2.totalTokens,
        estimated_cost_usd: totalCostUsd,
      });
      if (logError) console.error("[pipeline_runs] insert error:", logError);
    } catch (logErr) {
      console.error("[pipeline_runs] failed to log run:", logErr);
    }

    const response: TailorResponse = {
      tailoredResume: parsedResume.data,
      originalEvaluation: parsedOriginalEval.data,
      tailoredEvaluation,
      scoreComparison,
      evaluationMode: "llm",
      changeLog: parsedChangeLog.data,
    };

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Step 3 failed.";

    if (userId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (getAdminClient().from("pipeline_runs") as any).insert({
          user_id: userId,
          resume_id: parsedResumeId,
          error_step: "step3",
          error_code: message,
        });
      } catch {
        // ignore logging errors
      }
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
