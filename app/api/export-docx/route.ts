import { z } from "zod";
import { buildResumeDocxBuffer } from "@/lib/resume/docx-document";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { TailoredResumeSchema, ResumeStyleSchema } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier } from "@/lib/ratelimit";

export const runtime = "nodejs";

const ExportDocxRequestSchema = z.object({
  role: z.string().nullable().optional(),
  tailoredResume: TailoredResumeSchema,
  resumeStyle: ResumeStyleSchema.optional(),
});

function contentDisposition(filename: string) {
  const safeFilename = filename.replace(/["\\]/g, "");
  return `attachment; filename="${safeFilename}"`;
}

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

    const payload = ExportDocxRequestSchema.parse(await request.json());
    const filename = buildResumePdfFilename({
      resume: payload.tailoredResume,
      role: payload.role,
    }).replace(/\.pdf$/, ".docx");

    const buffer = await buildResumeDocxBuffer(payload.tailoredResume, payload.resumeStyle);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Disposition": contentDisposition(filename),
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid DOCX export payload." }, { status: 400 });
    }
    console.error("[export-docx] generation failed", error);
    return Response.json({ error: "DOCX generation failed." }, { status: 500 });
  }
}
