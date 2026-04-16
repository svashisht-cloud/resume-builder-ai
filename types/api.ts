import type {
  ChangeLog,
  ResumeEvaluation,
  ScoreComparison,
  TailoredResume,
} from "@/types";

export type TailorResponse = {
  tailoredResume: TailoredResume;
  originalEvaluation: ResumeEvaluation;
  tailoredEvaluation: ResumeEvaluation;
  scoreComparison: ScoreComparison;
  evaluationMode: "llm";
  changeLog: ChangeLog;
};
