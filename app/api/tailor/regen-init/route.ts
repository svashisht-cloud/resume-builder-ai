import { hashJD, extractJobMeta } from "@/lib/resume/normalize";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    const { jobDescriptionText } = body as Record<string, unknown>;

    if (typeof jobDescriptionText !== "string" || !jobDescriptionText.trim()) {
      return Response.json({ error: "jobDescriptionText is required." }, { status: 400 });
    }

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
      p_force_fresh: false,
    });

    if (rpcError) {
      if (rpcError.code === "P0001") return Response.json({ error: "no_credits" }, { status: 402 });
      if (rpcError.code === "P0002") return Response.json({ error: "regen_limit_reached" }, { status: 403 });
      return Response.json({ error: rpcError.message }, { status: 500 });
    }

    const { resume_id: resumeId, regen_count: regenCount } =
      (rpcData as Array<{ resume_id: string; is_regen: boolean; regen_count: number }>)[0];

    return Response.json({ resumeId, regenCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Regen init failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
