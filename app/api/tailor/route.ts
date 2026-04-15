import { z } from "zod";
import {
  ATSScoreSchema,
  ChangeLogSchema,
  ParsedJobDescriptionSchema,
  ParsedResumeSchema,
  TailoredResumeSchema,
} from "@/types";

const TailorRequestSchema = z.object({
  resumeText: z.string().trim().min(1),
  jobDescriptionText: z.string().trim().min(1),
});

const TailorResponseSchema = z.object({
  parsedResume: ParsedResumeSchema,
  parsedJobDescription: ParsedJobDescriptionSchema,
  tailoredResume: TailoredResumeSchema,
  atsScore: ATSScoreSchema,
  changeLog: ChangeLogSchema,
});

function firstLine(text: string, fallback: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? fallback;
}

function includesKeyword(text: string, keyword: string) {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const requestResult = TailorRequestSchema.safeParse(body);

  if (!requestResult.success) {
    return Response.json(
      { error: "resumeText and jobDescriptionText are required." },
      { status: 400 },
    );
  }

  const { resumeText, jobDescriptionText } = requestResult.data;
  const resumeHeadline = firstLine(resumeText, "Sample Candidate");
  const jdHeadline = firstLine(jobDescriptionText, "Product Operations Manager");
  const matchedKeywords = ["operations", "stakeholder management", "process improvement"].filter(
    (keyword) => includesKeyword(resumeText, keyword) || includesKeyword(jobDescriptionText, keyword),
  );
  const safeMatchedKeywords =
    matchedKeywords.length > 0 ? matchedKeywords : ["process improvement"];

  const response = TailorResponseSchema.safeParse({
    parsedResume: {
      contact: {
        name: resumeHeadline,
        email: "candidate@example.com",
        location: "Remote",
        links: [],
      },
      summary:
        "Experienced professional with a background in operations, collaboration, and measurable process improvements.",
      skills: ["Process improvement", "Stakeholder management", "Documentation"],
      experience: [
        {
          id: "exp-1",
          company: "Example Company",
          title: "Operations Specialist",
          location: "Remote",
          startDate: "2021",
          endDate: "Present",
          bullets: [
            {
              id: "bullet-1",
              text: "Improved team workflows by documenting repeatable processes and tracking follow-up actions.",
            },
            {
              id: "bullet-2",
              text: "Coordinated with cross-functional stakeholders to keep projects organized and on schedule.",
            },
          ],
        },
      ],
      education: ["Bachelor's degree"],
      projects: [],
      certifications: [],
      sourceText: resumeText,
    },
    parsedJobDescription: {
      title: jdHeadline,
      company: "Example Employer",
      location: "Remote",
      responsibilities: [
        "Coordinate cross-functional workstreams.",
        "Improve operational processes and documentation.",
        "Communicate project status to stakeholders.",
      ],
      requiredSkills: ["Operations", "Stakeholder management", "Process improvement"],
      preferredSkills: ["ATS-friendly resume writing"],
      keywords: ["operations", "stakeholder management", "process improvement", "documentation"],
      sourceText: jobDescriptionText,
    },
    tailoredResume: {
      contact: {
        name: resumeHeadline,
        email: "candidate@example.com",
        location: "Remote",
        links: [],
      },
      summary:
        "Operations-focused professional with experience improving repeatable workflows, coordinating stakeholders, and documenting processes that support consistent execution.",
      skills: safeMatchedKeywords,
      experience: [
        {
          sourceExperienceId: "exp-1",
          company: "Example Company",
          title: "Operations Specialist",
          location: "Remote",
          dates: "2021 - Present",
          bullets: [
            {
              text: "Improved repeatable workflows by documenting process steps, owners, and follow-up actions for team execution.",
              evidenceIds: ["bullet-1"],
            },
            {
              text: "Coordinated cross-functional stakeholders to keep project work organized, visible, and aligned to deadlines.",
              evidenceIds: ["bullet-2"],
            },
          ],
        },
      ],
      education: ["Bachelor's degree"],
      projects: [],
      certifications: [],
    },
    atsScore: {
      overall: 78,
      sectionScores: [
        {
          section: "Keyword alignment",
          score: 82,
          notes: "Mock score based on supported operations keywords.",
        },
        {
          section: "Experience relevance",
          score: 76,
          notes: "Experience bullets map to the job description at a high level.",
        },
        {
          section: "Truthfulness",
          score: 90,
          notes: "Tailored bullets reference source evidence IDs.",
        },
      ],
      matchedKeywords: safeMatchedKeywords,
      missingKeywords: ["budget ownership", "advanced analytics"],
      strengths: [
        "Clear operational focus",
        "Evidence-backed tailored bullets",
        "Relevant stakeholder coordination language",
      ],
      risks: [
        "Mock response only; no real parsing or AI tailoring yet",
        "Uploaded files are not parsed in this MR",
      ],
    },
    changeLog: {
      changes: [
        {
          section: "summary",
          originalText:
            "Experienced professional with a background in operations, collaboration, and measurable process improvements.",
          tailoredText:
            "Operations-focused professional with experience improving repeatable workflows, coordinating stakeholders, and documenting processes that support consistent execution.",
          reason: "Focused the summary on role-relevant operations language without adding unsupported claims.",
          evidenceIds: ["bullet-1", "bullet-2"],
        },
        {
          section: "experience",
          originalText:
            "Improved team workflows by documenting repeatable processes and tracking follow-up actions.",
          tailoredText:
            "Improved repeatable workflows by documenting process steps, owners, and follow-up actions for team execution.",
          reason: "Reframed an existing bullet toward process ownership and execution.",
          evidenceIds: ["bullet-1"],
        },
      ],
    },
  });

  if (!response.success) {
    return Response.json(
      { error: "Mock response failed schema validation." },
      { status: 500 },
    );
  }

  return Response.json(response.data);
}
