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
    expect(
      buildResumePdfFilename({
        resume,
        role: "Senior Product Engineer",
      }),
    ).toBe("alex-morgan-senior-product-engineer-tailored-resume.pdf");
  });

  it("sanitizes special characters", () => {
    expect(
      buildResumePdfFilename({
        resume: {
          ...resume,
          contact: { ...resume.contact, name: "Alex M. / Morgan" },
        },
        role: "Full-Stack Engineer (AI)",
      }),
    ).toBe("alex-m-morgan-full-stack-engineer-ai-tailored-resume.pdf");
  });

  it("falls back when name and role are missing", () => {
    expect(
      buildResumePdfFilename({
        resume: {
          ...resume,
          contact: { ...resume.contact, name: null },
        },
      }),
    ).toBe("tailored-resume.pdf");
  });
});
