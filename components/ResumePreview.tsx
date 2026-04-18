import { Fragment } from "react";
import type { TailoredResume, SectionKey } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/resume/detect-section-order";

const TIMES = '"Times New Roman", Times, serif';

function present(v: string | null | undefined): string | null {
  return v?.trim() ? v.trim() : null;
}

function capitalize(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-1 mt-2">
      <h2
        className="text-[12pt] font-bold uppercase text-black"
        style={{ fontFamily: TIMES }}
      >
        {title}
      </h2>
      <hr className="mt-0.5 border-t border-black" />
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="ml-4 list-disc">
      {items.map((item, i) => (
        <li
          className="text-[10.5pt] leading-[1.3] text-black"
          key={`${item}-${i}`}
          style={{ fontFamily: TIMES }}
        >
          {capitalize(item)}
        </li>
      ))}
    </ul>
  );
}

export function ResumePreview({ resume }: { resume: TailoredResume }) {
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

  function renderSection(key: SectionKey): React.ReactElement | null {
    switch (key) {
      case "summary":
        return null; // summary not rendered in preview

      case "education":
        return hasEducation ? (
          <Fragment key="education">
            <SectionHeader title="Education" />
            <div className="space-y-1.5">
              {resume.education.map((edu) => (
                <div className="break-inside-avoid" key={`${edu.institution}-${edu.degree}`}>
                  {/* Institution ←→ Date */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-[11pt] font-bold leading-snug text-black"
                      style={{ fontFamily: TIMES }}
                    >
                      {edu.institution}
                      {present(edu.location) ? (
                        <span className="italic">{`, ${edu.location}`}</span>
                      ) : ""}
                    </span>
                    {present(edu.date) && (
                      <span
                        className="shrink-0 text-[10.5pt] font-bold leading-snug text-black"
                        style={{ fontFamily: TIMES }}
                      >
                        {edu.date}
                      </span>
                    )}
                  </div>
                  {/* Degree + GPA */}
                  <p
                    className="text-[10.5pt] italic leading-snug text-black"
                    style={{ fontFamily: TIMES }}
                  >
                    {edu.degree}
                    {present(edu.gpa) ? `, GPA: ${edu.gpa}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Fragment>
        ) : null;

      case "skills":
        return hasSkills ? (
          <Fragment key="skills">
            <SectionHeader title="Technical Skills" />
            <div className="space-y-0.5">
              {resume.skills.map((group) => (
                <div className="flex items-baseline" key={group.category}>
                  <span
                    className="shrink-0 w-[170px] text-[11pt] font-bold leading-[1.3] text-black"
                    style={{ fontFamily: TIMES }}
                  >
                    {group.category}:
                  </span>
                  <span
                    className="text-[10.5pt] leading-[1.3] text-black"
                    style={{ fontFamily: TIMES }}
                  >
                    {group.items.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </Fragment>
        ) : null;

      case "experience":
        return hasExperience ? (
          <Fragment key="experience">
            <SectionHeader title="Work Experience" />
            <div className="space-y-2">
              {resume.experience.map((exp) => (
                <div className="break-inside-avoid" key={exp.sourceExperienceId}>
                  {/* Company ←→ Dates */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-[11pt] font-bold leading-snug text-black"
                      style={{ fontFamily: TIMES }}
                    >
                      {exp.company}
                    </span>
                    {present(exp.dates) && (
                      <span
                        className="shrink-0 text-[10.5pt] font-bold leading-snug text-black"
                        style={{ fontFamily: TIMES }}
                      >
                        {exp.dates}
                      </span>
                    )}
                  </div>
                  {/* Role ←→ Location */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-[11pt] italic leading-snug text-black"
                      style={{ fontFamily: TIMES }}
                    >
                      {exp.title}
                    </span>
                    {present(exp.location) && (
                      <span
                        className="shrink-0 text-[10.5pt] italic leading-snug text-black"
                        style={{ fontFamily: TIMES }}
                      >
                        {exp.location}
                      </span>
                    )}
                  </div>
                  {exp.bullets.length > 0 && (
                    <BulletList items={exp.bullets.map((b) => b.text)} />
                  )}
                </div>
              ))}
            </div>
          </Fragment>
        ) : null;

      case "projects":
        return hasProjects ? (
          <Fragment key="projects">
            <SectionHeader title="Projects" />
            <div className="space-y-2">
              {resume.projects.map((proj) => (
                <div className="break-inside-avoid" key={proj.name}>
                  {/* Name (tech stack) [- URL] ←→ Date */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-[11pt] font-bold italic leading-snug text-black"
                      style={{ fontFamily: TIMES }}
                    >
                      {proj.name}
                      {present(proj.techStack) && ` (${proj.techStack})`}
                      {present(proj.url) && " - "}
                      {present(proj.url) && (
                        <a
                          href={proj.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {proj.url}
                        </a>
                      )}
                    </span>
                    {present(proj.date) && (
                      <span
                        className="shrink-0 text-[10.5pt] font-bold leading-snug text-black"
                        style={{ fontFamily: TIMES }}
                      >
                        {proj.date}
                      </span>
                    )}
                  </div>
                  {proj.bullets.length > 0 && <BulletList items={proj.bullets} />}
                </div>
              ))}
            </div>
          </Fragment>
        ) : null;

      case "certifications":
        return hasCertifications ? (
          <Fragment key="certifications">
            <SectionHeader title="Certifications" />
            <BulletList items={resume.certifications} />
          </Fragment>
        ) : null;

      default:
        return null;
    }
  }

  return (
    <article
      className="resume-document min-h-[11in] w-full max-w-[816px] bg-white px-[42px] py-[40px] text-black print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none"
      style={{ fontFamily: TIMES }}
    >
      {/* ── Header ── */}
      <header className="mb-0.5 text-center">
        <h1
          className="text-[20pt] font-bold leading-tight text-black"
          style={{ fontFamily: TIMES }}
        >
          {name}
        </h1>
        {present(resume.contact.roleSubtitle) && (
          <p
            className="mt-0.5 text-[11pt] leading-snug text-black"
            style={{ fontFamily: TIMES }}
          >
            {resume.contact.roleSubtitle}
          </p>
        )}
        {infoItems.length > 0 && (
          <p
            className="mt-1 text-[10.5pt] leading-snug text-black"
            style={{ fontFamily: TIMES }}
          >
            {infoItems.join("  |  ")}
          </p>
        )}
        {linkItems.length > 0 && (
          <p
            className="mt-0.5 text-[10.5pt] leading-snug text-black"
            style={{ fontFamily: TIMES }}
          >
            {linkItems.join("  |  ")}
          </p>
        )}
      </header>

      {/* ── Sections in source-detected order ── */}
      {(resume.sectionOrder ?? DEFAULT_SECTION_ORDER).map(renderSection)}
    </article>
  );
}
