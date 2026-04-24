"use client";

import { useEffect, useRef, useState } from "react";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { ResumeEvaluationSchema } from "@/types";
import type { ResumeEvaluation, TailoredResume, ResumeStyle } from "@/types";
import type { TailorResponse, Step1TelemetryMeta } from "@/types/api";

export type LoadingStep = 0 | 1 | 2 | 3;

export type ViewState = "idle" | "loading" | "keyword-selection" | "style-editing" | "regen-feedback" | "result";

export interface TailorResumeState {
  result: TailorResponse | null;
  error: string;
  warning: string | null;
  downloadError: string;
  loadingStep: LoadingStep;
  initialScore: number | null;
  pendingEvalData: { resumeText: string; originalEvaluation: ResumeEvaluation } | null;
  selectedKeywords: string[];
  isDownloadingPdf: boolean;
  isDownloadingDocx: boolean;
  isModalOpen: boolean;
  noTransition: boolean;
  viewState: ViewState;
  regenCount: number;
  resumeId: string | null;
  isNoCreditsOpen: boolean;
  isRegenFeedbackOpen: boolean;
  isStyleEditingOpen: boolean;
  isPaidCredit: boolean;
  dismissWarning: () => void;
  handleTailorResume: () => void;
  handleGenerateResume: (keywords: string[]) => void;
  toggleKeyword: (kw: string) => void;
  handleDownloadPdf: () => Promise<void>;
  handleDownloadDocx: () => Promise<void>;
  handleReset: () => void;
  openModal: () => void;
  closeModal: () => void;
  dismissNoCredits: () => void;
  handleOpenRegenFeedback: () => void;
  handleCloseRegenFeedback: () => void;
  handleRegenerateWithFeedback: (feedback: string, selectedItemTexts: string[]) => void;
  handleOpenStyleEditing: () => void;
  handleCloseStyleEditing: () => void;
}

