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

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tailoredResume, jobDescriptionText, originalEvaluation, changeLog } =
      body;

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

    const tailoredEvaluation = await evaluateTailoredResumeAgainstJDRaw(
      renderTailoredResumeText(parsedResume.data),
      jobDescriptionText,
    );

    const scoreComparison = buildScoreComparison({
      originalEvaluation: parsedOriginalEval.data,
      tailoredEvaluation,
    });

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
    return Response.json({ error: message }, { status: 500 });
  }
}
