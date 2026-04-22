import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { ResumePDFDocument } from "@/components/ResumePDFDocument";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { TailoredResumeSchema, ResumeStyleSchema, type TailoredResume } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier } from "@/lib/ratelimit";

// PDF style constants mirror ResumePDFDocument.tsx — kept in sync manually.
const BODY_PT: Record<string, number> = { small: 9.5, medium: 10.5, large: 11.5 };
const BULLET_LEADING: Record<string, number> = { compact: 1.15, normal: 1.27, relaxed: 1.5 };
const SECTION_MT: Record<string, number> = { compact: 1, normal: 3, relaxed: 6 };
// PDF page: 11in height, 30pt top/bottom margins → usable ≈ 11×72 − 60 = 732pt
const PDF_USABLE_PT = 732;

function logResumeStats(resume: TailoredResume, style: { fontFamily?: string; bodySize?: string; bulletSpacing?: string; sectionSpacing?: string }): void {
  const bodyPt = BODY_PT[style.bodySize ?? "medium"] ?? 10.5;
  const leading = BULLET_LEADING[style.bulletSpacing ?? "normal"] ?? 1.27;
  const sectionMt = SECTION_MT[style.sectionSpacing ?? "normal"] ?? 3;
  const lineHeightPt = bodyPt * leading;

  const expEntries = resume.experience.length;
  const projEntries = resume.projects.length;
  const totalBullets = [
    ...resume.experience.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
    ...resume.certifications,
  ].length;

  // Wrap-aware line estimate: divide each text item by chars-per-line rather than counting paragraphs.
  // At 10.5pt Times New Roman on a ~7.5" column, ~90 chars fit per visual line.
  const CHARS_PER_LINE = 90;
  const headerLines = 2 + (resume.contact.roleSubtitle ? 1 : 0);
  const sectionHeaders = (resume.skills.length > 0 ? 1 : 0) + (expEntries > 0 ? 1 : 0) + (projEntries > 0 ? 1 : 0) + (resume.education.length > 0 ? 1 : 0);
  const entryHeaders = expEntries * 2 + projEntries + resume.education.length * 2;
  const bulletLines = [
    ...resume.experience.flatMap((e) => e.bullets.map((b) => Math.ceil(b.text.length / CHARS_PER_LINE))),
    ...resume.projects.flatMap((p) => p.bullets.map((b) => Math.ceil(b.length / CHARS_PER_LINE))),
    ...resume.certifications.map((c) => Math.ceil(c.length / CHARS_PER_LINE)),
  ].reduce((sum, n) => sum + n, 0);
  const skillLineCount = resume.skills.reduce((sum, g) => {
    const rowText = `${g.category}: ${g.items.join(", ")}`;
    return sum + Math.ceil(rowText.length / CHARS_PER_LINE);
  }, 0);
  const estimatedLines = headerLines + sectionHeaders + entryHeaders + skillLineCount + bulletLines;
  const estimatedHeightPt = estimatedLines * lineHeightPt + sectionHeaders * sectionMt;
  const estimatedCapacity = Math.floor(PDF_USABLE_PT / lineHeightPt);

  // Original word/char stats (useful for spotting content-density overflow)
  const allText = [
    resume.summary,
    ...resume.experience.flatMap((e) => e.bullets.map((b) => b.text)),
    ...resume.projects.flatMap((p) => p.bullets),
    ...resume.skills.flatMap((s) => s.items),
    ...resume.certifications,
  ];
  const totalWords = allText.join(" ").split(/\s+/).filter(Boolean).length;
  const totalChars = allText.join(" ").length;
  const charBasedLineEstimate = Math.round(totalChars / 85);
  const experienceBullets = resume.experience.reduce((sum, e) => sum + e.bullets.length, 0);
  const projectBullets = resume.projects.reduce((sum, p) => sum + p.bullets.length, 0);
  const totalSkillItems = resume.skills.reduce((sum, s) => sum + s.items.length, 0);

  console.log("[export-pdf] resume stats:", {
    totalWords,
    charBasedLineEstimate,
    experienceRoles: resume.experience.length,
    experienceBullets,
    totalProjects: resume.projects.length,
    projectBullets,
    skillCategories: resume.skills.length,
    totalSkillItems,
  });

  console.log("[export-pdf] generation stats", {
    style: { fontFamily: style.fontFamily ?? "times", bodySize: `${bodyPt}pt`, lineHeight: `${lineHeightPt.toFixed(2)}pt`, sectionSpacing: `${sectionMt}pt`, margins: "top/bottom:30pt left/right:32pt" },
    content: { expEntries, projEntries, totalBullets, skillGroups: resume.skills.length, educationEntries: resume.education.length },
    estimate: { lines: estimatedLines, estimatedHeightPt: Math.round(estimatedHeightPt), capacityAtLineHeight: estimatedCapacity, riskOfOverflow: estimatedLines > estimatedCapacity },
  });
}

function countPdfPages(buffer: Buffer): number {
  // Each page in a PDF has a /Type /Page object (singular).
  // /Type /Pages (plural) is the parent catalog node — excluded by the negative lookahead.
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page(?!s)/g);
  return matches?.length ?? 1;
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

    const payload = ExportPdfRequestSchema.parse(await request.json());
    logResumeStats(payload.tailoredResume, payload.resumeStyle ?? {});
    const filename = buildResumePdfFilename({
      resume: payload.tailoredResume,
      role: payload.role,
    });
    const pdfDocument = React.createElement(ResumePDFDocument, {
      resume: payload.tailoredResume,
      resumeStyle: payload.resumeStyle,
    }) as unknown as PdfElement;
    const pdfBuffer = await renderToBuffer(pdfDocument);
    console.log("[export-pdf] page count:", countPdfPages(pdfBuffer));

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
