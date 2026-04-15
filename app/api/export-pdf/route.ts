import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { ResumePDFDocument } from "@/components/ResumePDFDocument";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { TailoredResumeSchema } from "@/types";

type PdfElement = Parameters<typeof renderToBuffer>[0];

export const runtime = "nodejs";

const ExportPdfRequestSchema = z.object({
  role: z.string().nullable().optional(),
  tailoredResume: TailoredResumeSchema,
});

function contentDisposition(filename: string) {
  const safeFilename = filename.replace(/["\\]/g, "");
  return `attachment; filename="${safeFilename}"`;
}

export async function POST(request: Request) {
  try {
    const payload = ExportPdfRequestSchema.parse(await request.json());
    const filename = buildResumePdfFilename({
      resume: payload.tailoredResume,
      role: payload.role,
    });
    const pdfDocument = React.createElement(ResumePDFDocument, {
      resume: payload.tailoredResume,
    }) as unknown as PdfElement;
    const pdfBuffer = await renderToBuffer(pdfDocument);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Disposition": contentDisposition(filename),
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid PDF export payload."
        : "PDF export failed.";

    return Response.json({ error: message }, { status: 400 });
  }
}
