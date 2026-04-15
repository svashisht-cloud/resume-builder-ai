import type { TailoredResume } from "@/types";

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
    <div className="mb-1 mt-3.5">
      <h2
        className="text-[12px] font-bold uppercase text-black"
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
          className="text-[10.5px] leading-[1.4] text-black"
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

  return (
    <article
      className="resume-document min-h-[11in] w-full max-w-[816px] bg-white px-[0.5in] py-[0.45in] text-black print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none"
      style={{ fontFamily: TIMES }}
    >
      {/* ── Header ── */}
      <header className="mb-0.5 text-center">
        <h1
          className="text-[20px] font-bold leading-tight text-black"
          style={{ fontFamily: TIMES }}
        >
          {name}
        </h1>
        {infoItems.length > 0 && (
          <p
            className="mt-2 text-[10.5px] leading-snug text-black"
            style={{ fontFamily: TIMES }}
          >
            {infoItems.join("  |  ")}
          </p>
        )}
        {linkItems.length > 0 && (
          <p
            className="mt-0.5 text-[10.5px] leading-snug text-black"
            style={{ fontFamily: TIMES }}
          >
            {linkItems.join("  |  ")}
          </p>
        )}
      </header>

      {/* ── Experience ── */}
      {hasExperience && (
        <>
          <SectionHeader title="Work Experience" />
          <div className="space-y-2">
            {resume.experience.map((exp) => (
              <div className="break-inside-avoid" key={exp.sourceExperienceId}>
                {/* Company ←→ Location */}
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-[11px] font-bold leading-snug text-black"
                    style={{ fontFamily: TIMES }}
                  >
                    {exp.company}
                  </span>
                  {present(exp.location) && (
                    <span
                      className="shrink-0 text-[10.5px] italic leading-snug text-black"
                      style={{ fontFamily: TIMES }}
                    >
                      {exp.location}
                    </span>
                  )}
                </div>
                {/* Role ←→ Dates */}
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-[11px] italic leading-snug text-black"
                    style={{ fontFamily: TIMES }}
                  >
                    {exp.title}
                  </span>
                  {present(exp.dates) && (
                    <span
                      className="shrink-0 text-[10.5px] font-bold leading-snug text-black"
                      style={{ fontFamily: TIMES }}
                    >
                      {exp.dates}
                    </span>
                  )}
                </div>
                {exp.bullets.length > 0 && (
                  <BulletList items={exp.bullets.map((b) => b.text)} />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Projects ── */}
      {hasProjects && (
        <>
          <SectionHeader title="Projects" />
          <div className="space-y-2">
            {resume.projects.map((proj) => (
              <div className="break-inside-avoid" key={proj.name}>
                {/* Name (tech stack) ←→ Date */}
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-[11px] font-bold italic leading-snug text-black"
                    style={{ fontFamily: TIMES }}
                  >
                    {proj.name}
                    {present(proj.techStack) && (
                      <span className="font-normal"> ({proj.techStack})</span>
                    )}
                  </span>
                  {present(proj.date) && (
                    <span
                      className="shrink-0 text-[10.5px] font-bold leading-snug text-black"
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
        </>
      )}

      {/* ── Education ── */}
      {hasEducation && (
        <>
          <SectionHeader title="Education" />
          <div className="space-y-1.5">
            {resume.education.map((edu) => (
              <div className="break-inside-avoid" key={`${edu.institution}-${edu.degree}`}>
                {/* Institution ←→ Date */}
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-[11px] font-bold leading-snug text-black"
                    style={{ fontFamily: TIMES }}
                  >
                    {edu.institution}
                    {present(edu.location) ? (
                      <span className="italic">{`, ${edu.location}`}</span>
                    ) : ""}
                  </span>
                  {present(edu.date) && (
                    <span
                      className="shrink-0 text-[10.5px] font-bold leading-snug text-black"
                      style={{ fontFamily: TIMES }}
                    >
                      {edu.date}
                    </span>
                  )}
                </div>
                {/* Degree + GPA */}
                <p
                  className="text-[10.5px] italic leading-snug text-black"
                  style={{ fontFamily: TIMES }}
                >
                  {edu.degree}
                  {present(edu.gpa) ? `, GPA: ${edu.gpa}` : ""}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Technical Skills ── */}
      {hasSkills && (
        <>
          <SectionHeader title="Technical Skills" />
          <div className="space-y-0.5">
            {resume.skills.map((group) => (
              <div className="flex gap-4" key={group.category}>
                <span
                  className="w-28 shrink-0 text-[11px] font-bold leading-[1.4] text-black"
                  style={{ fontFamily: TIMES }}
                >
                  {group.category}:
                </span>
                <span
                  className="text-[10.5px] leading-[1.4] text-black"
                  style={{ fontFamily: TIMES }}
                >
                  {group.items.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Certifications ── */}
      {hasCertifications && (
        <>
          <SectionHeader title="Certifications" />
          <BulletList items={resume.certifications} />
        </>
      )}
    </article>
  );
}
