import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  AI_EVAL_MODEL,
  AI_TAILOR_MODEL,
  getOpenAIClient,
} from "@/lib/ai/client";
import {
  ChangeLogSchema,
  ResumeEvaluationSchema,
  TailoredResumeSchema,
  type ResumeEvaluation,
  type ScoreComparison,
  type TailoredResume,
} from "@/types";

const TailoringResultSchema = z.object({
  tailoredResume: TailoredResumeSchema,
  changeLog: ChangeLogSchema,
});

export type TailoringResult = z.infer<typeof TailoringResultSchema>;

const PRICING_PER_MILLION_TOKENS: Record<
  string,
  { input: number; cachedInput: number; output: number }
> = {
  "gpt-4.1": { input: 2, cachedInput: 0.5, output: 8 },
  "gpt-4.1-mini": { input: 0.4, cachedInput: 0.1, output: 1.6 },
  "gpt-4.1-nano": { input: 0.1, cachedInput: 0.025, output: 0.4 },
};

function formatZodError(error: z.ZodError) {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("; ");
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

function sanitizeControlChars(text: string): string {
  // Replace literal unescaped control characters inside JSON string values.
  // Models occasionally emit raw \n, \r, \t, etc. inside strings which are
  // invalid per the JSON spec — convert them to their escape sequences.
  return text.replace(/[\x00-\x1F]/g, (ch) => {
    if (ch === "\n") return "\\n";
    if (ch === "\r") return "\\r";
    if (ch === "\t") return "\\t";
    return `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`;
  });
}

function parseModelJson(responseText: string, validationLabel: string): unknown {
  // Strip markdown fences if present
  const trimmed = responseText.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1]?.trim() ?? trimmed;

  // Attempt 1: direct parse
  try {
    return JSON.parse(fenced);
  } catch {
    // no-op — fall through to next attempt
  }

  // Attempt 2: sanitize literal control characters, then parse
  const sanitized = sanitizeControlChars(fenced);
  try {
    return JSON.parse(sanitized);
  } catch {
    // no-op — fall through to extraction
  }

  // Attempt 3: model appended trailing text — extract the first complete object
  const extracted = extractFirstJsonObject(sanitized);
  if (!extracted) {
    throw new Error(`${validationLabel}: OpenAI returned invalid JSON.`);
  }
  return JSON.parse(extracted);
}

function getPricing(model: string) {
  return PRICING_PER_MILLION_TOKENS[model] ?? PRICING_PER_MILLION_TOKENS["gpt-4.1"];
}

function logOpenAICost({
  stage,
  model,
  usage,
}: {
  stage: string;
  model: string;
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    prompt_tokens_details?: {
      cached_tokens?: number;
    };
  } | null;
}) {
  if (!usage) {
    console.log(`[OpenAI cost] ${stage}`, {
      model,
      note: "No token usage returned; cost could not be estimated.",
    });
    return;
  }

  const pricing = getPricing(model);
  const inputTokens = usage.prompt_tokens ?? 0;
  const cachedInputTokens = usage.prompt_tokens_details?.cached_tokens ?? 0;
  const billableInputTokens = Math.max(inputTokens - cachedInputTokens, 0);
  const outputTokens = usage.completion_tokens ?? 0;
  const estimatedCostUsd =
    (billableInputTokens / 1_000_000) * pricing.input +
    (cachedInputTokens / 1_000_000) * pricing.cachedInput +
    (outputTokens / 1_000_000) * pricing.output;

  console.log(`[OpenAI cost] ${stage}`, {
    model,
    inputTokens,
    cachedInputTokens,
    outputTokens,
    totalTokens: usage.total_tokens ?? inputTokens + outputTokens,
    pricingAssumptionUsdPerMillionTokens: pricing,
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
  });
}

async function runStructuredCall<TSchema extends z.ZodType>({
  model,
  schema,
  schemaName,
  stage,
  systemPrompt,
  userPrompt,
  validationLabel,
  temperature = 0,
}: {
  model: string;
  schema: TSchema;
  schemaName: string;
  stage: string;
  systemPrompt: string;
  userPrompt: string;
  validationLabel: string;
  temperature?: number;
}): Promise<z.infer<TSchema>> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: zodResponseFormat(schema, schemaName),
  });
  logOpenAICost({
    stage,
    model,
    usage: completion.usage ?? null,
  });

  const choice = completion.choices[0];

  if (!choice) {
    throw new Error(`${validationLabel}: OpenAI returned no choices.`);
  }

  if (choice.finish_reason === "length") {
    throw new Error(
      `${validationLabel}: OpenAI response was truncated (max tokens reached).`,
    );
  }

  if (choice.message.refusal) {
    throw new Error(`${validationLabel}: OpenAI refused the request.`);
  }

  const responseText = choice.message.content;

  if (!responseText) {
    throw new Error(`${validationLabel}: OpenAI returned no content.`);
  }

  const parsedJson = parseModelJson(responseText, validationLabel);
  const validation = schema.safeParse(parsedJson);

  if (!validation.success) {
    throw new Error(
      `${validationLabel}: ${formatZodError(validation.error)}`,
    );
  }

  return validation.data;
}

