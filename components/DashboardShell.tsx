"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ResumePreview } from "@/components/ResumePreview";
import { useTailorResume } from "@/lib/hooks/useTailorResume";
import NoCreditsModal from "@/components/NoCreditsModal";
import { FileText, Briefcase, ArrowRight, Check, X, RefreshCw, AlertCircle, ChevronLeft, Sparkles, Download, FileDown, Upload, Info, Paintbrush, Eye, RotateCcw, MousePointerClick, Lock } from "lucide-react";
import type { ResumeStyle } from "@/types";
import { DEFAULT_RESUME_STYLE, ResumeStyleSchema } from "@/types";

const RESUME_PAGE_WIDTH_PX = 816;
const PREVIEW_CARD_SCALE = 400 / RESUME_PAGE_WIDTH_PX;
const PREVIEW_CARD_HEIGHT = Math.round(PREVIEW_CARD_SCALE * 1056);

function formatScoreDelta(scoreDelta: number) {
  return scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`;
}

function FeedbackList({
  emptyText,
  items,
}: {
  emptyText: string;
  items: string[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-text-dim">{emptyText}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-muted">
          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-border" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Tooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ x: number; y: number; above: boolean } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function show() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: r.left + r.width / 2,
      y: r.top > window.innerHeight / 2 ? r.top - 6 : r.bottom + 6,
      above: r.top > window.innerHeight / 2,
    });
  }

  const tooltip = pos
    ? createPortal(
        <span
          className="pointer-events-none w-48 rounded-lg border border-border/60 bg-surface-raised px-3 py-2 text-xs leading-4 text-muted shadow-lg"
          style={{
            position: "fixed",
            left: pos.x,
            transform: `translateX(-50%) translateY(${pos.above ? "-100%" : "0%"})`,
            top: pos.y,
            zIndex: 9999,
          }}
        >
          {text}
        </span>,
        document.body,
      )
    : null;

  return (
    <span ref={ref} className="inline-flex items-center" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      <Info size={13} className="cursor-help text-text-dim transition-colors hover:text-muted" />
      {tooltip}
    </span>
  );
}

const SECTION_ORDER = ["Skills", "Work Experience", "Projects", "Certifications", "Other"] as const;

function getSectionLabel(id: string): string {
  if (id.startsWith("skill-")) return "Skills";
  if (id.startsWith("exp-")) return "Work Experience";
  if (id.startsWith("proj-")) return "Projects";
  if (id.startsWith("cert-")) return "Certifications";
  return "Other";
}

function SizeToggle({ value, onChange }: { value: "small" | "medium" | "large"; onChange: (v: "small" | "medium" | "large") => void }) {
  return (
    <div className={`flex overflow-hidden rounded-lg border transition-shadow ${value !== "medium" ? "border-accent/40 shadow-accent-soft" : "border-border/60"}`}>
      {(["small", "medium", "large"] as const).map((v, i, arr) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${i < arr.length - 1 ? "border-r border-border/60" : ""} ${
            value === v ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface-raised hover:text-foreground"
          }`}
        >
          {v === "small" ? "S" : v === "medium" ? "M" : "L"}
        </button>
      ))}
    </div>
  );
}

