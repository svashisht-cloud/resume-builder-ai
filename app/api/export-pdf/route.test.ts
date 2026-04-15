import { describe, expect, it } from "vitest";
import { POST } from "./route";
import type { TailoredResume } from "@/types";

const tailoredResume: TailoredResume = {
  contact: {
    email: "alex@example.com",
    links: ["linkedin.com/in/alex"],
    location: "New York, NY",
    name: "Alex Morgan",
    phone: "555-0100",
  },
  certifications: ["AWS Certified Cloud Practitioner"],
  education: [{ institution: "State University", degree: "B.S. Computer Science", location: null, date: "May 2020", gpa: null }],
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
  projects: [{ name: "Resume Parser", techStack: "TypeScript, Node.js", date: null, bullets: ["Built structured extraction and validation pipeline."] }],
  skills: [{ category: "Skills", items: ["TypeScript", "Next.js", "Supabase"] }],
  summary: "Software engineer focused on reliable product workflows.",
};

describe("POST /api/export-pdf", () => {
  it("returns a PDF attachment for a valid tailored resume", async () => {
    const response = await POST(
      new Request("http://localhost/api/export-pdf", {
        body: JSON.stringify({
          role: "Senior Product Engineer",
          tailoredResume,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );

    const bytes = new Uint8Array(await response.arrayBuffer());
    const signature = new TextDecoder().decode(bytes.slice(0, 4));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      "alex-morgan-senior-product-engineer-tailored-resume.pdf",
    );
    expect(signature).toBe("%PDF");
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/export-pdf", {
        body: JSON.stringify({ tailoredResume: { summary: "" } }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid PDF export payload.",
    });
  });
});
