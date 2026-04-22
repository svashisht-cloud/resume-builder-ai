import { generateTailoredResumeFromRaw, refineTailoredResume } from "@/lib/ai/pipeline";
import { ResumeEvaluationSchema, TailoredResumeSchema } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

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
    const { resumeText, jobDescriptionText, originalEvaluation, selectedKeywords,
            previousTailoredResume, userFeedback, selectedItemTexts } =
      body as Record<string, unknown>;

    // ── Refine path (regenerate with tailored resume as base) ──────────────────
    if (previousTailoredResume !== undefined) {
      const parsedPrevResume = TailoredResumeSchema.safeParse(previousTailoredResume);
      if (!parsedPrevResume.success) {
        return Response.json({ error: "previousTailoredResume is invalid." }, { status: 400 });
      }

      if (typeof jobDescriptionText !== "string" || !jobDescriptionText.trim()) {
        return Response.json({ error: "jobDescriptionText is required." }, { status: 400 });
      }

      const parsedEvaluation = ResumeEvaluationSchema.safeParse(originalEvaluation);
      if (!parsedEvaluation.success) {
        return Response.json({ error: "originalEvaluation is invalid." }, { status: 400 });
      }

      const { tailoredResume, changeLog } = await refineTailoredResume({
        previousTailoredResume: parsedPrevResume.data,
        userFeedback: typeof userFeedback === "string" ? userFeedback : "",
        selectedItemTexts: Array.isArray(selectedItemTexts)
          ? selectedItemTexts.filter((t: unknown) => typeof t === "string")
          : undefined,
        jobDescriptionText,
        originalEvaluation: parsedEvaluation.data,
      });

      return Response.json({ tailoredResume, changeLog });
    }

    // ── Fresh tailor path (unchanged) ──────────────────────────────────────────
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
