import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  AI_EVAL_MODEL,
  AI_TAILOR_MODEL,
  getOpenAIClient,
} from "@/lib/ai/client";
import {
  buildEvalUserPrompt,
  buildRefineUserPrompt,
  buildTailoredEvalUserPrompt,
  buildTailorUserPrompt,
  EVAL_SYSTEM_PROMPT,
  REFINE_SYSTEM_PROMPT,
  TAILORED_EVAL_SYSTEM_PROMPT,
  TAILOR_SYSTEM_PROMPT,
  type ExperienceLevel,
  type TargetPages,
} from "@/lib/ai/prompts";
import {
  ChangeLogSchema,
  ResumeEvaluationSchema,
  TailoredResumeSchema,
  type ResumeEvaluation,
  type ScoreComparison,
  type TailoredResume,
} from "@/types";
import {
  DEFAULT_SECTION_ORDER,
  detectSectionOrder,
} from "@/lib/resume/detect-section-order";

const TailoringResultSchema = z.object({
  tailoredResume: TailoredResumeSchema,
  changeLog: ChangeLogSchema,
});

export type TailoringResult = z.infer<typeof TailoringResultSchema>;
export type TailoringResultWithUsage = TailoringResult & { usage: PipelineUsage };

export type PipelineUsage = { totalTokens: number; estimatedCostUsd: number };

const PRICING_PER_MILLION_TOKENS: Record<
  string,
  { input: number; cachedInput: number; output: number }
> = {
  "gpt-4.1": { input: 2, cachedInput: 0.5, output: 8 },
  "gpt-4.1-mini": { input: 0.4, cachedInput: 0.1, output: 1.6 },
  "gpt-4.1-nano": { input: 0.1, cachedInput: 0.025, output: 0.4 },
  "gpt-5-chat-latest": { input: 1.25, cachedInput: 0.125, output: 10.0 },
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
  if (!PRICING_PER_MILLION_TOKENS[model]) {
    console.warn(`[pipeline] Unknown model "${model}" — falling back to gpt-4.1 pricing. Update PRICING_PER_MILLION_TOKENS.`);
  }
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
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(5)),
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
}): Promise<{ data: z.infer<TSchema>; usage: PipelineUsage }> {
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

  const rawUsage = completion.usage ?? null;
  logOpenAICost({ stage, model, usage: rawUsage });

  const pricing = getPricing(model);
  const inputTokens = rawUsage?.prompt_tokens ?? 0;
  const cachedTokens = rawUsage?.prompt_tokens_details?.cached_tokens ?? 0;
  const billableInput = Math.max(inputTokens - cachedTokens, 0);
  const outputTokens = rawUsage?.completion_tokens ?? 0;
  const estimatedCostUsd =
    (billableInput / 1_000_000) * pricing.input +
    (cachedTokens / 1_000_000) * pricing.cachedInput +
    (outputTokens / 1_000_000) * pricing.output;
  const usage: PipelineUsage = {
    totalTokens: rawUsage?.total_tokens ?? inputTokens + outputTokens,
    estimatedCostUsd: Number(estimatedCostUsd.toFixed(5)),
  };

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

  // console.log(`[pipeline] raw model response (${validationLabel}):`, responseText);

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

  return { data: validation.data, usage };
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
  if (resume.contact.roleSubtitle?.trim()) {
    lines.push(resume.contact.roleSubtitle.trim());
  }

  for (const key of resume.sectionOrder ?? DEFAULT_SECTION_ORDER) {
    switch (key) {
      case "summary":
        if (resume.summary.trim()) {
          lines.push("", "SUMMARY", resume.summary);
        }
        break;
      case "education":
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
        break;
      case "skills":
        if (resume.skills.length > 0) {
          lines.push("", "SKILLS");
          for (const group of resume.skills) {
            lines.push(`${group.category}: ${group.items.join(", ")}`);
          }
        }
        break;
      case "experience":
        if (resume.experience.length > 0) {
          lines.push("", "EXPERIENCE");
          for (const experience of resume.experience) {
            lines.push(
              [experience.title, experience.company, experience.location, experience.dates]
                .filter(Boolean)
                .join(" | "),
            );
            for (const bullet of experience.bullets) {
              lines.push(`- ${bullet.text}`);
            }
          }
        }
        break;
      case "projects":
        if (resume.projects.length > 0) {
          lines.push("", "PROJECTS");
          for (const project of resume.projects) {
            const header = [project.name, project.techStack].filter(Boolean).join(" | ");
            const datePart = project.date ? ` (${project.date})` : "";
            const urlPart = project.url ? ` [${project.url}]` : "";
            lines.push(`${header}${datePart}${urlPart}`);
            for (const bullet of project.bullets) {
              lines.push(`- ${bullet}`);
            }
          }
        }
        break;
      case "certifications":
        if (resume.certifications.length > 0) {
          lines.push(
            "",
            "CERTIFICATIONS",
            ...resume.certifications.map((c) => `- ${c}`),
          );
        }
        break;
    }
  }

  return lines.join("\n").trim();
}

