import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { ResumePDFDocument } from "@/components/ResumePDFDocument";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { TailoredResumeSchema, ResumeStyleSchema, type TailoredResume, type ResumeStyle, DEFAULT_RESUME_STYLE } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getIdentifier } from "@/lib/ratelimit";

// PDF style constants mirror ResumePDFDocument.tsx — kept in sync manually.
const BODY_PT: Record<string, number> = { small: 9.5, medium: 10.5, large: 11.5 };
const BULLET_LEADING: Record<string, number> = { compact: 1.15, normal: 1.27, relaxed: 1.5 };
const SECTION_MT: Record<string, number> = { compact: 1, normal: 3, relaxed: 6 };
// PDF page: 11in height, 30pt top/bottom margins → usable ≈ 11×72 − 60 = 732pt
const PDF_USABLE_PT = 732;
const NAME_PT: Record<string, number> = { small: 18, medium: 20, large: 22 };
const ITEM_MB: Record<string, number> = { compact: 2, normal: 4, relaxed: 7 };
const BULLET_ROW_MB: Record<string, number> = { compact: 1, normal: 3, relaxed: 5 };

function logResumeStats(resume: TailoredResume, style: { fontFamily?: string; nameSize?: string; bodySize?: string; bulletSpacing?: string; sectionSpacing?: string }): void {
  const bodyPt = BODY_PT[style.bodySize ?? "medium"] ?? 10.5;
  const leading = BULLET_LEADING[style.bulletSpacing ?? "normal"] ?? 1.27;
  const sectionMt = SECTION_MT[style.sectionSpacing ?? "normal"] ?? 3;
  const namePt = NAME_PT[style.nameSize ?? "medium"] ?? 20;
  const itemMb = ITEM_MB[style.sectionSpacing ?? "normal"] ?? 4;
  const bulletRowMb = BULLET_ROW_MB[style.sectionSpacing ?? "normal"] ?? 3;
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

  // Fixed spacing components not accounted for by line count alone
  const bulletRowMargins = totalBullets * bulletRowMb;                // bulletRow.marginBottom (sectionSpacing-dependent)
  const entryBlockMargins = (expEntries + projEntries) * itemMb;      // expBlock.marginBottom = itemMb per entry
  const headerFixedPt = namePt + 10 + 3;                             // name marginBottom + header marginBottom
  const sectionRuleOverhead = sectionHeaders * (0.75 + 2);           // rule borderWidth + marginBottom per section

  const estimatedHeightPt = estimatedLines * lineHeightPt + sectionHeaders * sectionMt
    + bulletRowMargins + entryBlockMargins + headerFixedPt + sectionRuleOverhead;
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

// Level progression (finer-grained to avoid over-compacting):
//   1 → compact section spacing only (saves ~8pt)
//   2 → also compact bullet leading (saves ~65pt more)
//   3 → also reduce body/header font size (last resort)
function buildPdfStyle(level: 0 | 1 | 2 | 3, requested: ResumeStyle): ResumeStyle {
  if (level === 0) return requested;
  if (level === 1) return { ...requested, sectionSpacing: "compact" };
  if (level === 2) return { ...requested, sectionSpacing: "compact", bulletSpacing: "compact" };
  return { ...requested, sectionSpacing: "compact", bulletSpacing: "compact", bodySize: "small", headerSize: "small" };
}

function countPdfPages(buffer: Buffer): number {
  // Each page in a PDF has a /Type /Page object (singular).
  // /Type /Pages (plural) is the parent catalog node — excluded by the negative lookahead.
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page(?!s)/g);
  return matches?.length ?? 1;
}

type PdfElement = Parameters<typeof renderToBuffer>[0];

const PDF_LEVEL_LABELS = ["", "compact section spacing", "compact section + bullet spacing", "compact spacing + small text"];

async function renderWithAdaptiveFit(
  resume: TailoredResume,
  requestedStyle: ResumeStyle,
): Promise<{ buffer: Buffer; pageCount: number; styleLevel: number }> {
  let lastBuffer: Buffer | null = null;
  let lastPageCount = 0;
  for (let level = 0; level <= 3; level++) {
    const style = buildPdfStyle(level as 0 | 1 | 2 | 3, requestedStyle);
    const element = React.createElement(ResumePDFDocument, { resume, resumeStyle: style }) as unknown as PdfElement;
    const buffer = await renderToBuffer(element);
    const pageCount = countPdfPages(buffer);
    if (level > 0) {
      console.log(`[export-pdf] adaptive-fit: applied level-${level} (${PDF_LEVEL_LABELS[level]}), pages: ${pageCount}`);
    }
    lastBuffer = buffer;
    lastPageCount = pageCount;
    if (pageCount <= 1) return { buffer, pageCount, styleLevel: level };
  }
  console.log(`[export-pdf] adaptive-fit: level-3 still ${lastPageCount} pages — resume is genuinely long`);
  return { buffer: lastBuffer!, pageCount: lastPageCount, styleLevel: 3 };
}

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
    const resolvedStyle = payload.resumeStyle ?? DEFAULT_RESUME_STYLE;
    logResumeStats(payload.tailoredResume, resolvedStyle);
    const filename = buildResumePdfFilename({
      resume: payload.tailoredResume,
      role: payload.role,
    });
    const { buffer: pdfBuffer, pageCount } = await renderWithAdaptiveFit(payload.tailoredResume, resolvedStyle);
    console.log("[export-pdf] page count:", pageCount);

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
