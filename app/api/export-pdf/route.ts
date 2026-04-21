import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { ResumePDFDocument } from "@/components/ResumePDFDocument";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { TailoredResumeSchema, ResumeStyleSchema, type TailoredResume } from "@/types";

function logResumeStats(resume: TailoredResume): void {
  const allText: string[] = [
    resume.summary,
    ...resume.experience.flatMap((e) => e.bullets.map((b) => b.text)),
    ...resume.projects.flatMap((p) => p.bullets),
    ...resume.skills.flatMap((s) => s.items),
    ...resume.certifications,
  ];
  const totalWords = allText
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const totalChars = allText.join(" ").length;
  const estimatedLines = Math.round(totalChars / 85);
  const experienceBullets = resume.experience.reduce(
    (sum, e) => sum + e.bullets.length,
    0,
  );
  const projectBullets = resume.projects.reduce(
    (sum, p) => sum + p.bullets.length,
    0,
  );
  const totalSkillItems = resume.skills.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );
  console.log("[export-pdf] resume stats:", {
    totalWords,
    estimatedLines,
    experienceRoles: resume.experience.length,
    experienceBullets,
    totalProjects: resume.projects.length,
    projectBullets,
    skillCategories: resume.skills.length,
    totalSkillItems,
  });
}

type PdfElement = Parameters<typeof renderToBuffer>[0];

export const runtime = "nodejs";

const ExportPdfRequestSchema = z.object({
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
    const payload = ExportPdfRequestSchema.parse(await request.json());
    logResumeStats(payload.tailoredResume);
    const filename = buildResumePdfFilename({
      resume: payload.tailoredResume,
      role: payload.role,
    });
    const pdfDocument = React.createElement(ResumePDFDocument, {
      resume: payload.tailoredResume,
      resumeStyle: payload.resumeStyle,
    }) as unknown as PdfElement;
    const pdfBuffer = await renderToBuffer(pdfDocument);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Disposition": contentDisposition(filename),
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid PDF export payload." }, { status: 400 });
    }
    console.error("[export-pdf] generation failed", error);
    return Response.json({ error: "PDF generation failed." }, { status: 500 });
  }
}