export async function evaluateResumeAgainstJDRaw(
  resumeText: string,
  jobDescriptionText: string,
): Promise<{ data: ResumeEvaluation; usage: PipelineUsage }> {
  return runStructuredCall({
    model: AI_EVAL_MODEL,
    schema: ResumeEvaluationSchema,
    schemaName: "resume_evaluation",
    stage: "evaluateResumeAgainstJDRaw",
    validationLabel: "AI response failed ResumeEvaluation validation",
    systemPrompt: EVAL_SYSTEM_PROMPT,
    userPrompt: buildEvalUserPrompt(resumeText, jobDescriptionText),
  });
}

export async function evaluateTailoredResumeAgainstJDRaw(
  resumeText: string,
  jobDescriptionText: string,
): Promise<{ data: ResumeEvaluation; usage: PipelineUsage }> {
  return runStructuredCall({
    model: AI_EVAL_MODEL,
    schema: ResumeEvaluationSchema,
    schemaName: "resume_evaluation",
    stage: "evaluateResumeAgainstJDRaw",
    validationLabel: "AI response failed ResumeEvaluation validation",
    systemPrompt: TAILORED_EVAL_SYSTEM_PROMPT,
    userPrompt: buildTailoredEvalUserPrompt(resumeText, jobDescriptionText),
  });
}

export async function generateTailoredResumeFromRaw({
  resumeText,
  jobDescriptionText,
  originalEvaluation,
  selectedKeywords = [],
  experienceLevel = 'mid',
  targetPages = 1,
}: {
  resumeText: string;
  jobDescriptionText: string;
  originalEvaluation: ResumeEvaluation;
  selectedKeywords?: string[];
  experienceLevel?: ExperienceLevel;
  targetPages?: TargetPages;
}): Promise<TailoringResultWithUsage> {
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

  const { data: result, usage } = await runStructuredCall({
    model: AI_TAILOR_MODEL,
    schema: TailoringResultSchema,
    schemaName: "tailoring_result",
    stage: "generateTailoredResume",
    validationLabel: "AI response failed TailoredResume validation",
    temperature: 0.2,
    systemPrompt: TAILOR_SYSTEM_PROMPT,
    userPrompt: buildTailorUserPrompt({
      matchedBlock,
      gapsBlock,
      suggestionsBlock,
      resumeText,
      jobDescriptionText,
      selectedKeywords,
      experienceLevel,
      targetPages,
    }),
  });

  return {
    ...result,
    tailoredResume: {
      ...result.tailoredResume,
      sectionOrder: detectSectionOrder(resumeText),
    },
    usage,
  };
}

export async function refineTailoredResume({
  previousTailoredResume,
  userFeedback,
  selectedItemTexts,
  jobDescriptionText,
  originalEvaluation,
  experienceLevel = 'mid',
  targetPages = 1,
}: {
  previousTailoredResume: TailoredResume;
  userFeedback: string;
  selectedItemTexts?: string[];
  jobDescriptionText: string;
  originalEvaluation: ResumeEvaluation;
  experienceLevel?: ExperienceLevel;
  targetPages?: TargetPages;
}): Promise<TailoringResultWithUsage> {
  const renderedTailored = renderTailoredResumeText(previousTailoredResume);

  const { data: result, usage } = await runStructuredCall({
    model: AI_TAILOR_MODEL,
    schema: TailoringResultSchema,
    schemaName: "tailoring_result",
    stage: "refineTailoredResume",
    validationLabel: "AI response failed TailoredResume validation (refine)",
    temperature: 0.2,
    systemPrompt: REFINE_SYSTEM_PROMPT,
    userPrompt: buildRefineUserPrompt({
      renderedTailored,
      userFeedback,
      selectedItemTexts,
      jobDescriptionText,
      originalEvaluation,
      experienceLevel,
      targetPages,
    }),
  });

  return {
    ...result,
    tailoredResume: {
      ...result.tailoredResume,
      sectionOrder: previousTailoredResume.sectionOrder,
    },
    usage,
  };
}
