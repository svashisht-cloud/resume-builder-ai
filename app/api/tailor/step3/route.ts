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
    const { tailoredResume, jobDescriptionText, originalEvaluation, changeLog } =
      body as Record<string, unknown>;

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
