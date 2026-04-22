import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type React from "react";
import type { TailoredResume, SectionKey, ResumeStyle } from "@/types";
import { DEFAULT_RESUME_STYLE } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/resume/detect-section-order";

const BLACK = "#000000";

// PDF font names for each fontFamily option (built-in PDF standard fonts)
const PDF_FONT: Record<ResumeStyle["fontFamily"], { normal: string; bold: string; italic: string; boldItalic: string }> = {
  times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italic: "Times-Italic",
    boldItalic: "Times-BoldItalic",
  },
  helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique",
    boldItalic: "Helvetica-BoldOblique",
  },
};

const NAME_PT: Record<ResumeStyle["nameSize"], number> = { small: 18, medium: 20, large: 22 };
const HEADER_PT: Record<ResumeStyle["headerSize"], number> = { small: 11, medium: 12, large: 13 };
const BODY_PT: Record<ResumeStyle["bodySize"], number> = { small: 9.5, medium: 10.5, large: 11.5 };
const BULLET_LEADING: Record<ResumeStyle["bulletSpacing"], number> = { compact: 1.15, normal: 1.27, relaxed: 1.5 };
const SECTION_MT: Record<ResumeStyle["sectionSpacing"], number> = { compact: 1, normal: 3, relaxed: 6 };
const ITEM_MB: Record<ResumeStyle["sectionSpacing"], number> = { compact: 2, normal: 4, relaxed: 7 };

function makeStyles(style: ResumeStyle) {
  const font = PDF_FONT[style.fontFamily];
  const namePt = NAME_PT[style.nameSize];
  const headerPt = HEADER_PT[style.headerSize];
  const bodyPt = BODY_PT[style.bodySize];
  const leading = BULLET_LEADING[style.bulletSpacing];
  const sectionMt = SECTION_MT[style.sectionSpacing];
  const itemMb = ITEM_MB[style.sectionSpacing];

  return StyleSheet.create({
    page: {
      paddingTop: 30,
      paddingRight: 32,
      paddingBottom: 30,
      paddingLeft: 32,
      fontFamily: font.normal,
      fontSize: bodyPt,
      lineHeight: leading,
      color: BLACK,
    },
    header: { textAlign: "center", marginBottom: 3 },
    name: { fontSize: namePt, fontFamily: font.bold, color: BLACK, marginBottom: 10 },
    roleSubtitle: { fontSize: bodyPt + 0.5, fontFamily: font.normal, color: BLACK, marginBottom: 2 },
    contactLine: { fontSize: bodyPt, fontFamily: font.normal, color: BLACK, marginTop: 1 },
    section: { marginTop: sectionMt },
    sectionTitle: { fontSize: headerPt, fontFamily: font.bold, color: BLACK, textTransform: "uppercase", marginBottom: 1 },
    sectionRule: { borderBottomWidth: 0.75, borderBottomColor: BLACK, marginBottom: 2 },
    expBlock: { marginBottom: itemMb },
    twoColRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    companyText: { fontSize: bodyPt + 0.5, fontFamily: font.bold, color: BLACK },
    roleText: { fontSize: bodyPt + 0.5, fontFamily: font.italic, color: BLACK },
    locationText: { fontSize: bodyPt, fontFamily: font.italic, color: BLACK },
    datesText: { fontSize: bodyPt, fontFamily: font.bold, color: BLACK },
    projectName: { fontSize: bodyPt + 0.5, fontFamily: font.boldItalic, color: BLACK },
    projectTech: { fontSize: bodyPt, fontFamily: font.italic, color: BLACK, marginBottom: 1 },
    institutionText: { fontSize: bodyPt + 0.5, fontFamily: font.bold, color: BLACK },
    degreeText: { fontSize: bodyPt, fontFamily: font.italic, color: BLACK },
    skillRow: { flexDirection: "row", flexWrap: "nowrap", marginBottom: 1 },
    skillCategory: { fontSize: bodyPt + 0.5, fontFamily: font.bold, color: BLACK, width: 150 },
    skillItems: { fontSize: bodyPt, fontFamily: font.normal, color: BLACK, flex: 1 },
    projectUrl: { fontSize: 9, fontFamily: font.normal, color: "#1155CC" },
    bulletRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
    bulletMarker: { width: 8, fontSize: bodyPt, fontFamily: font.normal, color: BLACK },
    bulletText: { flex: 1, fontSize: bodyPt, fontFamily: font.normal, color: BLACK },
  });
}

type PdfStyles = ReturnType<typeof makeStyles>;

function present(v: string | null | undefined): string | null {
  return v?.trim() ? v.trim() : null;
}

function capitalize(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function PdfSectionHeader({ title, styles }: { title: string; styles: PdfStyles }) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={styles.sectionRule} />
    </>
  );
}

function PdfBulletList({ items, styles }: { items: string[]; styles: PdfStyles }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={`${item}-${i}`} style={styles.bulletRow} wrap={false}>
          <Text style={styles.bulletMarker}>•</Text>
          <Text style={styles.bulletText}>{capitalize(item)}</Text>
        </View>
      ))}
    </View>
  );
}

