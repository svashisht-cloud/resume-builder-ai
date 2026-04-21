import { createContext, Fragment, useContext } from "react";
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

const SelectionCtx = createContext<{
  selectedIds: Set<string>;
  onToggle: (id: string, text: string) => void;
} | null>(null);

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

function BulletList({ items, idPrefix }: { items: string[]; idPrefix: string }) {
  const ctx = useContext(SelectionCtx);
  return (
    <ul className="ml-4 list-disc">
      {items.map((item, i) => {
        const id = `${idPrefix}-${i}`;
        const selected = ctx?.selectedIds.has(id) ?? false;
        return ctx ? (
          <li
            key={id}
            onClick={() => ctx.onToggle(id, item)}
            className={`text-[10.5pt] leading-[1.3] cursor-pointer rounded-sm px-1 -mx-1 transition-colors duration-100 ${
              selected
                ? "bg-cyan-100 border-l-[3px] border-cyan-500 pl-2"
                : "text-black hover:bg-amber-100 hover:border-l-[2px] hover:border-amber-400"
            }`}
            style={{ fontFamily: TIMES }}
          >
            {capitalize(item)}
          </li>
        ) : (
          <li
            className="text-[10.5pt] leading-[1.3] text-black"
            key={id}
            style={{ fontFamily: TIMES }}
          >
            {capitalize(item)}
          </li>
        );
      })}
    </ul>
  );
}

export function ResumePreview({
  resume,
  interactiveMode,
  selectedItemIds,
  onItemToggle,
}: {
  resume: TailoredResume;
  interactiveMode?: boolean;
  selectedItemIds?: Map<string, string>;
  onItemToggle?: (id: string, text: string) => void;
}) {
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

  const selectionCtxValue =
    interactiveMode && onItemToggle
      ? {
          selectedIds: new Set(selectedItemIds?.keys() ?? []),
          onToggle: onItemToggle,
        }
      : null;

  function renderSection(key: SectionKey): React.ReactElement | null {
    switch (key) {
      case "summary":
        return null;

      case "education":
        return hasEducation ? (
          <Fragment key="education">
            <SectionHeader title="Education" />
            <div className="space-y-1.5">
              {resume.education.map((edu) => (
                <div className="break-inside-avoid" key={`${edu.institution}-${edu.degree}`}>
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
              {resume.skills.map((group, gi) => {
                const id = `skill-${gi}`;
                const text = `${group.category}: ${group.items.join(", ")}`;
                const selected = selectionCtxValue?.selectedIds.has(id) ?? false;
                return (
                  <div
                    key={group.category}
                    onClick={selectionCtxValue ? () => selectionCtxValue.onToggle(id, text) : undefined}
                    className={`flex items-baseline rounded-sm px-1 -mx-1 transition-colors duration-100 ${
                      selectionCtxValue
                        ? selected
                          ? "bg-cyan-100 border-l-[3px] border-cyan-500 pl-2 cursor-pointer"
                          : "hover:bg-amber-100 hover:border-l-[2px] hover:border-amber-400 cursor-pointer"
                        : ""
                    }`}
                  >
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
                );
              })}
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
                    <BulletList
                      items={exp.bullets.map((b) => b.text)}
                      idPrefix={`exp-${exp.sourceExperienceId}-bullet`}
                    />
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
              {resume.projects.map((proj, pi) => (
                <div className="break-inside-avoid" key={proj.name}>
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
                  {proj.bullets.length > 0 && (
                    <BulletList
                      items={proj.bullets}
                      idPrefix={`proj-${pi}-bullet`}
                    />
                  )}
                </div>
              ))}
            </div>
          </Fragment>
        ) : null;

      case "certifications":
        return hasCertifications ? (
          <Fragment key="certifications">
            <SectionHeader title="Certifications" />
            <BulletList items={resume.certifications} idPrefix="cert" />
          </Fragment>
        ) : null;

      default:
        return null;
    }
  }

  return (
    <SelectionCtx.Provider value={selectionCtxValue}>
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
    </SelectionCtx.Provider>
  );
}
