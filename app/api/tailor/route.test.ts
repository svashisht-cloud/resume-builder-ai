import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import type { ResumeEvaluation, TailoredResume } from "@/types";
import {
  buildScoreComparison,
  evaluateResumeAgainstJDRaw,
  evaluateTailoredResumeAgainstJDRaw,
  generateTailoredResumeFromRaw,
  renderTailoredResumeText,
} from "@/lib/ai/pipeline";

vi.mock("@/lib/resume/extract-text", () => ({
  extractResumeText: vi.fn().mockResolvedValue("Raw resume text with projects."),
}));

vi.mock("@/lib/ai/pipeline", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai/pipeline")>(
    "@/lib/ai/pipeline",
  );

  return {
    ...actual,
    evaluateResumeAgainstJDRaw: vi.fn(),
    evaluateTailoredResumeAgainstJDRaw: vi.fn(),
    generateTailoredResumeFromRaw: vi.fn(),
  };
});

const tailoredResume: TailoredResume = {
  contact: {
    name: "Alex Engineer",
    roleSubtitle: null,
    email: "alex@example.com",
    phone: null,
    location: null,
    links: [],
  },
  summary: "Backend engineer focused on APIs.",
  skills: [{ category: "Languages", items: ["Python"] }],
  experience: [
    {
      sourceExperienceId: "exp-1",
      company: "Example Co",
      title: "Engineer",
      location: null,
      dates: null,
      bullets: [
        {
          text: "Built backend APIs.",
          evidenceIds: ["Built backend APIs"],
        },
      ],
    },
  ],
  education: [{ institution: "State University", degree: "BS Computer Science", location: null, date: null, gpa: null }],
  projects: [{ name: "Backend API Project", techStack: null, date: null, url: null, bullets: ["Built backend API project."] }],
  certifications: [],
  sectionOrder: null,
};

function makeEvaluation(score: number): ResumeEvaluation {
  return {
    score,
    summary: `Score ${score}`,
    strengths: ["Backend API evidence"],
    gaps: ["Limited scale detail"],
    improvementSuggestions: ["Clarify API scope"],
    matchedAreas: ["Backend APIs"],
    missingAreas: ["Scale detail"],
    rubric: {
      skillsAlignment: score,
      experienceAlignment: score,
      projectAlignment: score,
      clarity: score,
      atsReadability: score,
    },
  };
}

const tailoredResult = {
  tailoredResume,
  changeLog: {
    changes: [
      {
        section: "summary" as const,
        originalText: "Backend engineer.",
        tailoredText: "Backend engineer focused on APIs.",
        reason: "Clarified backend API fit.",
        evidenceIds: ["Backend engineer"],
      },
    ],
  },
};

describe("POST /api/tailor", () => {
  it("returns evaluator-based before and after scores", async () => {
    vi.mocked(evaluateResumeAgainstJDRaw).mockResolvedValueOnce(makeEvaluation(56));
    vi.mocked(evaluateTailoredResumeAgainstJDRaw).mockResolvedValueOnce(makeEvaluation(88));
    vi.mocked(generateTailoredResumeFromRaw).mockResolvedValue(tailoredResult);

    const response = await POST(
      new Request("http://localhost/api/tailor", {
        body: (() => {
          const formData = new FormData();
          formData.append("resumeFile", new File(["resume"], "resume.txt"));
          formData.append("jobDescriptionText", "Raw JD text.");
          return formData;
        })(),
        method: "POST",
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.evaluationMode).toBe("llm");
    expect(body.scoreComparison).toEqual({
      before: 56,
      after: 88,
      delta: 32,
    });
    expect(body.originalEvaluation.score).toBe(56);
    expect(body.tailoredEvaluation.score).toBe(88);
    expect(body).not.toHaveProperty("atsScore");
    expect(body).not.toHaveProperty("parsedResume");
    expect(body).not.toHaveProperty("parsedJobDescription");
    expect(generateTailoredResumeFromRaw).toHaveBeenCalledWith(
      expect.objectContaining({
        resumeText: "Raw resume text with projects.",
        jobDescriptionText: "Raw JD text.",
        originalEvaluation: expect.objectContaining({ score: 56 }),
      }),
    );
    expect(evaluateTailoredResumeAgainstJDRaw).toHaveBeenCalledWith(
      renderTailoredResumeText(tailoredResult.tailoredResume),
      "Raw JD text.",
    );
    expect(buildScoreComparison).toBeDefined();
  });
});
