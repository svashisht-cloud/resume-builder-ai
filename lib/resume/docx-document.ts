import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  LineRuleType,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
  UnderlineType,
} from "docx";
import type { TailoredResume, SectionKey, ResumeStyle } from "@/types";
import { DEFAULT_RESUME_STYLE } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/resume/detect-section-order";

// Content width for LETTER (8.5") with 32pt (640 twip) side margins: 8.5" - 0.444"×2 = 7.611" = 10960 twips
const RIGHT_TAB = 10960;
// Skills category column width: 150 PDF pt = 150 × 20 twips = 3000 twips (matches PDF fixed-width column)
const SKILL_TAB = 3000;

const DOCX_FONT: Record<ResumeStyle["fontFamily"], string> = {
  times: "Times New Roman",
  helvetica: "Arial",
};
// Font sizes in half-points (docx unit): pt × 2
const NAME_HSZ: Record<ResumeStyle["nameSize"], number> = { small: 36, medium: 40, large: 44 };
const HEADER_HSZ: Record<ResumeStyle["headerSize"], number> = { small: 22, medium: 24, large: 26 };
const BODY_HSZ: Record<ResumeStyle["bodySize"], number> = { small: 19, medium: 21, large: 23 };
// Line height in twips (240 = single spacing)
const LINE_HEIGHT_MAP: Record<ResumeStyle["bulletSpacing"], number> = { compact: 230, normal: 264, relaxed: 330 };
// Section spacing before (twips)
const SECTION_BEFORE: Record<ResumeStyle["sectionSpacing"], number> = { compact: 60, normal: 120, relaxed: 200 };

function present(v: string | null | undefined): string | null {
  return v?.trim() ? v.trim() : null;
}

