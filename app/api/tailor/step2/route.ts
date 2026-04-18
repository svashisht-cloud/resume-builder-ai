import { generateTailoredResumeFromRaw } from "@/lib/ai/pipeline";
import { ResumeEvaluationSchema } from "@/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeText, jobDescriptionText, originalEvaluation, selectedKeywords } = body;

    if (typeof resumeText !== "string" || !resumeText.trim()) {
      return Response.json({ error: "resumeText is required." }, { status: 400 });
    }

    if (typeof jobDescriptionText !== "string" || !jobDescriptionText.trim()) {
      return Response.json(
        { error: "jobDescriptionText is required." },
        { status: 400 },
      );
    }

    const parsedEvaluation = ResumeEvaluationSchema.safeParse(originalEvaluation);
    if (!parsedEvaluation.success) {
      return Response.json(
        { error: "originalEvaluation is invalid." },
        { status: 400 },
      );
    }

    const { tailoredResume, changeLog } = await generateTailoredResumeFromRaw({
      resumeText,
      jobDescriptionText,
      originalEvaluation: parsedEvaluation.data,
      selectedKeywords: Array.isArray(selectedKeywords) ? selectedKeywords.filter((k: unknown) => typeof k === "string") : [],
    });

    return Response.json({ tailoredResume, changeLog });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Step 2 failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
