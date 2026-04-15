import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type React from "react";
import type { TailoredResume } from "@/types";

const BLACK = "#000000";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingRight: 32,
    paddingBottom: 30,
    paddingLeft: 32,
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    lineHeight: 1.3,
    color: BLACK,
  },
  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    textAlign: "center",
    marginBottom: 3,
  },
  name: {
    fontSize: 20,
    fontFamily: "Times-Bold",
    color: BLACK,
    marginBottom: 8,
  },
  contactLine: {
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    color: BLACK,
    marginTop: 1,
  },
  // ── Section ─────────────────────────────────────────────────────────────
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: BLACK,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  sectionRule: {
    borderBottomWidth: 0.75,
    borderBottomColor: BLACK,
    marginBottom: 2,
  },
  // ── Experience ───────────────────────────────────────────────────────────
  expBlock: {
    marginBottom: 4,
  },
  twoColRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  companyText: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: BLACK,
  },
  roleText: {
    fontSize: 11,
    fontFamily: "Times-Italic",
    color: BLACK,
  },
  locationText: {
    fontSize: 10.5,
    fontFamily: "Times-Italic",
    color: BLACK,
  },
  datesText: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    color: BLACK,
  },
  // ── Projects ──────────────────────────────────────────────────────────────
  projectName: {
    fontSize: 11,
    fontFamily: "Times-BoldItalic",
    color: BLACK,
  },
  projectTech: {
    fontSize: 10.5,
    fontFamily: "Times-Italic",
    color: BLACK,
    marginBottom: 1,
  },
  // ── Education ─────────────────────────────────────────────────────────────
  institutionText: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: BLACK,
  },
  degreeText: {
    fontSize: 10.5,
    fontFamily: "Times-Italic",
    color: BLACK,
  },
  // ── Skills ───────────────────────────────────────────────────────────────
  skillRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  skillCategory: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: BLACK,
    flexShrink: 0,
    marginRight: 8,
  },
  skillItems: {
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    color: BLACK,
    flex: 1,
  },
  // ── Bullets ──────────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 8,
  },
  bulletMarker: {
    width: 8,
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    color: BLACK,
  },
  bulletText: {
    flex: 1,
    fontSize: 10.5,
    fontFamily: "Times-Roman",
    color: BLACK,
  },
});

function present(v: string | null | undefined): string | null {
  return v?.trim() ? v.trim() : null;
}

function capitalize(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function PdfSectionHeader({ title }: { title: string }) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={styles.sectionRule} />
    </>
  );
}

function PdfBulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={`${item}-${i}`} style={styles.bulletRow}>
          <Text style={styles.bulletMarker}>•</Text>
          <Text style={styles.bulletText}>{capitalize(item)}</Text>
        </View>
      ))}
    </View>
  );
}

export function ResumePDFDocument({
  resume,
}: {
  resume: TailoredResume;
}): React.ReactElement {
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

  return (
    <Document
      author={name}
      creator="Resume Builder"
      producer="Resume Builder"
      title={`${name} Resume`}
    >
      <Page size="LETTER" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          {hasInfoItems && (
            <Text style={styles.contactLine}>{infoItems.join("  |  ")}</Text>
          )}
          {hasLinkItems && (
            <Text style={styles.contactLine}>{linkItems.join("  |  ")}</Text>
          )}
        </View>

        {/* Experience */}
        {hasExperience && (
          <View style={styles.section}>
            <PdfSectionHeader title="Work Experience" />
            {resume.experience.map((exp) => (
              <View key={exp.sourceExperienceId} style={styles.expBlock} wrap={false}>
                {/* Company ←→ Location */}
                <View style={styles.twoColRow}>
                  <Text style={styles.companyText}>{exp.company}</Text>
                  {present(exp.location) && (
                    <Text style={styles.locationText}>{exp.location}</Text>
                  )}
                </View>
                {/* Role ←→ Dates */}
                <View style={styles.twoColRow}>
                  <Text style={styles.roleText}>{exp.title}</Text>
                  {present(exp.dates) && (
                    <Text style={styles.datesText}>{exp.dates}</Text>
                  )}
                </View>
                {exp.bullets.length > 0 && (
                  <PdfBulletList items={exp.bullets.map((b) => b.text)} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {hasProjects && (
          <View style={styles.section}>
            <PdfSectionHeader title="Projects" />
            {resume.projects.map((proj) => (
              <View key={proj.name} style={styles.expBlock} wrap={false}>
                <View style={styles.twoColRow}>
                  <Text style={styles.projectName}>
                    {proj.name}
                    {present(proj.techStack) ? (
                      <Text style={styles.projectTech}> ({proj.techStack})</Text>
                    ) : ""}
                  </Text>
                  {present(proj.date) && (
                    <Text style={styles.datesText}>{proj.date}</Text>
                  )}
                </View>
                {proj.bullets.length > 0 && <PdfBulletList items={proj.bullets} />}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {hasEducation && (
          <View style={styles.section}>
            <PdfSectionHeader title="Education" />
            {resume.education.map((edu) => (
              <View
                key={`${edu.institution}-${edu.degree}`}
                style={styles.expBlock}
                wrap={false}
              >
                <View style={styles.twoColRow}>
                  <Text style={styles.institutionText}>
                    {edu.institution}
                    {present(edu.location) ? (
                      <Text style={styles.locationText}>{`, ${edu.location}`}</Text>
                    ) : ""}
                  </Text>
                  {present(edu.date) && (
                    <Text style={styles.datesText}>{edu.date}</Text>
                  )}
                </View>
                <Text style={styles.degreeText}>
                  {edu.degree}
                  {present(edu.gpa) ? `, GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills */}
        {hasSkills && (
          <View style={styles.section}>
            <PdfSectionHeader title="Technical Skills" />
            {resume.skills.map((group) => (
              <View key={group.category} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{group.category}:</Text>
                <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {hasCertifications && (
          <View style={styles.section}>
            <PdfSectionHeader title="Certifications" />
            <PdfBulletList items={resume.certifications} />
          </View>
        )}
      </Page>
    </Document>
  );
}
