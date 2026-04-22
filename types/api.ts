import type {
  ChangeLog,
  ResumeEvaluation,
  ScoreComparison,
  TailoredResume,
} from "@/types";

export type Step1TelemetryMeta = {
  step1DurationMs: number | null;
  tokensEval1: number | null;
  eval1CostUsd: number | null;
  resumeId: string | null;
  isRegen: boolean;
};

export type TailorResponse = {
  tailoredResume: TailoredResume;
  originalEvaluation: ResumeEvaluation;
  tailoredEvaluation: ResumeEvaluation;
  scoreComparison: ScoreComparison;
  evaluationMode: "llm";
  changeLog: ChangeLog;
};