export function buildScoreComparison({
  originalEvaluation,
  tailoredEvaluation,
}: {
  originalEvaluation: ResumeEvaluation;
  tailoredEvaluation: ResumeEvaluation;
}): ScoreComparison {
  return {
    before: originalEvaluation.score,
    after: tailoredEvaluation.score,
    delta: tailoredEvaluation.score - originalEvaluation.score,
  };
}

export function renderTailoredResumeText(resume: TailoredResume) {
  const lines: string[] = [];
  const contact = [
    resume.contact.name,
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    ...resume.contact.links,
  ].filter((item): item is string => Boolean(item?.trim()));

  if (contact.length > 0) {
    lines.push(contact.join(" | "));
  }

  if (resume.summary.trim()) {
    lines.push("", "SUMMARY", resume.summary);
  }

  if (resume.skills.length > 0) {
    lines.push("", "SKILLS");
    for (const group of resume.skills) {
      lines.push(`${group.category}: ${group.items.join(", ")}`);
    }
  }

  if (resume.experience.length > 0) {
    lines.push("", "EXPERIENCE");
    for (const experience of resume.experience) {
      lines.push(
        [
          experience.title,
          experience.company,
          experience.location,
          experience.dates,
        ]
          .filter(Boolean)
          .join(" | "),
      );
      for (const bullet of experience.bullets) {
        lines.push(`- ${bullet.text}`);
      }
    }
  }

  if (resume.projects.length > 0) {
    lines.push("", "PROJECTS");
    for (const project of resume.projects) {
      const header = [project.name, project.techStack].filter(Boolean).join(" | ");
      const datePart = project.date ? ` (${project.date})` : "";
      lines.push(`${header}${datePart}`);
      for (const bullet of project.bullets) {
        lines.push(`- ${bullet}`);
      }
    }
  }

  if (resume.education.length > 0) {
    lines.push("", "EDUCATION");
    for (const edu of resume.education) {
      const header = [edu.institution, edu.location].filter(Boolean).join(", ");
      const datePart = edu.date ? ` (${edu.date})` : "";
      lines.push(`${header}${datePart}`);
      const degreePart = [edu.degree, edu.gpa ? `GPA: ${edu.gpa}` : null]
        .filter(Boolean)
        .join(", ");
      if (degreePart) lines.push(degreePart);
    }
  }

  if (resume.certifications.length > 0) {
    lines.push(
      "",
      "CERTIFICATIONS",
      ...resume.certifications.map((certification) => `- ${certification}`),
    );
  }

  return lines.join("\n").trim();
}

export async function evaluateResumeAgainstJDRaw(
  resumeText: string,
  jobDescriptionText: string,
): Promise<ResumeEvaluation> {
  return runStructuredCall({
    model: AI_EVAL_MODEL,
    schema: ResumeEvaluationSchema,
    schemaName: "resume_evaluation",
    stage: "evaluateResumeAgainstJDRaw",
    validationLabel: "AI response failed ResumeEvaluation validation",
    systemPrompt:
      "You are an expert recruiter and resume evaluator. Judge the resume's fit for the job using only the raw resume text and raw job description text. Score realistically from 0 to 100 like a careful ChatGPT-style review: reward clear semantic alignment even when wording differs, but do not assume unstated skills, experience, tools, metrics, titles, credentials, or projects. Consider summary, skills, experience, projects, education, clarity, and ATS readability. Weak resumes should score weakly, strong partial matches should get meaningful credit, and strong evidence-backed matches should score highly.",
    userPrompt: `Evaluate this resume against this job description.\n\nScoring guidance:\n- Use the raw resume text as the only source of truth for candidate evidence.\n- Use the raw job description text as the only source of truth for role expectations.\n- Prefer human-realistic fit judgment over exact keyword counting.\n- Credit synonymous or semantically equivalent evidence when it is clearly supported.\n- Penalize missing must-have experience, unclear evidence, weak relevance, and poor readability.\n- Do not make the score automatically generous; calibrate it to the actual evidence.\n- matchedAreas and missingAreas should be concise role-fit areas, not raw keyword dumps.\n\nRESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION TEXT:\n${jobDescriptionText}`,
  });
}

