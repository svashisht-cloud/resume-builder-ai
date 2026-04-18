import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResumePreview } from "@/components/resume-preview";
import type { TailoredResume } from "@/types";

const baseResume: TailoredResume = {
  contact: {
    email: "alex@example.com",
    links: ["linkedin.com/in/alex"],
    location: "New York, NY",
    name: "Alex Morgan",
    phone: "555-0100",
    roleSubtitle: null,
  },
  certifications: ["AWS Certified Cloud Practitioner"],
  education: [{ institution: "State University", degree: "B.S. Computer Science", location: null, date: null, gpa: null }],
  experience: [
    {
      bullets: [
        {
          evidenceIds: ["bullet-1"],
          text: "Built API workflows that reduced manual review time by 30%.",
        },
      ],
      company: "Northstar Systems",
      dates: "2021 - Present",
      location: "Remote",
      sourceExperienceId: "exp-1",
      title: "Software Engineer",
    },
  ],
  projects: [{ name: "Resume Parser", techStack: null, date: null, url: null, bullets: ["Resume parser with structured extraction and validation."] }],
  skills: [{ category: "Skills", items: ["TypeScript", "Next.js", "Supabase"] }],
  summary: "Software engineer focused on reliable product workflows.",
  sectionOrder: null,
};

describe("ResumePreview", () => {
  it("renders the major tailored resume sections", () => {
    const html = renderToStaticMarkup(<ResumePreview resume={baseResume} />);

    expect(html).toContain("Alex Morgan");
    expect(html).toContain("Professional Summary");
    expect(html).toContain("TypeScript, Next.js, Supabase");
    expect(html).toContain("Software Engineer");
    expect(html).toContain("Northstar Systems");
    expect(html).toContain("B.S. Computer Science");
    expect(html).toContain("AWS Certified Cloud Practitioner");
  });

  it("renders projects when present", () => {
    const html = renderToStaticMarkup(<ResumePreview resume={baseResume} />);

    expect(html).toContain("Projects");
    expect(html).toContain(
      "Resume parser with structured extraction and validation.",
    );
  });

  it("omits empty optional sections without dropping required content", () => {
    const resume: TailoredResume = {
      ...baseResume,
      certifications: [],
      education: [],
      projects: [],
      skills: [],
    };
    const html = renderToStaticMarkup(<ResumePreview resume={resume} />);

    expect(html).not.toContain("Projects");
    expect(html).not.toContain("Education");
    expect(html).not.toContain("Certifications");
    expect(html).not.toContain("Skills");
    expect(html).toContain("Alex Morgan");
    expect(html).toContain("Built API workflows");
  });

  it("keeps long bullets and project text in the rendered output", () => {
    const longProjectBullet =
      "Led a cross-functional analytics project with a long description that should wrap cleanly instead of being truncated or dropped from the preview.";
    const resume: TailoredResume = {
      ...baseResume,
      experience: [
        {
          ...baseResume.experience[0],
          bullets: [
            {
              evidenceIds: ["bullet-2"],
              text: "Created a very long reliability improvement bullet that should remain fully visible in the generated HTML preview and continue wrapping across lines when space is constrained.",
            },
          ],
        },
      ],
      projects: [{ name: "Analytics Project", techStack: null, date: null, url: null, bullets: [longProjectBullet] }],
    };
    const html = renderToStaticMarkup(<ResumePreview resume={resume} />);

    expect(html).toContain("Created a very long reliability improvement bullet");
    expect(html).toContain(longProjectBullet);
  });
});