export function ResumePDFDocument({
  resume,
  resumeStyle = DEFAULT_RESUME_STYLE,
}: {
  resume: TailoredResume;
  resumeStyle?: ResumeStyle;
}): React.ReactElement {
  const styles = makeStyles(resumeStyle);

  const name = present(resume.contact.name) ?? "Resume";

  const infoItems = [
    present(resume.contact.email),
    present(resume.contact.phone),
    present(resume.contact.location),
  ].filter((v): v is string => v !== null);

  const linkItems = resume.contact.links
    .map((l) => present(l))
    .filter((v): v is string => v !== null);

  const hasExperience = resume.experience.length > 0;
  const hasProjects = resume.projects.length > 0;
  const hasEducation = resume.education.length > 0;
  const hasSkills = resume.skills.length > 0;
  const hasCertifications = resume.certifications.length > 0;
  const hasInfoItems = infoItems.length > 0;
  const hasLinkItems = linkItems.length > 0;
  const hasRoleSubtitle = present(resume.contact.roleSubtitle) !== null;

  const sectionElements: Partial<Record<SectionKey, React.ReactElement>> = {};

  if (hasEducation) {
    sectionElements.education = (
      <View key="education" style={styles.section}>
        <PdfSectionHeader title="Education" styles={styles} />
        {resume.education.map((edu) => (
          <View key={`${edu.institution}-${edu.degree}`} style={styles.expBlock} wrap={false}>
            <View style={styles.twoColRow}>
              <Text style={styles.institutionText}>
                {edu.institution}
                {present(edu.location) ? (
                  <Text style={styles.locationText}>{`, ${edu.location}`}</Text>
                ) : ""}
              </Text>
              {present(edu.date) && <Text style={styles.datesText}>{edu.date}</Text>}
            </View>
            <Text style={styles.degreeText}>
              {edu.degree}
              {present(edu.gpa) ? `, GPA: ${edu.gpa}` : ""}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (hasSkills) {
    sectionElements.skills = (
      <View key="skills" style={styles.section}>
        <PdfSectionHeader title="Technical Skills" styles={styles} />
        {resume.skills.map((group) => (
          <View key={group.category} style={styles.skillRow}>
            <Text style={styles.skillCategory}>{group.category}:</Text>
            <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (hasExperience) {
    sectionElements.experience = (
      <View key="experience" style={styles.section}>
        <PdfSectionHeader title="Work Experience" styles={styles} />
        {resume.experience
          .reduce<{ company: string; location: string | null | undefined; entries: typeof resume.experience }[]>(
            (acc, exp) => {
              const last = acc[acc.length - 1];
              if (last && last.company === exp.company) {
                last.entries.push(exp);
              } else {
                acc.push({ company: exp.company, location: exp.location, entries: [exp] });
              }
              return acc;
            },
            [],
          )
          .map((group) =>
            group.entries.length === 1 ? (
              <View key={group.entries[0].sourceExperienceId} style={styles.expBlock}>
                <View style={styles.twoColRow}>
                  <Text style={styles.companyText}>{group.entries[0].company}</Text>
                  {present(group.entries[0].dates) && <Text style={styles.datesText}>{group.entries[0].dates}</Text>}
                </View>
                <View style={styles.twoColRow}>
                  <Text style={styles.roleText}>{group.entries[0].title}</Text>
                  {present(group.entries[0].location) && <Text style={styles.locationText}>{group.entries[0].location}</Text>}
                </View>
                {group.entries[0].bullets.length > 0 && <PdfBulletList items={group.entries[0].bullets.map((b) => b.text)} styles={styles} />}
              </View>
            ) : (
              <View key={group.company} style={styles.expBlock}>
                <View style={styles.twoColRow}>
                  <Text style={styles.companyText}>{group.company}</Text>
                  {present(group.location) && <Text style={styles.locationText}>{group.location}</Text>}
                </View>
                {group.entries.map((exp, i) => (
                  <View key={exp.sourceExperienceId} style={{ marginTop: i === 0 ? 0 : 4 }}>
                    <View style={styles.twoColRow}>
                      <Text style={styles.roleText}>{exp.title}</Text>
                      {present(exp.dates) && <Text style={styles.datesText}>{exp.dates}</Text>}
                    </View>
                    {exp.bullets.length > 0 && <PdfBulletList items={exp.bullets.map((b) => b.text)} styles={styles} />}
                  </View>
                ))}
              </View>
            ),
          )}
      </View>
    );
  }

  if (hasProjects) {
    sectionElements.projects = (
      <View key="projects" style={styles.section}>
        <PdfSectionHeader title="Projects" styles={styles} />
        {resume.projects.map((proj) => (
          <View key={proj.name} style={styles.expBlock}>
            <View style={styles.twoColRow}>
              <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" }}>
                <Text style={styles.projectName}>
                  {proj.name}
                  {present(proj.techStack) ? ` (${proj.techStack})` : ""}
                  {present(proj.url) ? " - " : ""}
                </Text>
                {present(proj.url) && (
                  <Link src={proj.url!}>
                    <Text style={styles.projectName}>{proj.url}</Text>
                  </Link>
                )}
              </View>
              {present(proj.date) && <Text style={styles.datesText}>{proj.date}</Text>}
            </View>
            {proj.bullets.length > 0 && <PdfBulletList items={proj.bullets} styles={styles} />}
          </View>
        ))}
      </View>
    );
  }

  if (hasCertifications) {
    sectionElements.certifications = (
      <View key="certifications" style={styles.section}>
        <PdfSectionHeader title="Certifications" styles={styles} />
        <PdfBulletList items={resume.certifications} styles={styles} />
      </View>
    );
  }

  return (
    <Document author={name} creator="Forte" producer="Forte" title={`${name} Resume`}>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {hasRoleSubtitle && <Text style={styles.roleSubtitle}>{resume.contact.roleSubtitle}</Text>}
          {hasInfoItems && <Text style={styles.contactLine}>{infoItems.join("  |  ")}</Text>}
          {hasLinkItems && <Text style={styles.contactLine}>{linkItems.join("  |  ")}</Text>}
        </View>
        {(resume.sectionOrder ?? DEFAULT_SECTION_ORDER)
          .filter((key) => key !== "summary")
          .map((key) => sectionElements[key] ?? null)}
      </Page>
    </Document>
  );
}