function SpacingToggle({ value, onChange }: { value: "compact" | "normal" | "relaxed"; onChange: (v: "compact" | "normal" | "relaxed") => void }) {
  return (
    <div className={`flex overflow-hidden rounded-lg border transition-shadow ${value !== "normal" ? "border-accent/40 shadow-accent-soft" : "border-border/60"}`}>
      {(["compact", "normal", "relaxed"] as const).map((v, i, arr) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${i < arr.length - 1 ? "border-r border-border/60" : ""} ${
            value === v ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface-raised hover:text-foreground"
          }`}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function DashboardShell({
  experienceLevel = 'mid',
  plan = 'free',
  creditsRemaining = 0,
}: {
  experienceLevel?: 'junior' | 'mid' | 'senior'
  plan?: 'free' | 'pro_monthly' | 'pro_annual'
  creditsRemaining?: number
}) {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [regenFeedback, setRegenFeedback] = useState("");
  const [selectedItems, setSelectedItems] = useState<Map<string, string>>(new Map());
  const [refineScale, setRefineScale] = useState(1);
  const [styleScale, setStyleScale] = useState(1);
  const [modalScale, setModalScale] = useState(1);
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>(DEFAULT_RESUME_STYLE);
  const [targetPages, setTargetPages] = useState<1 | 2>(1);
  const [refineTab, setRefineTab] = useState<"left" | "right">("left");
  const [styleTab, setStyleTab] = useState<"left" | "right">("left");
  const [isMobile, setIsMobile] = useState(false);
  const refineRoRef = useRef<ResizeObserver | null>(null);
  const styleRoRef = useRef<ResizeObserver | null>(null);
  const modalRoRef = useRef<ResizeObserver | null>(null);

  const refineRightRef = useCallback((el: HTMLDivElement | null) => {
    refineRoRef.current?.disconnect();
    refineRoRef.current = null;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - 64;
      setRefineScale(Math.min(1, available / RESUME_PAGE_WIDTH_PX));
    });
    ro.observe(el);
    refineRoRef.current = ro;
  }, []);

  const styleRightRef = useCallback((el: HTMLDivElement | null) => {
    styleRoRef.current?.disconnect();
    styleRoRef.current = null;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - 64;
      setStyleScale(Math.min(1, available / RESUME_PAGE_WIDTH_PX));
    });
    ro.observe(el);
    styleRoRef.current = ro;
  }, []);

  const modalRef = useCallback((el: HTMLDivElement | null) => {
    modalRoRef.current?.disconnect();
    modalRoRef.current = null;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setModalScale(Math.min(1, entry.contentRect.width / RESUME_PAGE_WIDTH_PX));
    });
    ro.observe(el);
    modalRoRef.current = ro;
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const effectiveTargetPages: 1 | 2 = experienceLevel === 'senior' ? targetPages : 1;
  const isFreePlan = plan === "free";
  const isOutOfCredits = isFreePlan && creditsRemaining <= 0;

  const {
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
    isNoCreditsOpen,
    handleTailorResume,
    handleGenerateResume,
    toggleKeyword,
    handleDownloadPdf,
    handleDownloadDocx,
    handleReset,
    openModal,
    closeModal,
    dismissNoCredits,
    handleOpenRegenFeedback,
    handleCloseRegenFeedback,
    handleRegenerateWithFeedback,
    isStyleEditingOpen,
    handleOpenStyleEditing,
    handleCloseStyleEditing,
    isPaidCredit,
    warning,
    dismissWarning,
  } = useTailorResume({ resumeFile, jobDescription, resumeStyle, experienceLevel, targetPages: effectiveTargetPages, plan, creditsRemaining });

  function handleItemToggle(id: string, text: string) {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, text);
      }
      return next;
    });
  }

  const canTailor =
    resumeFileName.length > 0 &&
    jobDescription.trim().length > 0 &&
    loadingStep === 0 &&
    !pendingEvalData;

  return (
    <>
      {/* ── 3-panel sliding container ── */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className={noTransition ? "flex h-full" : "flex h-full transition-transform duration-[350ms] ease-in-out"}
          style={{
            width: "300vw",
            transform:
              viewState === "idle"
                ? "translateX(0)"
                : (viewState === "result" || viewState === "regen-feedback" || viewState === "style-editing")
                  ? "translateX(-200vw)"
                  : "translateX(-100vw)",
          }}
        >

          {/* ── Panel 1: Dashboard ── */}
          <div className="h-full w-screen flex-shrink-0 overflow-hidden bg-background">
            <main className="flex h-full flex-col px-4 py-5 text-foreground sm:px-6 lg:px-8">
              <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
                <header className="mb-5 shrink-0">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                    AI Resume Tailoring
                  </p>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Tailor your resume to{" "}
                    <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                      any job
                    </span>
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Upload your resume and paste a job description. The tailoring stays grounded in your actual experience.
                  </p>
                </header>

                {isFreePlan && creditsRemaining <= 1 && (
                  <div className="mb-6 rounded-xl border border-accent/25 bg-accent/8 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="max-w-xs">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                          Free Plan
                        </p>
                        <h2 className="mt-2 font-display text-lg font-semibold leading-tight text-foreground">
                          {isOutOfCredits
                            ? "You’re out of free credits."
                            : `${creditsRemaining} free credit${creditsRemaining === 1 ? "" : "s"} remaining.`}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {isOutOfCredits
                            ? "Upgrade to Pro for unlimited tailoring — from $12/mo."
                            : "Upgrade to Pro to keep tailoring without watching your balance — from $12/mo."}
                        </p>
                      </div>
                      <Link
                        href="/settings?section=billing&highlight=pro"
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent-hover px-5 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98] sm:w-auto sm:shrink-0"
                      >
                        <Sparkles size={12} />
                        Upgrade to Pro
                      </Link>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger-border bg-danger-bg p-4 text-sm text-danger-fg">
                    <X size={15} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {warning && (
                  <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-warning-border bg-warning-bg p-4 text-sm text-warning-fg">
                    <span>{warning}</span>
                    <button
                      type="button"
                      onClick={dismissWarning}
                      className="shrink-0 text-warning-fg/60 transition-colors hover:text-warning-fg"
                      aria-label="Dismiss warning"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
                  {/* Top accent line */}
                  <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                  <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-6">
                    {/* Resume upload */}
                    <div className="shrink-0">
                      <div className="mb-2 flex items-center gap-2">
                        <FileText size={14} className="text-accent" />
                        <label className="text-sm font-semibold text-foreground" htmlFor="resume-upload">
                          Resume
                        </label>
                      </div>
                      <label
                        htmlFor="resume-upload"
                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-background px-4 py-6 text-center transition-colors hover:border-accent/60 hover:bg-accent/[0.03]"
                      >
                        <Upload size={20} className="text-text-dim" />
                        <span className="text-sm font-medium text-muted">
                          Drop your resume here or <span className="text-accent">browse</span>
                        </span>
                        <span className="text-xs text-text-dim">.pdf, .docx, or .txt · max 5 MB</span>
                      </label>
                      <input
                        accept=".pdf,.docx,.txt"
                        className="sr-only"
                        id="resume-upload"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setResumeFile(file);
                          setResumeFileName(file?.name ?? "");
                        }}
                        type="file"
                      />
                      {resumeFileName && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Check size={12} className="text-accent" />
                          <p className="text-xs text-muted">
                            <span className="font-medium text-foreground">{resumeFileName}</span> selected
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Job description */}
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="mb-2 flex items-center gap-2">
                        <Briefcase size={14} className="text-accent" />
                        <label className="text-sm font-semibold text-foreground" htmlFor="job-description">
                          Job description
                        </label>
                      </div>
                      <textarea
                        className="min-h-0 flex-1 w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-text-dim focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
                        id="job-description"
                        onChange={(event) => setJobDescription(event.target.value)}
                        placeholder="Paste the target job description here…"
                        value={jobDescription}
                      />
                    </div>

                    {experienceLevel === 'senior' && (
                      <div className="shrink-0">
                        <div className="mb-1.5">
                          <span className="text-sm font-semibold text-foreground">Resume length</span>
                        </div>
                        <div className="flex rounded-lg border border-border/60 bg-surface-raised p-0.5 gap-0.5 w-fit">
                          {([1, 2] as const).map((pages) => (
                            <button
                              key={pages}
                              type="button"
                              aria-pressed={targetPages === pages}
                              onClick={() => setTargetPages(pages)}
                              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                targetPages === pages
                                  ? 'bg-accent text-accent-foreground shadow-sm'
                                  : 'text-muted hover:text-foreground'
                              }`}
                            >
                              {pages === 1 ? '1 Page' : '2 Pages'}
                            </button>
                          ))}
                        </div>
                        {targetPages === 2 && (
                          <p className="mt-1.5 text-xs text-muted">2-page resumes include more bullets and fuller detail.</p>
                        )}
                      </div>
                    )}

                    <button
                      className="group flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-hover px-4 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-accent-soft hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-border disabled:to-border disabled:text-text-dim disabled:shadow-none sm:w-auto"
                      disabled={!canTailor}
                      onClick={handleTailorResume}
                      type="button"
                    >
                      Tailor Resume
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5 group-disabled:hidden" />
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* ── Panel 2: Working Area ── */}
          <div className="relative h-full w-screen flex-shrink-0 overflow-hidden bg-background">

            {/* Loading sub-panel */}
            <div
              className="absolute bottom-0 left-0 top-0 flex flex-col items-center justify-center px-4"
              style={{
                right: (!isMobile && viewState === "keyword-selection") ? "50%" : "0",
                transition: "right 350ms ease-in-out",
              }}
            >
              <div className="w-full max-w-xs text-center">
                {loadingStep === 1 ? (
                  <p className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
                    Tailoring your resume…
                  </p>
                ) : initialScore !== null ? (
                  <div className="mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                      Initial ATS Score
                    </p>
                    <div className="mt-3 flex items-end justify-center gap-1.5">
                      <span className="font-mono bg-gradient-to-br from-accent to-accent-secondary bg-clip-text text-5xl font-bold leading-none tracking-tight text-transparent sm:text-7xl md:text-8xl">
                        {initialScore}
                      </span>
                      <span className="mb-2 text-2xl font-light text-text-dim">/100</span>
                    </div>
                  </div>
                ) : null}

                <p className="mb-6 text-sm font-medium text-text-dim">
                  <span key={loadingStep} style={{ animation: "fade-in 0.3s ease forwards" }}>
                    {loadingStep === 1 && "Analyzing your resume against the job description…"}
                    {loadingStep === 2 && "Generating your tailored resume…"}
                    {loadingStep === 3 && "Getting your final ATS rating…"}
                    {loadingStep === 0 && pendingEvalData && "Review the skills on the right, then generate."}
                  </span>
                </p>

                {loadingStep > 0 && (
                  <div className="mb-8 flex justify-center">
                    <div
                      className="h-10 w-10 animate-spin rounded-full"
                      style={{
                        background: "conic-gradient(from 0deg, transparent 0deg, var(--accent) 300deg, var(--accent-secondary) 360deg)",
                        WebkitMask: "radial-gradient(farthest-side, transparent 55%, black 56%)",
                        mask: "radial-gradient(farthest-side, transparent 55%, black 56%)",
                      }}
                    />
                  </div>
                )}

                {/* Progress bar */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:
                        loadingStep === 2 ? "66%"
                        : loadingStep === 3 ? "90%"
                        : "33%",
                      background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                      backgroundSize: "200% 100%",
                      animation: "gradient-flow 2.5s ease infinite",
                      transition: "width 700ms ease-in-out",
                      boxShadow: "var(--shadow-accent-soft)",
                    }}
                  />
                </div>

                <div className="mt-2.5 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                  <span>Analyze</span>
                  <span>Generate</span>
                  <span>Score</span>
                </div>
              </div>
            </div>

            {/* Keywords sub-panel */}
            <div
              className={`absolute bottom-0 right-0 top-0 w-full overflow-y-auto border-l border-border/60 bg-background transition-transform duration-[350ms] ease-in-out md:w-1/2 ${
                viewState === "keyword-selection" ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {pendingEvalData && (
                <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
                  <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                      <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Any hidden experience?
                      </h2>
                      <p className="mt-2 text-sm text-text-dim">
                        Skills flagged as missing. Select any you genuinely have — we&apos;ll weave them in.
                      </p>
                    </div>

                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                      {(pendingEvalData.originalEvaluation.missingAreas.length > 0
                        ? pendingEvalData.originalEvaluation.missingAreas
                        : pendingEvalData.originalEvaluation.gaps
                      ).map((kw) => {
                        const selected = selectedKeywords.includes(kw);
                        return (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => toggleKeyword(kw)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all ${
                              selected
                                ? "border-accent/50 bg-accent/15 text-accent shadow-accent-soft"
                                : "border-border/60 text-text-dim hover:border-muted/40 hover:text-muted"
                            }`}
                          >
                            {selected && <Check size={12} />}
                            {kw}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleGenerateResume(selectedKeywords)}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-hover px-4 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98]"
                      >
                        {selectedKeywords.length > 0
                          ? `Generate with ${selectedKeywords.length} selected`
                          : "Generate Resume"}
                        <ArrowRight size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateResume([])}
                        className="text-sm font-medium text-text-dim transition-colors hover:text-muted"
                      >
                        Skip & generate without additions
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Panel 3: Result / Refine ── */}
          <div className="relative h-full w-screen flex-shrink-0 overflow-hidden bg-background">

            {/* Refine layer — slides in from right */}
            <div className={`absolute inset-0 transition-transform duration-[350ms] ease-in-out ${
              viewState === "regen-feedback" ? "translate-x-0" : "translate-x-full"
            }`}>
              {result && (
              /* ── Refine layout: tabs on mobile, 2-column on desktop ── */
              <div className="flex h-full flex-col" style={{ animation: "fade-in-up 0.3s ease forwards" }}>

                {/* Mobile tab bar */}
                <div className="flex shrink-0 border-b border-border/60 md:hidden">
                  <button
                    type="button"
                    onClick={() => setRefineTab("left")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${refineTab === "left" ? "border-b-2 border-accent text-accent" : "text-text-dim hover:text-muted"}`}
                  >
                    Refine
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefineTab("right")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${refineTab === "right" ? "border-b-2 border-accent text-accent" : "text-text-dim hover:text-muted"}`}
                  >
                    Preview
                  </button>
                </div>

                {/* Sliding track — clips off-screen panel on mobile, both visible side-by-side on desktop */}
                <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className={`flex h-full w-[200%] shrink-0 transition-transform duration-[250ms] ease-in-out md:w-full md:translate-x-0 ${refineTab === "right" ? "-translate-x-1/2" : "translate-x-0"}`}>
                {/* Left panel */}
                <div className="flex h-full w-1/2 flex-col overflow-hidden border-border/60 border-b md:border-b-0 md:border-r">
                  <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  <div className="flex min-h-0 flex-1 flex-col px-6 py-6">
                    <button
                      type="button"
                      onClick={handleCloseRegenFeedback}
                      className="mb-5 flex w-fit shrink-0 items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2.5 text-sm font-medium text-muted transition-all hover:border-border hover:text-foreground"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>

                    <div className="mb-6 shrink-0">
                      <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                        <Sparkles size={16} className="text-accent" />
                        Refine your resume
                      </h2>
                      <p className="mt-2 text-sm text-text-dim">
                        Describe what you&apos;d like changed, or click bullets on the right to highlight specific items.
                      </p>
                    </div>

                    <textarea
                      className="min-h-32 w-full shrink-0 resize-none rounded-lg border border-border/60 bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-text-dim focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
                      placeholder="What would you like changed? (optional)"
                      value={regenFeedback}
                      onChange={(e) => setRegenFeedback(e.target.value)}
                    />

                    {/* Scrollable selected items — flex-1 so regen button stays pinned at bottom */}
                    <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
                      {selectedItems.size === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/40 px-4 py-5 text-center">
                          <MousePointerClick size={16} className="text-text-dim" />
                          <p className="text-xs leading-relaxed text-text-dim">Click any bullet or skill on the right to pin it here</p>
                        </div>
                      ) : (() => {
                        const grouped = new Map<string, Array<[string, string]>>();
                        for (const [id, text] of selectedItems.entries()) {
                          const label = getSectionLabel(id);
                          if (!grouped.has(label)) grouped.set(label, []);
                          grouped.get(label)!.push([id, text]);
                        }
                        const orderedSections = SECTION_ORDER.filter((s) => grouped.has(s));
                        return (
                          <div className="pb-2">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-dim">
                              Selected items{" "}
                              <span className="text-accent">({selectedItems.size})</span>
                            </p>
                            {orderedSections.map((section) => (
                              <div key={section} className="mb-4">
                                <p className="mb-1.5 border-l-2 border-accent/30 pl-2 text-[10px] font-bold uppercase tracking-widest text-accent/80">
                                  {section}
                                </p>
                                <div className="space-y-1.5">
                                  {grouped.get(section)!.map(([id, text]) => (
                                    <div
                                      key={id}
                                      style={{ animation: "fade-in-up 0.28s ease forwards" }}
                                      className="group flex items-start gap-2.5 rounded-lg border border-accent/25 bg-accent/6 px-3 py-2.5"
                                    >
                                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
                                      <p className="flex-1 text-sm leading-[1.45] text-foreground/90">{text}</p>
                                      <button
                                        type="button"
                                        onClick={() => handleItemToggle(id, text)}
                                        className="mt-0.5 shrink-0 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                                        aria-label="Remove"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="shrink-0 pt-4">
                      <button
                        type="button"
                        onClick={() => handleRegenerateWithFeedback(regenFeedback, [...selectedItems.values()])}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-hover px-4 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98]"
                      >
                        <RefreshCw size={14} />
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right panel — interactive resume viewer */}
                <div ref={refineRightRef} className="flex h-full w-1/2 flex-col overflow-hidden">
                  <div className="flex shrink-0 items-center gap-1.5 border-b border-border/40 bg-background/90 px-8 py-2.5 backdrop-blur-sm">
                    <Eye size={12} className="text-text-dim" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-text-dim">Live Preview</span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div style={{ zoom: refineScale, width: RESUME_PAGE_WIDTH_PX }}>
                      <ResumePreview
                        resume={result.tailoredResume}
                        resumeStyle={resumeStyle}
                        interactiveMode
                        selectedItemIds={selectedItems}
                        onItemToggle={handleItemToggle}
                      />
                    </div>
                  </div>
                </div>
                </div>
                </div>
              </div>
              )}
            </div>

            {/* Style editor layer — slides in from right */}
            <div className={`absolute inset-0 transition-transform duration-[350ms] ease-in-out ${
              isStyleEditingOpen ? "translate-x-0" : "translate-x-full"
            }`}>
              {result && (
                <div className="flex h-full flex-col" style={{ animation: "fade-in-up 0.3s ease forwards" }}>
                  {/* Mobile tab bar */}
                  <div className="flex shrink-0 border-b border-border/60 md:hidden">
                    <button
                      type="button"
                      onClick={() => setStyleTab("left")}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${styleTab === "left" ? "border-b-2 border-accent text-accent" : "text-text-dim hover:text-muted"}`}
                    >
                      Style
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyleTab("right")}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${styleTab === "right" ? "border-b-2 border-accent text-accent" : "text-text-dim hover:text-muted"}`}
                    >
                      Preview
                    </button>
                  </div>

                  {/* Sliding track */}
                  <div className="flex min-h-0 flex-1 overflow-hidden">
                  <div className={`flex h-full w-[200%] shrink-0 transition-transform duration-[250ms] ease-in-out md:w-full md:translate-x-0 ${styleTab === "right" ? "-translate-x-1/2" : "translate-x-0"}`}>
                  {/* Left panel — style controls */}
                  <div className="flex h-full w-1/2 flex-col overflow-hidden border-border/60 border-b md:border-b-0 md:border-r">
                    <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                    <div className="flex min-h-0 flex-1 flex-col px-6 py-6">
                      {/* Pinned top: Back button + heading */}
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={handleCloseStyleEditing}
                          className="mb-5 flex w-fit items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2.5 text-sm font-medium text-muted transition-all hover:border-border hover:text-foreground"
                        >
                          <ChevronLeft size={14} />
                          Back
                        </button>

                        <div className="mb-5">
                          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                            <Paintbrush size={16} className="text-accent" />
                            Style your resume
                          </h2>
                          <p className="mt-1.5 text-sm text-text-dim">Changes appear live on the right.</p>
                        </div>
                      </div>

                      {/* Scrollable controls */}
                      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                        <div className="space-y-6 pb-2">
                          {/* Typography */}
                          <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-dim">Typography</p>

                            <div className="mb-4">
                              <label className="mb-1.5 block text-sm font-medium text-muted">Font family</label>
                              <div className="relative">
                                <select
                                  value={resumeStyle.fontFamily}
                                  onChange={(e) => {
                                    const parsed = ResumeStyleSchema.shape.fontFamily.safeParse(e.target.value);
                                    if (parsed.success) setResumeStyle((s) => ({ ...s, fontFamily: parsed.data }));
                                  }}
                                  className="w-full appearance-none rounded-lg border border-border/60 bg-background py-2 pl-3 pr-8 text-sm text-foreground outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
                                >
                                  <option value="times">Times New Roman</option>
                                  <option value="helvetica">Helvetica / Arial</option>
                                </select>
                                <ChevronLeft size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-text-dim" />
                              </div>
                            </div>

                            <p className="mb-2 text-xs font-medium text-text-dim">Font sizes</p>
                          <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted">Name</span>
                                <SizeToggle value={resumeStyle.nameSize} onChange={(v) => setResumeStyle((s) => ({ ...s, nameSize: v }))} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted">Section headers</span>
                                <SizeToggle value={resumeStyle.headerSize} onChange={(v) => setResumeStyle((s) => ({ ...s, headerSize: v }))} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted">Body & bullets</span>
                                <SizeToggle value={resumeStyle.bodySize} onChange={(v) => setResumeStyle((s) => ({ ...s, bodySize: v }))} />
                              </div>
                            </div>
                          </div>

                          <hr className="border-border/40" />

                          {/* Spacing */}
                          <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-dim">Spacing</p>
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted">Bullet spacing</span>
                                <SpacingToggle value={resumeStyle.bulletSpacing} onChange={(v) => setResumeStyle((s) => ({ ...s, bulletSpacing: v }))} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted">Section spacing</span>
                                <SpacingToggle value={resumeStyle.sectionSpacing} onChange={(v) => setResumeStyle((s) => ({ ...s, sectionSpacing: v }))} />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setResumeStyle(DEFAULT_RESUME_STYLE)}
                            className="flex items-center gap-1.5 text-xs font-medium text-text-dim transition-colors hover:text-foreground"
                          >
                            <RotateCcw size={12} />
                            Reset to defaults
                          </button>
                        </div>
                      </div>

                      {/* Pinned bottom: Save button */}
                      <div className="shrink-0 pt-5">
                        <button
                          type="button"
                          onClick={handleCloseStyleEditing}
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-hover px-4 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98]"
                        >
                          <Check size={14} />
                          Save style
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right panel — live preview */}
                  <div ref={styleRightRef} className="flex h-full w-1/2 flex-col overflow-hidden">
                    <div className="flex shrink-0 items-center gap-1.5 border-b border-border/40 bg-background/90 px-8 py-2.5 backdrop-blur-sm">
                      <Eye size={12} className="text-text-dim" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-text-dim">Live Preview</span>
                    </div>
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                      <div style={{ zoom: styleScale, width: RESUME_PAGE_WIDTH_PX }}>
                        <ResumePreview resume={result.tailoredResume} resumeStyle={resumeStyle} />
                      </div>
                    </div>
                  </div>
                  </div>
                  </div>
                </div>
              )}
            </div>

            {/* Result layer — slides out to left when refine or style editing opens */}
            <div className={`absolute inset-0 transition-transform duration-[350ms] ease-in-out ${
              viewState === "regen-feedback" || viewState === "style-editing" ? "-translate-x-full" : "translate-x-0"
            }`}>
              {result && (
              /* ── Existing result layout ── */
              <div className="h-full overflow-y-auto">
                <main className="min-h-full px-4 py-8 text-foreground sm:px-6 lg:px-8">
                  <div className="mx-auto w-full max-w-6xl">
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                        onClick={() => { handleReset(); setResumeStyle(DEFAULT_RESUME_STYLE); }}
                        type="button"
                      >
                        ← Back to Dashboard
                      </button>
                      {regenCount >= 5 && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="text-xs text-accent underline-offset-2 hover:underline"
                        >
                          Start a new tailoring →
                        </button>
                      )}
                    </div>

                    {downloadError && (
                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger-border bg-danger-bg p-4 text-sm text-danger-fg">
                        <X size={15} className="mt-0.5 flex-shrink-0" />
                        {downloadError}
                      </div>
                    )}

                    <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]" style={{ animation: "fade-in-up 0.45s ease forwards" }}>
                      {/* ── Resume preview — first in DOM = top on mobile; placed right on desktop ── */}
                      <div className="lg:col-start-2 lg:row-start-1">
                        <div className="sticky top-8">
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                              Tailored Resume
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title={isPaidCredit ? "Style resume" : "Pro feature — upgrade to style your resume"}
                                onClick={isPaidCredit ? () => { setStyleTab("left"); handleOpenStyleEditing(); } : () => router.push('/settings?section=billing&highlight=pro')}
                                className={`flex items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                                  isPaidCredit
                                    ? "border-border/60 text-muted hover:border-border hover:text-foreground"
                                    : "border-accent/30 bg-accent/5 text-accent/70 hover:border-accent/50 hover:text-accent"
                                }`}
                              >
                                {isPaidCredit ? <Paintbrush size={12} /> : <Lock size={12} />}
                                Style
                              </button>
                              {regenCount < 5 ? (
                                <button
                                  type="button"
                                  onClick={() => { setRegenFeedback(""); setSelectedItems(new Map()); setRefineTab("left"); handleOpenRegenFeedback(); }}
                                  disabled={loadingStep !== 0}
                                  className="flex items-center gap-1.5 rounded-lg border border-accent/50 bg-accent/8 px-3 py-2 text-xs font-semibold text-accent transition-all hover:border-accent/70 hover:bg-accent/15 disabled:cursor-not-allowed disabled:border-border disabled:text-text-dim"
                                >
                                  <RefreshCw size={14} />
                                  Regenerate
                                  <span className="text-accent/50">({regenCount}/5)</span>
                                </button>
                              ) : (
                                <span className="rounded-lg border border-danger-border bg-danger-bg px-2.5 py-1.5 text-xs font-medium text-danger-fg">
                                  Limit reached (5/5)
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            aria-label="Preview tailored resume"
                            className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-white shadow-[var(--shadow-card)] transition-all hover:border-accent/30 hover:shadow-accent-soft"
                            onClick={openModal}
                            style={{ height: PREVIEW_CARD_HEIGHT }}
                            type="button"
                          >
                            <div
                              className="absolute top-0 blur-[3px]"
                              style={{
                                left: "50%",
                                transform: `translateX(-50%) scale(${PREVIEW_CARD_SCALE})`,
                                transformOrigin: "top center",
                                width: RESUME_PAGE_WIDTH_PX,
                              }}
                            >
                              <ResumePreview resume={result.tailoredResume} resumeStyle={resumeStyle} />
                            </div>
                            <div
                              className="absolute inset-0"
                              style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(255,255,255,0.97) 80%)" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all group-hover:shadow-accent-strong">
                                Preview & Download
                                <ArrowRight size={14} />
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* ── Scores + changelog — second in DOM = below on mobile; placed left on desktop ── */}
                      <div className="space-y-5 lg:col-start-1 lg:row-start-1">

                        {/* Score comparison */}
                        <section className="surface-card overflow-hidden rounded-xl">
                          <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                          <div className="p-5 sm:p-6">
                            <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                              ATS Fit Score
                              <Tooltip text="Applicant Tracking System score — how well this resume matches the job description keywords and requirements." />
                            </h2>

                            <div className="grid gap-3 sm:grid-cols-3">
                              {/* Before */}
                              <div className="rounded-xl border border-border/60 bg-gradient-to-br from-surface to-background p-4 transition-colors hover:border-border">
                                <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-text-dim">
                                  Before <Tooltip text="Score of your original, unmodified resume." />
                                </p>
                                <p className="font-mono text-3xl font-bold text-foreground">
                                  {result.scoreComparison.before}
                                  <span className="ml-0.5 text-sm font-normal text-text-dim">/100</span>
                                </p>
                              </div>
                              {/* After */}
                              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 transition-colors hover:border-accent/30">
                                <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-accent/70">
                                  After <Tooltip text="Score of the AI-tailored resume, optimized for this job." />
                                </p>
                                <p className="font-mono bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-3xl font-bold text-transparent">
                                  {result.scoreComparison.after}
                                  <span className="ml-0.5 text-sm font-normal text-text-dim">/100</span>
                                </p>
                              </div>
                              {/* Delta */}
                              <div className={`rounded-xl border p-4 transition-colors ${
                                result.scoreComparison.delta >= 0
                                  ? "border-success-border bg-success-bg hover:border-success"
                                  : "border-danger-border bg-danger-bg hover:border-danger"
                              }`}>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-dim">Improvement</p>
                                <p className={`font-mono text-4xl font-bold ${
                                  result.scoreComparison.delta >= 0 ? "text-success-fg" : "text-danger-fg"
                                }`}>
                                  {formatScoreDelta(result.scoreComparison.delta)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 rounded-lg border border-border/60 bg-background/60 p-4 transition-colors hover:border-border/80">
                              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-text-dim">Overall Assessment</p>
                              <p className="text-sm leading-6 text-muted">
                                {result.tailoredEvaluation.summary}
                              </p>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                  <Check size={13} className="text-accent" />
                                  Matched areas
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {result.tailoredEvaluation.matchedAreas.length > 0 ? (
                                    result.tailoredEvaluation.matchedAreas.map((area) => (
                                      <span
                                        className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/8 px-2.5 py-0.5 text-xs font-medium text-accent"
                                        key={area}
                                      >
                                        <Check size={10} />
                                        {area}
                                      </span>
                                    ))
                                  ) : (
                                    <p className="text-sm text-text-dim">None generated.</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                  <AlertCircle size={13} className="text-text-dim" />
                                  Missing areas
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {result.tailoredEvaluation.missingAreas.length > 0 ? (
                                    result.tailoredEvaluation.missingAreas.map((area) => (
                                      <span
                                        className="rounded-full border border-border/60 bg-surface-raised px-2.5 py-0.5 text-xs font-medium text-muted"
                                        key={area}
                                      >
                                        {area}
                                      </span>
                                    ))
                                  ) : (
                                    <p className="text-sm text-text-dim">None.</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="mb-2 text-sm font-semibold text-foreground">Strengths</p>
                                <FeedbackList
                                  emptyText="No strengths generated."
                                  items={result.tailoredEvaluation.strengths}
                                />
                              </div>
                              <div>
                                <p className="mb-2 text-sm font-semibold text-foreground">Gaps</p>
                                <FeedbackList
                                  emptyText="No major gaps."
                                  items={result.tailoredEvaluation.gaps}
                                />
                              </div>
                            </div>

                            {result.tailoredEvaluation.improvementSuggestions.length > 0 && (
                              <div className="mt-5">
                                <p className="mb-2 text-sm font-semibold text-foreground">Suggestions</p>
                                <FeedbackList
                                  emptyText=""
                                  items={result.tailoredEvaluation.improvementSuggestions}
                                />
                              </div>
                            )}
                          </div>
                        </section>

                        {/* Change log */}
                        <section className="surface-card overflow-hidden rounded-xl">
                          <div className="h-px bg-gradient-to-r from-transparent via-accent-secondary/30 to-transparent" />
                          <div className="p-5 sm:p-6">
                            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Change Log</h2>
                            <ul className="space-y-3">
                              {result.changeLog.changes.map((change, i) => (
                                <li
                                  key={`${change.section}-${i}`}
                                  className="flex gap-3 rounded-lg border border-border/40 bg-background/50 p-3"
                                >
                                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                                    {i + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-accent/70">
                                      {change.section}
                                    </p>
                                    <p className="text-sm leading-5 text-muted">{change.reason}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </section>

                        {isFreePlan && (
                          <section className="surface-card overflow-hidden rounded-xl">
                            <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                            <div className="p-5 sm:p-6">
                              <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-foreground">
                                <Sparkles size={15} className="text-accent" />
                                Unlock unlimited tailoring with Pro
                              </h2>
                              <ul className="mb-5 space-y-2">
                                {[
                                  "Unlimited tailored resumes",
                                  "Unlimited edits and regenerations",
                                  "Resume styling, ATS reports & PDF/DOCX export",
                                ].map((feature) => (
                                  <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                                    <Check size={13} className="shrink-0 text-accent" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                              <Link
                                href="/settings?section=billing&highlight=pro"
                                className="flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent-hover text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98]"
                              >
                                Upgrade to Pro — from $12/mo
                              </Link>
                            </div>
                          </section>
                        )}
                      </div>

                    </div>
                  </div>
                </main>
              </div>
              )}
            </div>

          </div>

        </div>
      </div>

      <NoCreditsModal open={isNoCreditsOpen} onDismiss={dismissNoCredits} />

      {/* ── Resume modal ── */}
      {isModalOpen && result && (
        <div
          className="fixed inset-0 z-50 overflow-x-auto overflow-y-auto bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-6 py-3 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-2">
              <button
                className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-hover px-4 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:from-border disabled:to-border disabled:text-text-dim disabled:shadow-none"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                type="button"
              >
                <Download size={14} />
                {isDownloadingPdf ? "Preparing…" : "Download PDF"}
              </button>
              <button
                className="flex h-9 items-center gap-2 rounded-lg border border-accent/50 bg-transparent px-4 text-sm font-semibold text-accent transition-all hover:bg-accent/10 disabled:cursor-not-allowed disabled:border-border disabled:text-text-dim"
                disabled={isDownloadingDocx}
                onClick={handleDownloadDocx}
                type="button"
              >
                <FileDown size={14} />
                {isDownloadingDocx ? "Preparing…" : "Download DOCX"}
              </button>
            </div>
            <button
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-surface text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
              onClick={closeModal}
              type="button"
            >
              <X size={15} />
            </button>
          </div>

          <div
            ref={modalRef}
            className="flex justify-center px-4 py-4 sm:px-0 sm:py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resume-print-area shadow-2xl" style={{ zoom: modalScale, width: RESUME_PAGE_WIDTH_PX }}>
              <ResumePreview resume={result.tailoredResume} resumeStyle={resumeStyle} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
