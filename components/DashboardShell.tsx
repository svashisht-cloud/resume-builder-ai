"use client";

import { useState } from "react";
import { ResumePreview } from "@/components/ResumePreview";
import { useTailorResume } from "@/lib/hooks/useTailorResume";
import { FileText, Briefcase, ArrowRight, Check, X } from "lucide-react";

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

export function DashboardShell() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

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
    handleTailorResume,
    handleGenerateResume,
    toggleKeyword,
    handleDownloadPdf,
    handleDownloadDocx,
    handlePrintResume,
    handleReset,
    openModal,
    closeModal,
  } = useTailorResume({ resumeFile, jobDescription });

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
                : viewState === "result"
                  ? "translateX(-200vw)"
                  : "translateX(-100vw)",
          }}
        >

          {/* ── Panel 1: Dashboard ── */}
          <div className="h-full w-screen flex-shrink-0 overflow-y-auto bg-background">
            <main className="min-h-full px-4 py-10 text-foreground sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-2xl">
                <header className="mb-8">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                    AI Resume Tailoring
                  </p>
                  <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Tailor your resume to{" "}
                    <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                      any job
                    </span>
                  </h1>
                  <p className="mt-3 text-base leading-7 text-muted">
                    Upload your resume and paste a job description. The tailoring stays grounded in your actual experience.
                  </p>
                </header>

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
                    <X size={15} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-[0_2px_20px_rgba(0,0,0,0.2)]">
                  {/* Top accent line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

                  <div className="space-y-6 p-6">
                    {/* Resume upload */}
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <FileText size={14} className="text-accent" />
                        <label className="text-sm font-semibold text-foreground" htmlFor="resume-upload">
                          Resume
                        </label>
                      </div>
                      <p className="mb-3 text-sm text-muted">Upload a .txt, .pdf, or .docx file.</p>
                      <input
                        accept=".pdf,.docx,.txt"
                        className="block w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground transition-colors file:mr-4 file:rounded-md file:border-0 file:bg-surface-raised file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-muted hover:file:bg-border hover:file:text-foreground focus:border-accent/60 focus:outline-none"
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
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Briefcase size={14} className="text-accent" />
                        <label className="text-sm font-semibold text-foreground" htmlFor="job-description">
                          Job description
                        </label>
                      </div>
                      <textarea
                        className="min-h-52 w-full resize-y rounded-lg border border-border/60 bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-text-dim focus:border-accent/60 focus:ring-1 focus:ring-accent/20"
                        id="job-description"
                        onChange={(event) => setJobDescription(event.target.value)}
                        placeholder="Paste the target job description here…"
                        value={jobDescription}
                      />
                    </div>

                    <button
                      className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-cyan-400 px-4 text-sm font-semibold text-background shadow-[0_2px_12px_rgba(6,182,212,0.25)] transition-all hover:shadow-[0_2px_20px_rgba(6,182,212,0.4)] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-border disabled:to-border disabled:text-text-dim disabled:shadow-none sm:w-auto"
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
                right: viewState === "keyword-selection" ? "50%" : "0",
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
                      <span className="bg-gradient-to-br from-accent to-cyan-300 bg-clip-text text-8xl font-bold leading-none tracking-tight text-transparent">
                        {initialScore}
                      </span>
                      <span className="mb-2 text-2xl font-light text-text-dim">/100</span>
                    </div>
                  </div>
                ) : null}

                <p className="mb-6 text-sm font-medium text-text-dim">
                  {loadingStep === 1 && "Analyzing your resume against the job description…"}
                  {loadingStep === 2 && "Generating your tailored resume…"}
                  {loadingStep === 3 && "Getting your final ATS rating…"}
                  {loadingStep === 0 && pendingEvalData && "Review the skills on the right, then generate."}
                </p>

                {loadingStep > 0 && (
                  <div className="mb-8 flex justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
                  </div>
                )}

                {/* Progress bar */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400"
                    style={{
                      width:
                        loadingStep === 1 ? "10%"
                        : loadingStep === 2 ? "33%"
                        : loadingStep === 3 ? "66%"
                        : "33%",
                      transition: "width 700ms ease-in-out",
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
              className={`absolute bottom-0 right-0 top-0 w-1/2 overflow-y-auto border-l border-border/60 transition-transform duration-[350ms] ease-in-out ${
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
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                              selected
                                ? "border-accent/50 bg-accent/15 text-accent shadow-[0_0_8px_rgba(6,182,212,0.15)]"
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
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-cyan-400 px-4 text-sm font-semibold text-background shadow-[0_2px_12px_rgba(6,182,212,0.25)] transition-all hover:opacity-95 active:scale-[0.98]"
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

          {/* ── Panel 3: Result ── */}
          <div className="h-full w-screen flex-shrink-0 overflow-y-auto bg-background">
            {result && (
              <main className="min-h-full px-4 py-8 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                  <button
                    className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                    onClick={handleReset}
                    type="button"
                  >
                    ← Back to Dashboard
                  </button>

                  {downloadError && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400">
                      <X size={15} className="mt-0.5 flex-shrink-0" />
                      {downloadError}
                    </div>
                  )}

                  <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
                    {/* ── LEFT ── */}
                    <div className="space-y-5">

                      {/* Score comparison */}
                      <section className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
                        <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                        <div className="p-5 sm:p-6">
                          <h2 className="mb-5 font-display text-lg font-semibold text-foreground">ATS Fit Score</h2>

                          <div className="grid gap-3 sm:grid-cols-3">
                            {/* Before */}
                            <div className="rounded-xl border border-border/60 bg-background p-4">
                              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-dim">Before</p>
                              <p className="text-3xl font-bold text-foreground">
                                {result.scoreComparison.before}
                                <span className="ml-0.5 text-sm font-normal text-text-dim">/100</span>
                              </p>
                            </div>
                            {/* After */}
                            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent/70">After</p>
                              <p className="bg-gradient-to-r from-accent to-cyan-300 bg-clip-text text-3xl font-bold text-transparent">
                                {result.scoreComparison.after}
                                <span className="ml-0.5 text-sm font-normal text-text-dim">/100</span>
                              </p>
                            </div>
                            {/* Delta */}
                            <div className={`rounded-xl border p-4 ${
                              result.scoreComparison.delta >= 0
                                ? "border-emerald-500/20 bg-emerald-950/20"
                                : "border-red-500/20 bg-red-950/20"
                            }`}>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-dim">Improvement</p>
                              <p className={`text-3xl font-bold ${
                                result.scoreComparison.delta >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}>
                                {formatScoreDelta(result.scoreComparison.delta)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-lg border border-border/60 bg-background/60 p-4">
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-text-dim">Overall Assessment</p>
                            <p className="text-sm leading-6 text-muted">
                              {result.tailoredEvaluation.summary}
                            </p>
                          </div>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                <span className="h-2 w-2 rounded-full bg-accent" />
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
                                <span className="h-2 w-2 rounded-full bg-border" />
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
                      <section className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
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
                    </div>

                    {/* ── RIGHT: Resume preview ── */}
                    <div>
                      <div className="sticky top-8">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                          Tailored Resume
                        </p>
                        <button
                          aria-label="Preview tailored resume"
                          className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_8px_40px_rgba(6,182,212,0.15),0_8px_32px_rgba(0,0,0,0.3)] hover:border-accent/30"
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
                            <ResumePreview resume={result.tailoredResume} />
                          </div>
                          <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(255,255,255,0.97) 80%)" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-cyan-400 px-5 py-2.5 text-sm font-semibold text-background shadow-[0_4px_16px_rgba(6,182,212,0.35)] transition-all group-hover:shadow-[0_4px_24px_rgba(6,182,212,0.5)]">
                              Preview & Download
                              <ArrowRight size={14} />
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            )}
          </div>

        </div>
      </div>

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
                className="h-9 rounded-lg bg-gradient-to-r from-accent to-cyan-400 px-4 text-sm font-semibold text-background shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:from-border disabled:to-border disabled:text-text-dim disabled:shadow-none"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                type="button"
              >
                {isDownloadingPdf ? "Preparing…" : "Download PDF"}
              </button>
              <button
                className="h-9 rounded-lg border border-accent/50 bg-transparent px-4 text-sm font-semibold text-accent transition-all hover:bg-accent/10 disabled:cursor-not-allowed disabled:border-border disabled:text-text-dim"
                disabled={isDownloadingDocx}
                onClick={handleDownloadDocx}
                type="button"
              >
                {isDownloadingDocx ? "Preparing…" : "Download DOCX"}
              </button>
              <button
                className="h-9 rounded-lg border border-border/60 bg-transparent px-4 text-sm font-semibold text-muted transition-all hover:border-border hover:text-foreground"
                onClick={handlePrintResume}
                type="button"
              >
                Print / Save as PDF
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
            className="resume-print-area mx-auto my-8 w-[816px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ResumePreview resume={result.tailoredResume} />
          </div>
        </div>
      )}
    </>
  );
}
