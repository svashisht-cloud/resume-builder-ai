import OpenAI from "openai";

let openai: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for AI tailoring.");
  }

  openai ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai;
}

const DEFAULT_AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-chat-latest";
export const AI_EVAL_MODEL =
  process.env.OPENAI_EVAL_MODEL ?? DEFAULT_AI_MODEL;
export const AI_TAILOR_MODEL =
  process.env.OPENAI_TAILOR_MODEL ?? DEFAULT_AI_MODEL;
export const AI_PARSE_MODEL =
  process.env.OPENAI_PARSE_MODEL ?? "gpt-4.1-mini";
