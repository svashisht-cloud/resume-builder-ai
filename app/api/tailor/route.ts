import { z } from "zod";
import {
  buildScoreComparison,
  evaluateResumeAgainstJDRaw,
  evaluateTailoredResumeAgainstJDRaw,
  generateTailoredResumeFromRaw,
  renderTailoredResumeText,
} from "@/lib/ai/pipeline";
import { extractResumeText } from "@/lib/resume/extract-text";
import {
  ChangeLogSchema,
  ResumeEvaluationSchema,
  ScoreComparisonSchema,
  TailoredResumeSchema,
} from "@/types";

export const runtime = "nodejs";

const TailorResponseSchema = z.object({
  tailoredResume: TailoredResumeSchema,
  originalEvaluation: ResumeEvaluationSchema,
  tailoredEvaluation: ResumeEvaluationSchema,
  scoreComparison: ScoreComparisonSchema,
  evaluationMode: z.literal("llm"),
  changeLog: ChangeLogSchema,
});

function isClientError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("Unsupported resume format") ||
      error.message.includes("Legacy .doc") ||
      error.message.includes("empty"))
  );
}

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

    const resumeText = await extractResumeText(resumeFile);

    if (!resumeText.trim()) {
      return Response.json(
        { error: "Uploaded resume text is empty." },
        { status: 400 },
      );
    }

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

    const response = TailorResponseSchema.parse({
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
