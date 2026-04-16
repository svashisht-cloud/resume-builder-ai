import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import type { TailoredResume } from "@/types";

const FONT = "Times New Roman";
// Content width for LETTER (8.5") with 0.5" margins: 7.5" = 7.5 * 1440 = 10800 twips
const RIGHT_TAB = 10800;

function present(v: string | null | undefined): string | null {
  return v?.trim() ? v.trim() : null;
}

function capitalize(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: title.toUpperCase(), bold: true, size: 24, font: FONT }),
    ],
    border: {
      bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    spacing: { before: 120, after: 40 },
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: capitalize(text), size: 21, font: FONT })],
    bullet: { level: 0 },
    spacing: { before: 0, after: 20 },
  });
}

export async function buildResumeDocxBuffer(resume: TailoredResume): Promise<Buffer> {
  const children: Paragraph[] = [];

  // ── Header ──────────────────────────────────────────────────────────────
  const name = present(resume.contact.name) ?? "Resume";
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: name, bold: true, size: 40, font: FONT })],
      spacing: { after: 60 },
    }),
  );

  const infoItems = [
    present(resume.contact.email),
    present(resume.contact.phone),
    present(resume.contact.location),
  ].filter((v): v is string => v !== null);

  if (infoItems.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: infoItems.join("  |  "), size: 21, font: FONT })],
        spacing: { after: 20 },
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
        children: [new TextRun({ text: linkItems.join("  |  "), size: 21, font: FONT })],
        spacing: { after: 20 },
      }),
    );
  }

  // ── Education ────────────────────────────────────────────────────────────
  if (resume.education.length > 0) {
    children.push(sectionHeader("Education"));
    for (const edu of resume.education) {
      const institutionRuns: TextRun[] = [
        new TextRun({ text: edu.institution, bold: true, size: 22, font: FONT }),
      ];
      if (present(edu.location)) {
        institutionRuns.push(
          new TextRun({ text: `, ${edu.location}`, italics: true, size: 22, font: FONT }),
        );
      }
      if (present(edu.date)) {
        institutionRuns.push(new TextRun({ text: "\t", size: 22, font: FONT }));
        institutionRuns.push(
          new TextRun({ text: edu.date!, bold: true, size: 21, font: FONT }),
        );
      }
      children.push(
        new Paragraph({
          children: institutionRuns,
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
          spacing: { before: 60, after: 0 },
        }),
      );
      const degreeText = [edu.degree, edu.gpa ? `GPA: ${edu.gpa}` : null]
        .filter(Boolean)
        .join(", ");
      children.push(
        new Paragraph({
          children: [new TextRun({ text: degreeText, italics: true, size: 21, font: FONT })],
          spacing: { before: 0, after: 60 },
        }),
      );
    }
  }

  // ── Technical Skills ──────────────────────────────────────────────────────
  if (resume.skills.length > 0) {
    children.push(sectionHeader("Technical Skills"));
    for (const group of resume.skills) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${group.category}: `, bold: true, size: 22, font: FONT }),
            new TextRun({ text: group.items.join(", "), size: 21, font: FONT }),
          ],
          spacing: { before: 0, after: 20 },
        }),
      );
    }
  }

  // ── Work Experience ───────────────────────────────────────────────────────
  if (resume.experience.length > 0) {
    children.push(sectionHeader("Work Experience"));
    for (const exp of resume.experience) {
      const companyRuns: TextRun[] = [
        new TextRun({ text: exp.company, bold: true, size: 22, font: FONT }),
      ];
      if (present(exp.location)) {
        companyRuns.push(new TextRun({ text: "\t", size: 22, font: FONT }));
        companyRuns.push(
          new TextRun({ text: exp.location!, italics: true, size: 21, font: FONT }),
        );
      }
      children.push(
        new Paragraph({
          children: companyRuns,
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
          spacing: { before: 60, after: 0 },
        }),
      );

      const titleRuns: TextRun[] = [
        new TextRun({ text: exp.title, italics: true, size: 22, font: FONT }),
      ];
      if (present(exp.dates)) {
        titleRuns.push(new TextRun({ text: "\t", size: 22, font: FONT }));
        titleRuns.push(
          new TextRun({ text: exp.dates!, bold: true, size: 21, font: FONT }),
        );
      }
      children.push(
        new Paragraph({
          children: titleRuns,
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
          spacing: { before: 0, after: 0 },
        }),
      );

      for (const b of exp.bullets) {
        children.push(bulletParagraph(b.text));
      }
      // Small gap after each experience block
      children.push(new Paragraph({ children: [], spacing: { after: 40 } }));
    }
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  if (resume.projects.length > 0) {
    children.push(sectionHeader("Projects"));
    for (const proj of resume.projects) {
      const nameText = present(proj.techStack)
        ? `${proj.name} (${proj.techStack})`
        : proj.name;
      const projRuns: TextRun[] = [
        new TextRun({ text: nameText, bold: true, italics: true, size: 22, font: FONT }),
      ];
      if (present(proj.date)) {
        projRuns.push(new TextRun({ text: "\t", size: 22, font: FONT }));
        projRuns.push(
          new TextRun({ text: proj.date!, bold: true, size: 21, font: FONT }),
        );
      }
      children.push(
        new Paragraph({
          children: projRuns,
          tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
          spacing: { before: 60, after: 0 },
        }),
      );
      for (const b of proj.bullets) {
        children.push(bulletParagraph(b));
      }
      children.push(new Paragraph({ children: [], spacing: { after: 40 } }));
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (resume.certifications.length > 0) {
    children.push(sectionHeader("Certifications"));
    for (const cert of resume.certifications) {
      children.push(bulletParagraph(cert));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
