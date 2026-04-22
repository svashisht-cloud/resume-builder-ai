import { createContext, Fragment, useContext } from "react";
import type { TailoredResume, SectionKey, ResumeStyle } from "@/types";
import { DEFAULT_RESUME_STYLE } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/resume/detect-section-order";

// ── Style lookup tables ───────────────────────────────────────────────────────

const FONT_CSS: Record<ResumeStyle["fontFamily"], string> = {
  times: '"Times New Roman", Times, serif',
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

const NAME_PT: Record<ResumeStyle["nameSize"], number> = { small: 18, medium: 20, large: 22 };
const HEADER_PT: Record<ResumeStyle["headerSize"], number> = { small: 11, medium: 12, large: 13 };
const BODY_PT: Record<ResumeStyle["bodySize"], number> = { small: 9.5, medium: 10.5, large: 11.5 };
const BULLET_LEADING: Record<ResumeStyle["bulletSpacing"], number> = { compact: 1.15, normal: 1.3, relaxed: 1.5 };
const SECTION_MT: Record<ResumeStyle["sectionSpacing"], string> = { compact: "0.25rem", normal: "0.5rem", relaxed: "1rem" };
const ITEM_GAP: Record<ResumeStyle["sectionSpacing"], string> = { compact: "0.25rem", normal: "0.5rem", relaxed: "0.75rem" };

// ── Contexts ─────────────────────────────────────────────────────────────────

const SelectionCtx = createContext<{
  selectedIds: Set<string>;
  onToggle: (id: string, text: string) => void;
} | null>(null);

interface RenderStyle {
  fontFamily: string;
  namePt: number;
  headerPt: number;
  bodyPt: number;
  leading: number;
  sectionMt: string;
  itemGap: string;
}

const RenderStyleCtx = createContext<RenderStyle>({
  fontFamily: FONT_CSS.times,
  namePt: 20,
  headerPt: 12,
  bodyPt: 10.5,
  leading: 1.3,
  sectionMt: "0.5rem",
  itemGap: "0.5rem",
});

// ── Helper ────────────────────────────────────────────────────────────────────

function present(v: string | null | undefined): string | null {
  return v?.trim() ? v.trim() : null;
}

function capitalize(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const { fontFamily, headerPt, sectionMt } = useContext(RenderStyleCtx);
  return (
    <div className="mb-1" style={{ marginTop: sectionMt }}>
      <h2
        className="font-bold uppercase text-black"
        style={{ fontSize: `${headerPt}pt`, fontFamily }}
      >
        {title}
      </h2>
      <hr className="mt-0.5 border-t border-black" />
    </div>
  );
}

function BulletList({ items, idPrefix }: { items: string[]; idPrefix: string }) {
  const ctx = useContext(SelectionCtx);
  const { fontFamily, bodyPt, leading } = useContext(RenderStyleCtx);
  return (
    <ul className="ml-4 list-disc">
      {items.map((item, i) => {
        const id = `${idPrefix}-${i}`;
        const selected = ctx?.selectedIds.has(id) ?? false;
        return ctx ? (
          <li
            key={id}
            onClick={() => ctx.onToggle(id, item)}
            className={`cursor-pointer rounded-sm px-1 -mx-1 transition-colors duration-100 ${
              selected
                ? "bg-cyan-100 border-l-[3px] border-cyan-500 pl-2"
                : "text-black hover:bg-amber-100 hover:border-l-[2px] hover:border-amber-400"
            }`}
            style={{ fontSize: `${bodyPt}pt`, lineHeight: leading, fontFamily }}
          >
            {capitalize(item)}
          </li>
        ) : (
          <li
            className="text-black"
            key={id}
            style={{ fontSize: `${bodyPt}pt`, lineHeight: leading, fontFamily }}
          >
            {capitalize(item)}
          </li>
        );
      })}
    </ul>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResumePreview({
  resume,
  resumeStyle = DEFAULT_RESUME_STYLE,
  interactiveMode,
  selectedItemIds,
  onItemToggle,
}: {
  resume: TailoredResume;
  resumeStyle?: ResumeStyle;
  interactiveMode?: boolean;
  selectedItemIds?: Map<string, string>;
  onItemToggle?: (id: string, text: string) => void;
}) {
  const fontFamily = FONT_CSS[resumeStyle.fontFamily];
  const namePt = NAME_PT[resumeStyle.nameSize];
  const headerPt = HEADER_PT[resumeStyle.headerSize];
  const bodyPt = BODY_PT[resumeStyle.bodySize];
  const leading = BULLET_LEADING[resumeStyle.bulletSpacing];
  const sectionMt = SECTION_MT[resumeStyle.sectionSpacing];
  const itemGap = ITEM_GAP[resumeStyle.sectionSpacing];

  const renderStyleValue: RenderStyle = { fontFamily, namePt, headerPt, bodyPt, leading, sectionMt, itemGap };

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
            <div className="space-y-1.5" style={{ gap: itemGap }}>
              {resume.education.map((edu) => (
                <div className="break-inside-avoid" key={`${edu.institution}-${edu.degree}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="font-bold leading-snug text-black"
                      style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}
                    >
                      {edu.institution}
                      {present(edu.location) ? (
                        <span className="italic">{`, ${edu.location}`}</span>
                      ) : ""}
                    </span>
                    {present(edu.date) && (
                      <span
                        className="shrink-0 font-bold leading-snug text-black"
                        style={{ fontSize: `${bodyPt}pt`, fontFamily }}
                      >
                        {edu.date}
                      </span>
                    )}
                  </div>
                  <p
                    className="italic leading-snug text-black"
                    style={{ fontSize: `${bodyPt}pt`, fontFamily }}
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
                      className="shrink-0 w-[170px] font-bold leading-[1.3] text-black"
                      style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}
                    >
                      {group.category}:
                    </span>
                    <span
                      className="leading-[1.3] text-black"
                      style={{ fontSize: `${bodyPt}pt`, fontFamily }}
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
            <div className="space-y-2" style={{ gap: itemGap }}>
              {(() => {
                const groups = resume.experience.reduce<
                  { company: string; location: string | null | undefined; entries: typeof resume.experience }[]
                >((acc, exp) => {
                  const last = acc[acc.length - 1];
                  if (last && last.company === exp.company) {
                    last.entries.push(exp);
                  } else {
                    acc.push({ company: exp.company, location: exp.location, entries: [exp] });
                  }
                  return acc;
                }, []);

                return groups.map((group) =>
                  group.entries.length === 1 ? (
                    <div className="break-inside-avoid" key={group.entries[0].sourceExperienceId}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold leading-snug text-black" style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}>
                          {group.entries[0].company}
                        </span>
                        {present(group.entries[0].dates) && (
                          <span className="shrink-0 font-bold leading-snug text-black" style={{ fontSize: `${bodyPt}pt`, fontFamily }}>
                            {group.entries[0].dates}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="italic leading-snug text-black" style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}>
                          {group.entries[0].title}
                        </span>
                        {present(group.entries[0].location) && (
                          <span className="shrink-0 italic leading-snug text-black" style={{ fontSize: `${bodyPt}pt`, fontFamily }}>
                            {group.entries[0].location}
                          </span>
                        )}
                      </div>
                      {group.entries[0].bullets.length > 0 && (
                        <BulletList
                          items={group.entries[0].bullets.map((b) => b.text)}
                          idPrefix={`exp-${group.entries[0].sourceExperienceId}-bullet`}
                        />
                      )}
                    </div>
                  ) : (
                    <div key={group.company}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold leading-snug text-black" style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}>
                          {group.company}
                        </span>
                        {present(group.location) && (
                          <span className="shrink-0 italic leading-snug text-black" style={{ fontSize: `${bodyPt}pt`, fontFamily }}>
                            {group.location}
                          </span>
                        )}
                      </div>
                      {group.entries.map((exp, i) => (
                        <div className="break-inside-avoid" key={exp.sourceExperienceId} style={{ marginTop: i === 0 ? 0 : itemGap }}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="italic leading-snug text-black" style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}>
                              {exp.title}
                            </span>
                            {present(exp.dates) && (
                              <span className="shrink-0 font-bold leading-snug text-black" style={{ fontSize: `${bodyPt}pt`, fontFamily }}>
                                {exp.dates}
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
                  )
                );
              })()}
            </div>
          </Fragment>
        ) : null;

      case "projects":
        return hasProjects ? (
          <Fragment key="projects">
            <SectionHeader title="Projects" />
            <div className="space-y-2" style={{ gap: itemGap }}>
              {resume.projects.map((proj, pi) => (
                <div className="break-inside-avoid" key={proj.name}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="font-bold italic leading-snug text-black"
                      style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}
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
                        className="shrink-0 font-bold leading-snug text-black"
                        style={{ fontSize: `${bodyPt}pt`, fontFamily }}
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
      <RenderStyleCtx.Provider value={renderStyleValue}>
        <article
          className="resume-document min-h-[11in] w-full max-w-[816px] bg-white px-[42px] py-[40px] text-black print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none"
          style={{ fontFamily }}
        >
          {/* ── Header ── */}
          <header className="mb-0.5 text-center">
            <h1
              className="font-bold leading-tight text-black"
              style={{ fontSize: `${namePt}pt`, fontFamily }}
            >
              {name}
            </h1>
            {present(resume.contact.roleSubtitle) && (
              <p
                className="mt-0.5 leading-snug text-black"
                style={{ fontSize: `${bodyPt + 0.5}pt`, fontFamily }}
              >
                {resume.contact.roleSubtitle}
              </p>
            )}
            {infoItems.length > 0 && (
              <p
                className="mt-1 leading-snug text-black"
                style={{ fontSize: `${bodyPt}pt`, fontFamily }}
              >
                {infoItems.join("  |  ")}
              </p>
            )}
            {linkItems.length > 0 && (
              <p
                className="mt-0.5 leading-snug text-black"
                style={{ fontSize: `${bodyPt}pt`, fontFamily }}
              >
                {linkItems.join("  |  ")}
              </p>
            )}
          </header>

          {/* ── Sections in source-detected order ── */}
          {(resume.sectionOrder ?? DEFAULT_SECTION_ORDER).map(renderSection)}
        </article>
      </RenderStyleCtx.Provider>
    </SelectionCtx.Provider>
  );
}
