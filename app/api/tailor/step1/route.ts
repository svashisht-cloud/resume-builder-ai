import { evaluateResumeAgainstJDRaw } from "@/lib/ai/pipeline";
import { extractResumeText } from "@/lib/resume/extract-text";
import { hashJD, extractJobMeta } from "@/lib/resume/normalize";
import { createClient } from "@/lib/supabase/server";
import { isClientError } from "@/lib/errors";
import { checkRateLimit, getIdentifier } from "@/lib/ratelimit";

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

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
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

    // Hash JD + extract meta before expensive file I/O
    const jdHash = await hashJD(jobDescriptionText);
    const { jobTitle, companyName } = extractJobMeta(jobDescriptionText);

    // isFreshTailor=true (default) → reset regen count on existing JD rows so
    // "Tailor Resume" is never blocked by the regen limit. Only the Regenerate
    // button path sends isFreshTailor=false to enforce the limit.
    const isFreshTailor = formData.get("isFreshTailor") !== "false";

    // Credit / regen check (atomic, transactional)
    const { data: rpcData, error: rpcError } = await supabase.rpc("start_or_regen_resume", {
      p_jd_hash: jdHash,
      p_job_title: jobTitle,
      p_company_name: companyName,
      p_force_fresh: isFreshTailor,
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

    const { resume_id: resumeId, is_regen: isRegen, regen_count: regenCount } = (rpcData as Array<{ resume_id: string; is_regen: boolean; regen_count: number }>)[0];
    const creditWasSpent = !isRegen;

    const restoreCredit = async () => {
      if (!creditWasSpent) return;
      await supabase.rpc("restore_credit", { p_resume_id: resumeId }).then(
        undefined,
        (e) => console.error("[restore_credit] failed for resumeId", resumeId, e),
      );
    };

    try {
      const { data: paidCreditData } = await supabase
        .from("credits")
        .select("id")
        .eq("spent_on_resume_id", resumeId)
        .in("source", ["resume_pack", "resume_pack_plus"])
        .limit(1);
      const isPaidCredit = (paidCreditData?.length ?? 0) > 0;

      const resumeText = await extractResumeText(resumeFile);

      if (!resumeText.trim()) {
        await restoreCredit();
        return Response.json(
          { error: "Uploaded resume text is empty." },
          { status: 400 },
        );
      }

      const originalEvaluation = await evaluateResumeAgainstJDRaw(
        resumeText,
        jobDescriptionText,
      );

      return Response.json({ resumeText, originalEvaluation, resumeId, isRegen, regenCount, isPaidCredit });
    } catch (err) {
      await restoreCredit();
      throw err;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Step 1 failed.";

    if (isClientError(error)) {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
