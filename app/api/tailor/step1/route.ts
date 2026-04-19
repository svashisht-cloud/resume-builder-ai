import { evaluateResumeAgainstJDRaw } from "@/lib/ai/pipeline";
import { extractResumeText } from "@/lib/resume/extract-text";
import { isClientError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

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

    return Response.json({ resumeText, originalEvaluation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Step 1 failed.";

    if (isClientError(error)) {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
