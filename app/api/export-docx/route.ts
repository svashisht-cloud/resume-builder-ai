import { z } from "zod";
import { buildResumeDocxBuffer } from "@/lib/resume/docx-document";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { TailoredResumeSchema, ResumeStyleSchema } from "@/types";

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