export function useTailorResume({
  resumeFile,
  jobDescription,
  resumeStyle,
}: {
  resumeFile: File | null;
  jobDescription: string;
  resumeStyle?: ResumeStyle;
}): TailorResumeState {
  const abortControllerRef = useRef<AbortController | null>(null);

  const [result, setResult] = useState<TailorResponse | null>(null);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(0);
  const [initialScore, setInitialScore] = useState<number | null>(null);
  const [pendingEvalData, setPendingEvalData] = useState<{
    resumeText: string;
    originalEvaluation: ResumeEvaluation;
  } | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [step1Meta, setStep1Meta] = useState<Step1TelemetryMeta | undefined>(undefined);
  const [isNoCreditsOpen, setIsNoCreditsOpen] = useState(false);
  const [isRegenFeedbackOpen, setIsRegenFeedbackOpen] = useState(false);
  const [isStyleEditingOpen, setIsStyleEditingOpen] = useState(false);
  const [isPaidCredit, setIsPaidCredit] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsModalOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  const viewState: ViewState =
    loadingStep > 0 ? "loading"
    : pendingEvalData ? "keyword-selection"
    : isStyleEditingOpen ? "style-editing"
    : isRegenFeedbackOpen ? "regen-feedback"
    : result ? "result"
    : "idle";

  async function runStep2And3(
    resumeText: string,
    originalEvaluation: ResumeEvaluation,
    keywords: string[],
    signal: AbortSignal,
    step1Meta?: Step1TelemetryMeta,
  ) {
    try {
      setLoadingStep(2);

      const step2Res = await fetch("/api/tailor/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText: jobDescription,
          originalEvaluation,
          selectedKeywords: keywords,
          ...(step1Meta ?? {}),
        }),
        signal,
      });
      const step2Data = await step2Res.json();
      if (!step2Res.ok) throw new Error(step2Data.error ?? "Step 2 failed.");
      const { tailoredResume, changeLog, step1DurationMs, step2DurationMs, resumeId: s2ResumeId, tokensEval1, tokensTailor, eval1CostUsd, tailorCostUsd, isRegen: s2IsRegen } = step2Data;

      setLoadingStep(3);

      const step3Res = await fetch("/api/tailor/step3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailoredResume,
          jobDescriptionText: jobDescription,
          originalEvaluation,
          changeLog,
          step1DurationMs,
          step2DurationMs,
          resumeId: s2ResumeId,
          tokensEval1,
          tokensTailor,
          eval1CostUsd,
          tailorCostUsd,
          isRegen: s2IsRegen,
        }),
        signal,
      });
      const step3Data = await step3Res.json();
      if (!step3Res.ok) throw new Error(step3Data.error ?? "Step 3 failed.");

      setResult(step3Data as TailorResponse);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") return;
      setError(
        requestError instanceof Error ? requestError.message : "Tailoring request failed.",
      );
    } finally {
      setLoadingStep(0);
      setPendingEvalData(null);
    }
  }

  async function runRegenStep2And3(
    previousTailoredResume: TailoredResume,
    feedback: string,
    selectedItemTexts: string[],
    originalEvaluation: ResumeEvaluation,
    signal: AbortSignal,
    regenResumeId: string | null,
  ) {
    try {
      setLoadingStep(2);

      const step2Res = await fetch("/api/tailor/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousTailoredResume,
          userFeedback: feedback,
          selectedItemTexts,
          jobDescriptionText: jobDescription,
          originalEvaluation,
          resumeId: regenResumeId,
          isRegen: true,
        }),
        signal,
      });
      const step2Data = await step2Res.json();
      if (!step2Res.ok) throw new Error(step2Data.error ?? "Step 2 failed.");
      const { tailoredResume, changeLog, step2DurationMs, resumeId: s2ResumeId, tokensTailor, tailorCostUsd } = step2Data;

      setLoadingStep(3);

      const step3Res = await fetch("/api/tailor/step3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailoredResume,
          jobDescriptionText: jobDescription,
          originalEvaluation,
          changeLog,
          step2DurationMs,
          resumeId: s2ResumeId,
          tokensTailor,
          tailorCostUsd,
          isRegen: true,
        }),
        signal,
      });
      const step3Data = await step3Res.json();
      if (!step3Res.ok) throw new Error(step3Data.error ?? "Step 3 failed.");

      setResult(step3Data as TailorResponse);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") return;
      setError(
        requestError instanceof Error ? requestError.message : "Tailoring request failed.",
      );
    } finally {
      setLoadingStep(0);
      setPendingEvalData(null);
    }
  }

  function handleTailorResume() {
    if (!resumeFile || loadingStep !== 0 || pendingEvalData) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoadingStep(1);
    setInitialScore(null);
    setPendingEvalData(null);
    setSelectedKeywords([]);
    setError("");
    setDownloadError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resumeFile", resumeFile);
    formData.append("jobDescriptionText", jobDescription);
    formData.append("isFreshTailor", "true");

    void (async () => {
      try {
        const step1Res = await fetch("/api/tailor/step1", {
          method: "POST",
          body: formData,
          signal,
        });
        const step1Data = await step1Res.json();

        if (step1Res.status === 402 && step1Data.error === "no_credits") {
          setIsNoCreditsOpen(true);
          setLoadingStep(0);
          return;
        }

        if (step1Res.status === 403 && step1Data.error === "regen_limit_reached") {
          setError("You've reached the 2-regeneration limit for this job description. Start a new tailoring to continue.");
          setLoadingStep(0);
          return;
        }

        if (!step1Res.ok) throw new Error(step1Data.error ?? "Step 1 failed.");

        if (step1Data.resumeId) setResumeId(step1Data.resumeId as string);
        if (typeof step1Data.regenCount === "number") setRegenCount(step1Data.regenCount as number);
        if (typeof step1Data.isPaidCredit === "boolean") setIsPaidCredit(step1Data.isPaidCredit as boolean);
        if (step1Data.creditFallbackWarning === true) {
          setWarning("You've used your 100 resume monthly limit. This resume used 1 credit from your balance.");
        }

        const resumeText: string = step1Data.resumeText;
        const evalParsed = ResumeEvaluationSchema.safeParse(step1Data.originalEvaluation);
        if (!evalParsed.success) {
          throw new Error("Step 1 returned an unexpected response shape.");
        }
        const originalEvaluation: ResumeEvaluation = evalParsed.data;

        setInitialScore(originalEvaluation.score);

        const s1Meta = {
          step1DurationMs: typeof step1Data.step1DurationMs === "number" ? step1Data.step1DurationMs as number : null,
          tokensEval1: typeof step1Data.tokensEval1 === "number" ? step1Data.tokensEval1 as number : null,
          eval1CostUsd: typeof step1Data.eval1CostUsd === "number" ? step1Data.eval1CostUsd as number : null,
          resumeId: typeof step1Data.resumeId === "string" ? step1Data.resumeId as string : null,
          isRegen: typeof step1Data.isRegen === "boolean" ? step1Data.isRegen as boolean : false,
        };
        setStep1Meta(s1Meta);

        const chips =
          originalEvaluation.missingAreas.length > 0
            ? originalEvaluation.missingAreas
            : originalEvaluation.gaps;

        if (chips.length === 0) {
          setPendingEvalData({ resumeText, originalEvaluation });
          await runStep2And3(resumeText, originalEvaluation, [], signal, s1Meta);
        } else {
          setPendingEvalData({ resumeText, originalEvaluation });
          setLoadingStep(0);
        }
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setError(
          requestError instanceof Error ? requestError.message : "Tailoring request failed.",
        );
        setLoadingStep(0);
      }
    })();
  }

  function handleOpenRegenFeedback() {
    if (!result) {
      // No previous result in state (e.g. page refresh) — fall back to fresh tailor.
      handleTailorResume();
      return;
    }
    setIsRegenFeedbackOpen(true);
  }

  function handleRegenerateWithFeedback(feedback: string, selectedItemTexts: string[]) {
    if (!result || loadingStep !== 0) return;

    const snapshotTailored = result.tailoredResume;
    const snapshotOriginalEval = result.originalEvaluation;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsRegenFeedbackOpen(false);
    setLoadingStep(2); // skip step 1 — regen-init is a fast DB call, go straight to generate
    setInitialScore(null);
    setPendingEvalData(null);
    setSelectedKeywords([]);
    setError("");
    setDownloadError("");
    setResult(null);

    void (async () => {
      try {
        const regenInitRes = await fetch("/api/tailor/regen-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescriptionText: jobDescription }),
          signal,
        });
        const regenInitData = await regenInitRes.json();

        if (regenInitRes.status === 402 && regenInitData.error === "no_credits") {
          setIsNoCreditsOpen(true);
          setLoadingStep(0);
          return;
        }
        if (regenInitRes.status === 403 && regenInitData.error === "regen_limit_reached") {
          setError("You've reached the 2-regeneration limit for this job description. Start a new tailoring to continue.");
          setLoadingStep(0);
          return;
        }
        if (!regenInitRes.ok) throw new Error(regenInitData.error ?? "Regen init failed.");

        const regenResumeId = typeof regenInitData.resumeId === "string" ? regenInitData.resumeId as string : null;
        if (regenResumeId) setResumeId(regenResumeId);
        if (typeof regenInitData.regenCount === "number") setRegenCount(regenInitData.regenCount as number);

        await runRegenStep2And3(snapshotTailored, feedback, selectedItemTexts, snapshotOriginalEval, signal, regenResumeId);
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Tailoring request failed.");
        setLoadingStep(0);
      }
    })();
  }

  function handleGenerateResume(keywords: string[]) {
    if (!pendingEvalData) return;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { resumeText, originalEvaluation } = pendingEvalData;
    void runStep2And3(resumeText, originalEvaluation, keywords, abortControllerRef.current.signal, step1Meta);
  }

  function toggleKeyword(kw: string) {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw],
    );
  }

  async function handleDownloadPdf() {
    if (!result || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setDownloadError("");
    let url: string | null = null;
    try {
      const filename = buildResumePdfFilename({ resume: result.tailoredResume });
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tailoredResume: result.tailoredResume, resumeStyle }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "PDF download failed.");
      }
      const blob = await response.blob();
      url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      if (url) URL.revokeObjectURL(url);
      setIsDownloadingPdf(false);
    }
  }

  async function handleDownloadDocx() {
    if (!result || isDownloadingDocx) return;
    setIsDownloadingDocx(true);
    setDownloadError("");
    let url: string | null = null;
    try {
      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tailoredResume: result.tailoredResume, resumeStyle }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "DOCX download failed.");
      }
      const blob = await response.blob();
      url = URL.createObjectURL(blob);
      const filename = buildResumePdfFilename({ resume: result.tailoredResume }).replace(
        /\.pdf$/,
        ".docx",
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "DOCX download failed.");
    } finally {
      if (url) URL.revokeObjectURL(url);
      setIsDownloadingDocx(false);
    }
  }

  function handleReset() {
    setNoTransition(true);
    setResult(null);
    setError("");
    setDownloadError("");
    setIsModalOpen(false);
    setRegenCount(0);
    setResumeId(null);
    setStep1Meta(undefined);
    setIsPaidCredit(false);
    setWarning(null);
    setIsNoCreditsOpen(false);
    setIsRegenFeedbackOpen(false);
    setIsStyleEditingOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)));
  }

  return {
    result,
    error,
    downloadError,
    loadingStep,
    initialScore,
    pendingEvalData,
    selectedKeywords,
    isDownloadingPdf,
    isDownloadingDocx,
    isModalOpen,
    noTransition,
    viewState,
    regenCount,
    resumeId,
    isNoCreditsOpen,
    isRegenFeedbackOpen,
    isStyleEditingOpen,
    isPaidCredit,
    warning,
    dismissWarning: () => setWarning(null),
    handleTailorResume,
    handleGenerateResume,
    toggleKeyword,
    handleDownloadPdf,
    handleDownloadDocx,
    handleReset,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    dismissNoCredits: () => setIsNoCreditsOpen(false),
    handleOpenRegenFeedback,
    handleCloseRegenFeedback: () => setIsRegenFeedbackOpen(false),
    handleRegenerateWithFeedback,
    handleOpenStyleEditing: () => setIsStyleEditingOpen(true),
    handleCloseStyleEditing: () => setIsStyleEditingOpen(false),
  };
}
