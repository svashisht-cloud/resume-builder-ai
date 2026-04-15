import type React from "react";
import type { ContactInfo, TailoredResume } from "@/types";

function present(value: string | null | undefined) {
  return value?.trim() ? value.trim() : null;
}

function ContactLine({ contact }: { contact: ContactInfo }) {
  const contactItems = [
    present(contact.email),
    present(contact.phone),
    present(contact.location),
    ...contact.links.map((link) => present(link)),
  ].filter((item): item is string => Boolean(item));

  if (contactItems.length === 0) {
    return null;
  }

  return (
    <p className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 text-center text-[11px] leading-5 text-zinc-700 print:text-[9.5pt]">
      {contactItems.map((item, index) => (
        <span className="break-words" key={`${item}-${index}`}>
          {index > 0 ? <span className="px-2 text-zinc-400">|</span> : null}
          {item}
        </span>
      ))}
    </p>
  );
}

export function ResumeHeader({ contact }: { contact: ContactInfo }) {
  const name = present(contact.name) ?? "Tailored Resume";

  return (
    <header className="text-center">
      <h1 className="text-2xl font-bold leading-tight text-zinc-950 print:text-[18pt]">
        {name}
      </h1>
      <ContactLine contact={contact} />
    </header>
  );
}

export function ResumeSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="break-inside-avoid">
      <h2 className="border-b border-zinc-300 pb-1 text-[11px] font-bold uppercase leading-none tracking-normal text-zinc-950 print:text-[9.5pt]">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="ml-4 list-disc space-y-1 text-[12px] leading-5 text-zinc-800 marker:text-zinc-700 print:text-[9.5pt] print:leading-[1.35]">
      {items.map((item, index) => (
        <li className="break-words pl-1" key={`${item}-${index}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ResumePreview({ resume }: { resume: TailoredResume }) {
  const hasSummary = resume.summary.trim().length > 0;
  const hasSkills = resume.skills.length > 0;
  const hasExperience = resume.experience.length > 0;
  const hasProjects = resume.projects.length > 0;
  const hasEducation = resume.education.length > 0;
  const hasCertifications = resume.certifications.length > 0;

  return (
    <article className="resume-document mx-auto min-h-[11in] w-full max-w-[8.5in] bg-white px-8 py-9 text-zinc-950 shadow-sm ring-1 ring-zinc-200 print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0">
      <ResumeHeader contact={resume.contact} />

      <div className="mt-5 space-y-4 print:mt-4 print:space-y-3">
        {hasSummary ? (
          <ResumeSection title="Professional Summary">
            <p className="break-words text-[12px] leading-5 text-zinc-800 print:text-[9.5pt] print:leading-[1.35]">
              {resume.summary}
            </p>
          </ResumeSection>
        ) : null}

        {hasSkills ? (
          <ResumeSection title="Skills">
            <div className="space-y-0.5">
              {resume.skills.map((group) => (
                <p
                  className="break-words text-[12px] leading-5 text-zinc-800 print:text-[9.5pt] print:leading-[1.35]"
                  key={group.category}
                >
                  <span className="font-semibold">{group.category}:</span>{" "}
                  {group.items.join(", ")}
                </p>
              ))}
            </div>
          </ResumeSection>
        ) : null}

        {hasExperience ? (
          <ResumeSection title="Experience">
            <div className="space-y-3">
              {resume.experience.map((experience) => (
                <div
                  className="break-inside-avoid"
                  key={experience.sourceExperienceId}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <div>
                      <h3 className="text-[13px] font-bold leading-snug text-zinc-950 print:text-[10pt]">
                        {experience.title}
                      </h3>
                      <p className="text-[12px] font-semibold leading-snug text-zinc-800 print:text-[9.5pt]">
                        {experience.company}
                        {experience.location ? `, ${experience.location}` : ""}
                      </p>
                    </div>
                    {experience.dates ? (
                      <p className="text-[11px] font-medium leading-snug text-zinc-600 print:text-[9pt]">
                        {experience.dates}
                      </p>
                    ) : null}
                  </div>
                  {experience.bullets.length > 0 ? (
                    <div className="mt-1.5">
                      <BulletList
                        items={experience.bullets.map((bullet) => bullet.text)}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </ResumeSection>
        ) : null}

        {hasProjects ? (
          <ResumeSection title="Projects">
            <div className="space-y-3">
              {resume.projects.map((project) => (
                <div className="break-inside-avoid" key={project.name}>
                  <p className="text-[12px] font-bold leading-snug text-zinc-950 print:text-[9.5pt]">
                    {project.name}
                    {project.date ? ` — ${project.date}` : ""}
                  </p>
                  {project.techStack ? (
                    <p className="text-[11px] italic leading-snug text-zinc-700 print:text-[9pt]">
                      {project.techStack}
                    </p>
                  ) : null}
                  {project.bullets.length > 0 ? (
                    <BulletList items={project.bullets} />
                  ) : null}
                </div>
              ))}
            </div>
          </ResumeSection>
        ) : null}

        {hasEducation ? (
          <ResumeSection title="Education">
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div className="break-inside-avoid" key={`${edu.institution}-${edu.degree}`}>
                  <p className="text-[12px] font-bold leading-snug text-zinc-950 print:text-[9.5pt]">
                    {edu.institution}
                    {edu.location ? `, ${edu.location}` : ""}
                    {edu.date ? ` — ${edu.date}` : ""}
                  </p>
                  <p className="text-[11px] italic leading-snug text-zinc-700 print:text-[9pt]">
                    {edu.degree}
                    {edu.gpa ? `, GPA: ${edu.gpa}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </ResumeSection>
        ) : null}

        {hasCertifications ? (
          <ResumeSection title="Certifications">
            <BulletList items={resume.certifications} />
          </ResumeSection>
        ) : null}
      </div>
    </article>
  );
}
