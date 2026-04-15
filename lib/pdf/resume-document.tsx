import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type React from "react";
import type { ContactInfo, TailoredResume } from "@/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingRight: 40,
    paddingBottom: 34,
    paddingLeft: 40,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.35,
    color: "#27272a",
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#09090b",
    marginBottom: 5,
  },
  contactLine: {
    fontSize: 9,
    color: "#3f3f46",
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d8",
    borderBottomStyle: "solid",
    color: "#09090b",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    marginBottom: 6,
    paddingBottom: 3,
    textTransform: "uppercase",
  },
  bodyText: {
    fontSize: 9.5,
  },
  experienceItem: {
    marginBottom: 8,
  },
  experienceHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 3,
  },
  title: {
    color: "#09090b",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  company: {
    color: "#27272a",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
  },
  dates: {
    color: "#52525b",
    fontSize: 9,
    textAlign: "right",
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  bulletMarker: {
    width: 10,
    color: "#52525b",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
  },
});

function present(value: string | null | undefined) {
  return value?.trim() ? value.trim() : null;
}

function PdfHeader({ contact }: { contact: ContactInfo }) {
  const contactItems = [
    present(contact.email),
    present(contact.phone),
    present(contact.location),
    ...contact.links.map((link) => present(link)),
  ].filter((item): item is string => Boolean(item));

  return (
    <View style={styles.header}>
      <Text style={styles.name}>{present(contact.name) ?? "Tailored Resume"}</Text>
      {contactItems.length > 0 ? (
        <Text style={styles.contactLine}>{contactItems.join(" | ")}</Text>
      ) : null}
    </View>
  );
}

function PdfSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PdfBulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <View style={styles.bulletRow} key={`${item}-${index}`}>
          <Text style={styles.bulletMarker}>-</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ResumePdfDocument({ resume }: { resume: TailoredResume }) {
  return (
    <Document
      author={present(resume.contact.name) ?? undefined}
      creator="Resume Builder"
      producer="Resume Builder"
      title={`${present(resume.contact.name) ?? "Tailored"} Resume`}
    >
      <Page size="LETTER" style={styles.page} wrap>
        <PdfHeader contact={resume.contact} />

        {resume.summary.trim() ? (
          <PdfSection title="Professional Summary">
            <Text style={styles.bodyText}>{resume.summary}</Text>
          </PdfSection>
        ) : null}

        {resume.skills.length > 0 ? (
          <PdfSection title="Skills">
            <Text style={styles.bodyText}>{resume.skills.join(" | ")}</Text>
          </PdfSection>
        ) : null}

        {resume.experience.length > 0 ? (
          <PdfSection title="Experience">
            {resume.experience.map((experience) => (
              <View
                key={experience.sourceExperienceId}
                style={styles.experienceItem}
              >
                <View style={styles.experienceHeading}>
                  <View>
                    <Text style={styles.title}>{experience.title}</Text>
                    <Text style={styles.company}>
                      {experience.company}
                      {experience.location ? `, ${experience.location}` : ""}
                    </Text>
                  </View>
                  {experience.dates ? (
                    <Text style={styles.dates}>{experience.dates}</Text>
                  ) : null}
                </View>
                {experience.bullets.length > 0 ? (
                  <PdfBulletList
                    items={experience.bullets.map((bullet) => bullet.text)}
                  />
                ) : null}
              </View>
            ))}
          </PdfSection>
        ) : null}

        {resume.projects.length > 0 ? (
          <PdfSection title="Projects">
            {resume.projects.map((project) => (
              <View key={project.name} style={{ marginBottom: 4 }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5 }}>
                  {project.name}{project.date ? ` — ${project.date}` : ""}
                </Text>
                {project.techStack ? (
                  <Text style={{ fontFamily: "Helvetica-Oblique", fontSize: 9 }}>
                    {project.techStack}
                  </Text>
                ) : null}
                {project.bullets.length > 0 ? (
                  <PdfBulletList items={project.bullets} />
                ) : null}
              </View>
            ))}
          </PdfSection>
        ) : null}

        {resume.education.length > 0 ? (
          <PdfSection title="Education">
            {resume.education.map((edu) => (
              <View key={`${edu.institution}-${edu.degree}`} style={{ marginBottom: 4 }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5 }}>
                  {edu.institution}{edu.location ? `, ${edu.location}` : ""}{edu.date ? ` — ${edu.date}` : ""}
                </Text>
                <Text style={{ fontFamily: "Helvetica-Oblique", fontSize: 9 }}>
                  {edu.degree}{edu.gpa ? `, GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </PdfSection>
        ) : null}

        {resume.certifications.length > 0 ? (
          <PdfSection title="Certifications">
            <PdfBulletList items={resume.certifications} />
          </PdfSection>
        ) : null}
      </Page>
    </Document>
  );
}
