import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildScoreComparison,
  evaluateResumeAgainstJDRaw,
  generateTailoredResumeFromRaw,
  renderTailoredResumeText,
} from "./pipeline";
import {
  ResumeEvaluationSchema,
  type ResumeEvaluation,
  type TailoredResume,
} from "@/types";
import { getOpenAIClient } from "@/lib/ai/client";

vi.mock("@/lib/ai/client", () => ({
  AI_EVAL_MODEL: "eval-model",
  AI_TAILOR_MODEL: "tailor-model",
  getOpenAIClient: vi.fn(),
}));

const evaluation: ResumeEvaluation = {
  score: 78,
  summary: "Strong backend fit with some platform gaps.",
  strengths: ["Backend API experience", "Automation experience"],
  gaps: ["Limited Kubernetes evidence"],
  improvementSuggestions: ["Surface observability experience more clearly"],
  matchedAreas: ["Backend services", "Automation"],
  missingAreas: ["Kubernetes"],
  rubric: {
    skillsAlignment: 80,
    experienceAlignment: 82,
    projectAlignment: 70,
    clarity: 76,
    atsReadability: 81,
  },
};

const tailoredResume: TailoredResume = {
  contact: {
    name: "Alex Engineer",
    roleSubtitle: null,
    email: "alex@example.com",
    phone: null,
    location: null,
    links: [],
  },
  summary: "Backend engineer focused on internal platforms.",
  skills: [
    { category: "Languages", items: ["Python", "Node.js"] },
    { category: "Practices", items: ["Automation", "Observability"] },
  ],
  experience: [
    {
      sourceExperienceId: "exp-1",
      company: "Example Co",
      title: "Backend Engineer",
      location: null,
      dates: null,
      bullets: [
        {
          text: "Built backend APIs and automation for internal services.",
          evidenceIds: ["Built backend APIs and automation"],
        },
      ],
    },
  ],
  education: [{ institution: "State University", degree: "BS Computer Science", location: null, date: null, gpa: null }],
  projects: [{ name: "Developer Platform", techStack: "Backstage, Node.js", date: null, url: null, bullets: ["Developer platform project using Backstage and Node.js SDKs."] }],
  certifications: ["AWS Certified Developer"],
  sectionOrder: null,
};

function mockStructuredOpenAIResponse(json: unknown) {
  const create = vi.fn().mockResolvedValue({
    choices: [
      {
        finish_reason: "stop",
        message: {
          content: JSON.stringify(json),
        },
      },
    ],
    usage: null,
  });

  vi.mocked(getOpenAIClient).mockReturnValue({
    chat: {
      completions: {
        create,
      },
    },
  } as never);

  return create;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ResumeEvaluationSchema", () => {
  it("parses structured evaluator output", () => {
    expect(ResumeEvaluationSchema.parse(evaluation)).toEqual(evaluation);
  });

  it("rejects out-of-range evaluator scores", () => {
    expect(() =>
      ResumeEvaluationSchema.parse({
        ...evaluation,
        score: 101,
      }),
    ).toThrow();
  });
});

describe("evaluateResumeAgainstJDRaw", () => {
  it("returns structured LLM evaluation for raw resume and JD text", async () => {
    const create = mockStructuredOpenAIResponse(evaluation);

    await expect(
      evaluateResumeAgainstJDRaw("raw resume text", "raw jd text"),
    ).resolves.toEqual(evaluation);

    const request = create.mock.calls[0][0];
    expect(request.model).toBe("eval-model");
    expect(request.messages[1].content).toContain("raw resume text");
    expect(request.messages[1].content).toContain("raw jd text");
  });
});

describe("score comparison", () => {
  it("uses evaluator scores for before, after, and delta", () => {
    expect(
      buildScoreComparison({
        originalEvaluation: {
          ...evaluation,
          score: 56,
        },
        tailoredEvaluation: {
          ...evaluation,
          score: 88,
        },
      }),
    ).toEqual({
      before: 56,
      after: 88,
      delta: 32,
    });
  });
});

describe("generateTailoredResumeFromRaw", () => {
  it("uses only raw inputs and original evaluator feedback for tailoring", async () => {
    const create = mockStructuredOpenAIResponse({
      tailoredResume,
      changeLog: {
        changes: [
          {
            section: "summary",
            originalText: "Software engineer.",
            tailoredText: tailoredResume.summary,
            reason: "Focused summary on relevant backend platform evidence.",
            evidenceIds: ["Software engineer building internal tools"],
          },
        ],
      },
    });

    const result = await generateTailoredResumeFromRaw({
      resumeText: "RAW RESUME WITH PROJECTS",
      jobDescriptionText: "RAW JD",
      originalEvaluation: evaluation,
    });

    expect(result.tailoredResume.projects).toEqual(tailoredResume.projects);
    const request = create.mock.calls[0][0];
    expect(request.model).toBe("tailor-model");
    expect(request.messages[1].content).toContain("RAW RESUME WITH PROJECTS");
    expect(request.messages[1].content).toContain("RAW JD");
    expect(request.messages[1].content).toContain("Limited Kubernetes evidence");
    expect(request.messages[1].content).not.toContain("PARSED SOURCE RESUME");
  });
});

describe("renderTailoredResumeText", () => {
  it("renders project content for tailored evaluation", () => {
    expect(renderTailoredResumeText(tailoredResume)).toContain(
      "Developer platform project using Backstage and Node.js SDKs.",
    );
  });
});

describe("deterministic parsing and scoring cleanup", () => {
  it("removes the old scoring engine file", () => {
    expect(existsSync(join(process.cwd(), "lib/ai/scoring.ts"))).toBe(false);
  });

  it("keeps app code free of old parse and scoring calls", () => {
    const files = [
      "app/api/tailor/route.ts",
      "lib/ai/pipeline.ts",
      "components/dashboard-shell.tsx",
    ];

    for (const file of files) {
      const contents = readFileSync(join(process.cwd(), file), "utf8");
      expect(contents).not.toMatch(
        /scoreResume|atsScore|ATSScore|parseResume|parseJobDescription/,
      );
      expect(contents).not.toContain("lib/ai/scoring");
    }
  });
});
