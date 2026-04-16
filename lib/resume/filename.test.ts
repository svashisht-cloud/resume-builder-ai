import { describe, expect, it } from "vitest";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import type { TailoredResume } from "@/types";

const resume: TailoredResume = {
  contact: {
    email: null,
    links: [],
    location: null,
    name: "Alex Morgan",
    phone: null,
  },
  certifications: [],
  education: [],
  experience: [],
  projects: [],
  skills: [],
  summary: "Summary",
};

describe("buildResumePdfFilename", () => {
  it("uses candidate name and role when available", () => {
    const filename = buildResumePdfFilename({
      resume,
      role: "Senior Product Engineer",
    });
    expect(filename).toContain("alex-morgan-senior-product-engineer-");
    expect(filename).toContain("tailored-resume.pdf");
    expect(filename).toMatch(/alex-morgan-senior-product-engineer-\d{4}-\d{2}-\d{2}-tailored-resume\.pdf/);
  });

  it("sanitizes special characters", () => {
    const filename = buildResumePdfFilename({
      resume: {
        ...resume,
        contact: { ...resume.contact, name: "Alex M. / Morgan" },
      },
      role: "Full-Stack Engineer (AI)",
    });
    expect(filename).toContain("alex-m-morgan-full-stack-engineer-ai-");
    expect(filename).toContain("tailored-resume.pdf");
  });

  it("falls back when name and role are missing", () => {
    const filename = buildResumePdfFilename({
      resume: {
        ...resume,
        contact: { ...resume.contact, name: null },
      },
    });
    expect(filename).toContain("tailored-resume.pdf");
  });
});
