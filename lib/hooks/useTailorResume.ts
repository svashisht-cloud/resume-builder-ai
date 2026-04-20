"use client";

import { useEffect, useRef, useState } from "react";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import { ResumeEvaluationSchema } from "@/types";
import type { ResumeEvaluation } from "@/types";
import type { TailorResponse } from "@/types/api";

export type LoadingStep = 0 | 1 | 2 | 3;

export type ViewState = "idle" | "loading" | "keyword-selection" | "result";

export interface TailorResumeState {
  result: TailorResponse | null;
  error: string;
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
  handleTailorResume: () => void;
  handleGenerateResume: (keywords: string[]) => void;
  toggleKeyword: (kw: string) => void;
  handleDownloadPdf: () => Promise<void>;
  handleDownloadDocx: () => Promise<void>;
  handlePrintResume: () => void;
  handleReset: () => void;
  openModal: () => void;
  closeModal: () => void;
  dismissNoCredits: () => void;
}

export function useTailorResume({
  resumeFile,
  jobDescription,
}: {
  resumeFile: File | null;
  jobDescription: string;
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
  const [isNoCreditsOpen, setIsNoCreditsOpen] = useState(false);

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
    : result ? "result"
    : "idle";

  async function runStep2And3(
    resumeText: string,
    originalEvaluation: ResumeEvaluation,
    keywords: string[],
    signal: AbortSignal,
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
        }),
        signal,
      });
      const step2Data = await step2Res.json();
      if (!step2Res.ok) throw new Error(step2Data.error ?? "Step 2 failed.");
      const { tailoredResume, changeLog } = step2Data;

      setLoadingStep(3);

      const step3Res = await fetch("/api/tailor/step3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailoredResume,
          jobDescriptionText: jobDescription,
          originalEvaluation,
          changeLog,
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

        // Store resume tracking metadata
        if (step1Data.resumeId) setResumeId(step1Data.resumeId as string);
        if (typeof step1Data.regenCount === "number") setRegenCount(step1Data.regenCount as number);

        const resumeText: string = step1Data.resumeText;
        const evalParsed = ResumeEvaluationSchema.safeParse(step1Data.originalEvaluation);
        if (!evalParsed.success) {
          throw new Error("Step 1 returned an unexpected response shape.");
        }
        const originalEvaluation: ResumeEvaluation = evalParsed.data;

        setInitialScore(originalEvaluation.score);

        const chips =
          originalEvaluation.missingAreas.length > 0
            ? originalEvaluation.missingAreas
            : originalEvaluation.gaps;

        if (chips.length === 0) {
          setPendingEvalData({ resumeText, originalEvaluation });
          await runStep2And3(resumeText, originalEvaluation, [], signal);
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

  function handleGenerateResume(keywords: string[]) {
    if (!pendingEvalData) return;
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { resumeText, originalEvaluation } = pendingEvalData;
    void runStep2And3(resumeText, originalEvaluation, keywords, abortControllerRef.current.signal);
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
        body: JSON.stringify({ tailoredResume: result.tailoredResume }),
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
        body: JSON.stringify({ tailoredResume: result.tailoredResume }),
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

  function handlePrintResume() {
    if (result) window.print();
  }

  function handleReset() {
    setNoTransition(true);
    setResult(null);
    setError("");
    setDownloadError("");
    setIsModalOpen(false);
    setRegenCount(0);
    setResumeId(null);
    setIsNoCreditsOpen(false);
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
    handleTailorResume,
    handleGenerateResume,
    toggleKeyword,
    handleDownloadPdf,
    handleDownloadDocx,
    handlePrintResume,
    handleReset,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    dismissNoCredits: () => setIsNoCreditsOpen(false),
  };
}