export async function evaluateTailoredResumeAgainstJDRaw(
  resumeText: string,
  jobDescriptionText: string,
): Promise<ResumeEvaluation> {
  return runStructuredCall({
    model: AI_EVAL_MODEL,
    schema: ResumeEvaluationSchema,
    schemaName: "resume_evaluation",
    stage: "evaluateResumeAgainstJDRaw",
    validationLabel: "AI response failed ResumeEvaluation validation",
    systemPrompt:
      "You are an expert recruiter and resume evaluator. Judge the resume's fit for the job using only the raw resume text and raw job description text. Score realistically from 0 to 100 like a careful ChatGPT-style review: reward clear semantic alignment even when wording differs, but do not assume unstated skills, experience, tools, metrics, titles, credentials, or projects. Consider summary, skills, experience, projects, education, clarity, and ATS readability. Weak resumes should score weakly, strong partial matches should get meaningful credit, and strong evidence-backed matches should score highly. This is a tailored version of the resume — give additional credit for exact JD keyword matches, improved ATS readability, and tighter phrasing alignment with the job description.",
    userPrompt: `Evaluate this tailored resume against this job description.\n\nScoring guidance:\n- Use the raw resume text as the only source of truth for candidate evidence.\n- Use the raw job description text as the only source of truth for role expectations.\n- Prefer human-realistic fit judgment over exact keyword counting.\n- Credit synonymous or semantically equivalent evidence when it is clearly supported.\n- Give extra credit when the resume uses exact JD terminology, leads bullets with the most JD-relevant content, and has a summary that directly addresses the role requirements.\n- Penalize missing must-have experience, unclear evidence, weak relevance, and poor readability.\n- Do not make the score automatically generous; calibrate it to the actual evidence.\n- matchedAreas and missingAreas should be concise role-fit areas, not raw keyword dumps.\n\nRESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION TEXT:\n${jobDescriptionText}`,
  });
}

export async function generateTailoredResumeFromRaw({
  resumeText,
  jobDescriptionText,
  originalEvaluation,
}: {
  resumeText: string;
  jobDescriptionText: string;
  originalEvaluation: ResumeEvaluation;
}): Promise<TailoringResult> {
  const matchedBlock =
    originalEvaluation.matchedAreas.length > 0
      ? `STRENGTHS TO PRESERVE — do NOT weaken or remove bullets that support these already-matched areas:\n${originalEvaluation.matchedAreas.map((a, i) => `${i + 1}. ${a}`).join("\n")}`
      : "";

  const gapsBlock =
    originalEvaluation.gaps.length > 0
      ? `GAPS TO CLOSE — only address a gap if the raw resume contains clear supporting evidence; skip it otherwise:\n${originalEvaluation.gaps.map((g, i) => `${i + 1}. ${g}`).join("\n")}`
      : "";

  const suggestionsBlock =
    originalEvaluation.improvementSuggestions.length > 0
      ? `IMPROVEMENT SUGGESTIONS — apply only where the source resume supports it:\n${originalEvaluation.improvementSuggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : "";

  const result = await runStructuredCall({
    model: AI_TAILOR_MODEL,
    schema: TailoringResultSchema,
    schemaName: "tailoring_result",
    stage: "generateTailoredResume",
    validationLabel: "AI response failed TailoredResume validation",
    temperature: 0.2,
    systemPrompt:
      "You are an expert resume writer. Your job is to produce a meaningfully rewritten, ATS-optimized version of the source resume that is tightly aligned with the target job description. You must never fabricate skills, tools, companies, titles, dates, metrics, credentials, or projects — all claims must be grounded in the source resume. Return structured JSON for rendering. Use stable sourceExperienceId values such as exp-1, exp-2 for source jobs in order of appearance. For evidenceIds, use short semantic labels that identify which source experience or bullet you drew from (e.g. 'exp-1-bullet-2', 'exp-2-lead-bullet'). For the skills field, preserve the exact category names and groupings from the source resume (e.g. Languages, Frontend, Backend, Tools). If the source has no categories, infer reasonable ones — never flatten all skills into a single group. For the projects field, each project is an object with: name (string), techStack (comma-separated tech string or null), date (string or null), and bullets (string array of accomplishments). For the education field, each entry is an object with: institution, degree, location (or null), date (or null), gpa (or null). All fields are required; use null for missing scalar values and [] for missing lists.",
    userPrompt: `Your PRIMARY goal is to maximize ATS keyword alignment and recruiter clarity for the target role. Every bullet in the most relevant experience entries must be meaningfully rewritten — not just 1–2 words changed, but restructured to lead with the JD's exact terminology where the source resume supports it.

RULES:
- Rewrite bullets to open with the most JD-relevant action verb and keyword from the job description, when the source experience supports it.
- Reorder bullets within each experience to lead with the most JD-relevant one.
- Rewrite the summary to open with the exact role title (or closest match from source), then address the top 2–3 JD requirements using language from the source resume.
- Within each skill group, reorder items to list those that appear verbatim in the JD first.
- Do NOT fabricate: do not add any skill, tool, company, title, date, metric, credential, or project that is not in the source resume.
- Keep all substantive sections (experience, projects, education, certifications) present in the source resume.
- evidenceIds are semantic traceability labels (e.g. 'exp-1-bullet-3') — they are NOT required to be verbatim quotes.

${matchedBlock}

${gapsBlock}

${suggestionsBlock}

RAW RESUME TEXT:
${resumeText}

RAW JOB DESCRIPTION TEXT:
${jobDescriptionText}`,
  });

  return result;
}