function capitalize(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export async function buildResumeDocxBuffer(resume: TailoredResume, style: ResumeStyle = DEFAULT_RESUME_STYLE): Promise<Buffer> {
  const FONT = DOCX_FONT[style.fontFamily];
  const NAME_SZ = NAME_HSZ[style.nameSize];
  const HEADER_SZ = HEADER_HSZ[style.headerSize];
  const BODY_SZ = BODY_HSZ[style.bodySize];
  const LINE_HEIGHT = LINE_HEIGHT_MAP[style.bulletSpacing];
  const SEC_BEFORE = SECTION_BEFORE[style.sectionSpacing];

  function sectionHeader(title: string): Paragraph {
    return new Paragraph({
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: HEADER_SZ, font: FONT })],
      border: { bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 } },
      spacing: { before: SEC_BEFORE, after: 20, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
    });
  }

  function bulletParagraph(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({ text: "•  ", size: BODY_SZ, font: FONT }),
        new TextRun({ text: capitalize(text), size: BODY_SZ, font: FONT }),
      ],
      indent: { left: 240, hanging: 160 },
      spacing: { before: 0, after: 60, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
    });
  }
  const children: Paragraph[] = [];

  // ── Header ──────────────────────────────────────────────────────────────
  const name = present(resume.contact.name) ?? "Resume";
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: name, bold: true, size: NAME_SZ, font: FONT })],
      spacing: { after: 20, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
    }),
  );

  if (present(resume.contact.roleSubtitle)) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: resume.contact.roleSubtitle!, size: BODY_SZ + 1, font: FONT })],
        spacing: { after: 20, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
      }),
    );
  }

  const infoItems = [
    present(resume.contact.email),
    present(resume.contact.phone),
    present(resume.contact.location),
  ].filter((v): v is string => v !== null);

  if (infoItems.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: infoItems.join("  |  "), size: BODY_SZ, font: FONT })],
        spacing: { after: 20, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
      }),
    );
  }

  const linkItems = resume.contact.links
    .map((l) => present(l))
    .filter((v): v is string => v !== null);

  if (linkItems.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: linkItems.join("  |  "), size: BODY_SZ, font: FONT })],
        spacing: { after: 20, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
      }),
    );
  }

  // ── Sections in source-detected order ────────────────────────────────────
  for (const key of (resume.sectionOrder ?? DEFAULT_SECTION_ORDER) as SectionKey[]) {
    switch (key) {
      case "summary":
        // summary not rendered in DOCX output
        break;

      case "education":
        if (resume.education.length > 0) {
          children.push(sectionHeader("Education"));
          for (const edu of resume.education) {
            const institutionRuns: TextRun[] = [
              new TextRun({ text: edu.institution, bold: true, size: BODY_SZ + 1, font: FONT }),
            ];
            if (present(edu.location)) {
              institutionRuns.push(
                new TextRun({ text: `, ${edu.location}`, italics: true, size: BODY_SZ, font: FONT }),
              );
            }
            if (present(edu.date)) {
              institutionRuns.push(new TextRun({ text: "\t", size: BODY_SZ + 1, font: FONT }));
              institutionRuns.push(
                new TextRun({ text: edu.date!, bold: true, size: BODY_SZ, font: FONT }),
              );
            }
            children.push(
              new Paragraph({
                children: institutionRuns,
                tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
                spacing: { before: 60, after: 0, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
              }),
            );
            const degreeText = [edu.degree, edu.gpa ? `GPA: ${edu.gpa}` : null]
              .filter(Boolean)
              .join(", ");
            children.push(
              new Paragraph({
                children: [new TextRun({ text: degreeText, italics: true, size: BODY_SZ, font: FONT })],
                spacing: { before: 0, after: 60, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
              }),
            );
          }
        }
        break;

      case "skills":
        if (resume.skills.length > 0) {
          children.push(sectionHeader("Technical Skills"));
          for (const group of resume.skills) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${group.category}:`, bold: true, size: BODY_SZ + 1, font: FONT }),
                  new TextRun({ text: "\t", size: BODY_SZ + 1, font: FONT }),
                  new TextRun({ text: group.items.join(", "), size: BODY_SZ, font: FONT }),
                ],
                tabStops: [{ type: TabStopType.LEFT, position: SKILL_TAB }],
                spacing: { before: 0, after: 20, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
              }),
            );
          }
        }
        break;

      case "experience":
        if (resume.experience.length > 0) {
          children.push(sectionHeader("Work Experience"));
          for (const exp of resume.experience) {
            // Line 1: Company ←→ Dates
            const companyRuns: TextRun[] = [
              new TextRun({ text: exp.company, bold: true, size: BODY_SZ + 1, font: FONT }),
            ];
            if (present(exp.dates)) {
              companyRuns.push(new TextRun({ text: "\t", size: BODY_SZ + 1, font: FONT }));
              companyRuns.push(
                new TextRun({ text: exp.dates!, bold: true, size: BODY_SZ, font: FONT }),
              );
            }
            children.push(
              new Paragraph({
                children: companyRuns,
                tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
                spacing: { before: 60, after: 0, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
              }),
            );

            // Line 2: Role ←→ Location
            const titleRuns: TextRun[] = [
              new TextRun({ text: exp.title, italics: true, size: BODY_SZ + 1, font: FONT }),
            ];
            if (present(exp.location)) {
              titleRuns.push(new TextRun({ text: "\t", size: BODY_SZ + 1, font: FONT }));
              titleRuns.push(
                new TextRun({ text: exp.location!, italics: true, size: BODY_SZ, font: FONT }),
              );
            }
            children.push(
              new Paragraph({
                children: titleRuns,
                tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
                spacing: { before: 0, after: 0, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
              }),
            );

            for (const b of exp.bullets) {
              children.push(bulletParagraph(b.text));
            }
          }
        }
        break;

      case "projects":
        if (resume.projects.length > 0) {
          children.push(sectionHeader("Projects"));
          for (const proj of resume.projects) {
            const nameText = present(proj.techStack)
              ? `${proj.name} (${proj.techStack})`
              : proj.name;
            const projRuns: (TextRun | ExternalHyperlink)[] = [
              new TextRun({ text: nameText, bold: true, italics: true, size: BODY_SZ + 1, font: FONT }),
            ];
            if (present(proj.url)) {
              projRuns.push(
                new TextRun({ text: " - ", bold: true, italics: true, size: BODY_SZ + 1, font: FONT }),
              );
              projRuns.push(
                new ExternalHyperlink({
                  link: proj.url!,
                  children: [
                    new TextRun({
                      text: proj.url!,
                      bold: true,
                      italics: true,
                      size: BODY_SZ + 1,
                      font: FONT,
                      color: "000000",
                      underline: { type: UnderlineType.NONE },
                    }),
                  ],
                }),
              );
            }
            if (present(proj.date)) {
              projRuns.push(new TextRun({ text: "\t", size: BODY_SZ + 1, font: FONT }));
              projRuns.push(
                new TextRun({ text: proj.date!, bold: true, size: BODY_SZ, font: FONT }),
              );
            }
            children.push(
              new Paragraph({
                children: projRuns,
                tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
                spacing: { before: 60, after: 0, line: LINE_HEIGHT, lineRule: LineRuleType.AUTO },
              }),
            );
            for (const b of proj.bullets) {
              children.push(bulletParagraph(b));
            }
          }
        }
        break;

      case "certifications":
        if (resume.certifications.length > 0) {
          children.push(sectionHeader("Certifications"));
          for (const cert of resume.certifications) {
            children.push(bulletParagraph(cert));
          }
        }
        break;

      default:
        break;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            // 30pt top/bottom, 32pt sides — matches PDF paddingTop:30 / paddingLeft:32 (in PDF points → twips ×20)
            margin: { top: 600, right: 640, bottom: 600, left: 640 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
