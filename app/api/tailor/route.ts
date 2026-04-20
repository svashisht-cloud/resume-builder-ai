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
      return Response.json({ error: rpcError.message }, { status: 500 });
    }

    const resumeText = await extractResumeText(resumeFile);

    if (!resumeText.trim()) {
      return Response.json(
        { error: "Uploaded resume text is empty." },
        { status: 400 },
      );
    }

    void rpcData; // resume_id/is_regen/regen_count available but not returned by this combined route

    const originalEvaluation = await evaluateResumeAgainstJDRaw(
      resumeText,
      jobDescriptionText,
    );

    const generatedResult = await generateTailoredResumeFromRaw({
      resumeText,
      jobDescriptionText,
      originalEvaluation,
    });
    const { tailoredResume, changeLog } = generatedResult;

    const tailoredEvaluation = await evaluateTailoredResumeAgainstJDRaw(
      renderTailoredResumeText(tailoredResume),
      jobDescriptionText,
    );
    const scoreComparison = buildScoreComparison({
      originalEvaluation,
      tailoredEvaluation,
    });

    const response: TailorResponse = TailorResponseSchema.parse({
      tailoredResume,
      originalEvaluation,
      tailoredEvaluation,
      scoreComparison,
      evaluationMode: "llm",
      changeLog,
    });

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tailoring request failed.";

    if (isClientError(error)) {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
