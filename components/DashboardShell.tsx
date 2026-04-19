"use client";

import { useState } from "react";
import { ResumePreview } from "@/components/ResumePreview";
import { useTailorResume } from "@/lib/hooks/useTailorResume";

const RESUME_PAGE_WIDTH_PX = 816; // LETTER at 96 DPI
const PREVIEW_CARD_SCALE = 400 / RESUME_PAGE_WIDTH_PX; // ≈ 0.49, maps 816px resume → ~400px card
const PREVIEW_CARD_HEIGHT = Math.round(PREVIEW_CARD_SCALE * 1056); // full LETTER aspect ≈ 517px

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
    return <p className="text-[#4a5568]">{emptyText}</p>;
  }

  return (
    <ul className="space-y-1 text-[#94a3b8]">
      {items.map((item) => (
        <li key={item}>{item}</li>
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
          <div className="h-full w-screen flex-shrink-0 overflow-y-auto bg-[#0a0f1e]">
            <main className="min-h-full px-4 py-8 text-white sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-2xl">
                <header>
                  <p className="text-sm font-medium text-[#06b6d4]">Resume Builder</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
                    Tailor a resume to a job description.
                  </h1>
                  <p className="mt-3 text-base leading-7 text-[#94a3b8]">
                    Add your source resume and target job description. Tailoring will
                    stay grounded in the experience you provide.
                  </p>
                </header>

                {error && (
                  <div className="mt-6 rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <section className="mt-6 rounded-xl border border-[#1e293b] bg-[#0f1629] p-5 sm:p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-white" htmlFor="resume-upload">
                        Resume
                      </label>
                      <p className="mt-1 text-sm text-[#94a3b8]">
                        Upload a .txt, .pdf, or .docx resume file.
                      </p>
                      <input
                        accept=".pdf,.docx,.txt"
                        className="mt-3 block w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#1e293b] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#94a3b8] hover:file:bg-[#263347] hover:file:text-white"
                        id="resume-upload"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setResumeFile(file);
                          setResumeFileName(file?.name ?? "");
                        }}
                        type="file"
                      />
                      {resumeFileName && (
                        <p className="mt-2 text-sm text-[#94a3b8]">
                          Selected file:{" "}
                          <span className="font-medium text-white">{resumeFileName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white" htmlFor="job-description">
                        Job description
                      </label>
                      <textarea
                        className="mt-3 min-h-56 w-full resize-y rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#4a5568] focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
                        id="job-description"
                        onChange={(event) => setJobDescription(event.target.value)}
                        placeholder="Paste the target job description here..."
                        value={jobDescription}
                      />
                    </div>

                    <button
                      className="h-11 w-full rounded-lg bg-[#06b6d4] px-4 text-sm font-semibold text-[#0a0f1e] shadow-sm transition hover:bg-[#22d3ee] disabled:cursor-not-allowed disabled:bg-[#1e293b] disabled:text-[#4a5568] sm:w-auto"
                      disabled={!canTailor}
                      onClick={handleTailorResume}
                      type="button"
                    >
                      Tailor Resume
                    </button>
                  </div>
                </section>
              </div>
            </main>
          </div>

          {/* ── Panel 2: Working Area (Loading + Keywords split) ── */}
          <div className="relative h-full w-screen flex-shrink-0 overflow-hidden bg-[#0a0f1e]">

            {/* Loading sub-panel — right edge slides to 50% when keywords are shown */}
            <div
              className="absolute bottom-0 left-0 top-0 flex flex-col items-center justify-center px-4"
              style={{
                right: viewState === "keyword-selection" ? "50%" : "0",
                transition: "right 350ms ease-in-out",
              }}
            >
              <div className="w-full max-w-xs text-center">
                {/* Hero: score (steps 2–3 or keyword-selection) or title (step 1) */}
                {loadingStep === 1 ? (
                  <p className="mb-6 text-2xl font-semibold tracking-tight text-white">
                    Tailoring your resume…
                  </p>
                ) : initialScore !== null ? (
                  <div className="mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">
                      Initial ATS Score
                    </p>
                    <div className="mt-3 flex items-end justify-center gap-1.5">
                      <span className="text-8xl font-bold leading-none tracking-tight text-[#06b6d4]">
                        {initialScore}
                      </span>
                      <span className="mb-2 text-2xl font-light text-[#475569]">/100</span>
                    </div>
                  </div>
                ) : null}

                {/* Status message */}
                <p className="mb-6 text-sm font-medium text-[#64748b]">
                  {loadingStep === 1 && "Analyzing your resume against the job description…"}
                  {loadingStep === 2 && "Generating your tailored resume…"}
                  {loadingStep === 3 && "Getting your final ATS rating…"}
                  {loadingStep === 0 && pendingEvalData && "Review the skills on the right, then generate."}
                </p>

                {/* Spinner — only while actively loading */}
                {loadingStep > 0 && (
                  <div className="mb-8 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e293b] border-t-[#06b6d4]" />
                  </div>
                )}

                {/* Progress bar */}
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#1e293b]">
                  <div
                    className="h-full rounded-full bg-[#06b6d4]"
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

                {/* Step labels */}
                <div className="mt-2.5 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-[#334155]">
                  <span>Analyze</span>
                  <span>Generate</span>
                  <span>Score</span>
                </div>
              </div>
            </div>

            {/* Keywords sub-panel — slides in from right */}
            <div
              className={`absolute bottom-0 right-0 top-0 w-1/2 overflow-y-auto border-l border-[#1e293b] transition-transform duration-[350ms] ease-in-out ${
                viewState === "keyword-selection" ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {pendingEvalData && (
                <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
                  <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="mb-8 text-center">
                      <h2 className="text-xl font-semibold tracking-tight text-white">
                        Any hidden experience?
                      </h2>
                      <p className="mt-2 text-sm font-medium text-[#64748b]">
                        These skills were flagged as missing. Select any you genuinely have — we&apos;ll weave them in.
                      </p>
                    </div>

                    {/* Chips */}
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
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                              selected
                                ? "border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4]"
                                : "border-[#1e293b] text-[#64748b] hover:border-[#334155] hover:text-[#94a3b8]"
                            }`}
                          >
                            {selected && <span className="mr-1.5">✓</span>}
                            {kw}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleGenerateResume(selectedKeywords)}
                        className="h-11 w-full rounded-lg bg-[#06b6d4] px-4 text-sm font-semibold text-[#0a0f1e] shadow-sm transition hover:bg-[#22d3ee]"
                      >
                        {selectedKeywords.length > 0
                          ? `Generate with ${selectedKeywords.length} selected →`
                          : "Generate Resume →"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateResume([])}
                        className="text-sm font-medium text-[#475569] transition hover:text-[#64748b]"
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
          <div className="h-full w-screen flex-shrink-0 overflow-y-auto bg-[#0a0f1e]">
            {result && (
              <main className="min-h-full px-4 py-8 text-white sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                  <button
                    className="text-sm font-medium text-[#94a3b8] transition hover:text-white"
                    onClick={handleReset}
                    type="button"
                  >
                    ← Back to Dashboard
                  </button>

                  {downloadError && (
                    <div className="mt-4 rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-400">
                      {downloadError}
                    </div>
                  )}

                  <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
                    {/* ── LEFT: Score + Changelog ── */}
                    <div className="space-y-6">
                      <section className="rounded-xl border border-[#1e293b] bg-[#0f1629] p-5 sm:p-6">
                        <h2 className="text-xl font-semibold text-white">Fit score comparison</h2>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#4a5568]">Before</p>
                            <p className="mt-1 text-3xl font-semibold text-white">
                              {result.scoreComparison.before}
                              <span className="text-sm font-medium text-[#4a5568]">/100</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#4a5568]">After</p>
                            <p className="mt-1 text-3xl font-semibold text-white">
                              {result.scoreComparison.after}
                              <span className="text-sm font-medium text-[#4a5568]">/100</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#4a5568]">Delta</p>
                            <p className={`mt-1 text-3xl font-semibold ${result.scoreComparison.delta >= 0 ? "text-[#06b6d4]" : "text-red-400"}`}>
                              {formatScoreDelta(result.scoreComparison.delta)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-4">
                          <p className="text-sm font-semibold text-white">Overall assessment</p>
                          <p className="mt-1 text-sm leading-6 text-[#94a3b8]">
                            {result.tailoredEvaluation.summary}
                          </p>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-semibold text-white">Matched areas</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {result.tailoredEvaluation.matchedAreas.length > 0 ? (
                                result.tailoredEvaluation.matchedAreas.map((area) => (
                                  <span
                                    className="rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-2 py-1 text-xs font-medium text-[#06b6d4]"
                                    key={area}
                                  >
                                    {area}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-[#4a5568]">No matched areas generated.</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Missing areas</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {result.tailoredEvaluation.missingAreas.length > 0 ? (
                                result.tailoredEvaluation.missingAreas.map((area) => (
                                  <span
                                    className="rounded-full border border-[#1e293b] bg-[#131c35] px-2 py-1 text-xs font-medium text-[#94a3b8]"
                                    key={area}
                                  >
                                    {area}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-[#4a5568]">No missing areas generated.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-semibold text-white">Strengths</p>
                            <div className="mt-2">
                              <FeedbackList
                                emptyText="No strengths generated."
                                items={result.tailoredEvaluation.strengths}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Gaps</p>
                            <div className="mt-2">
                              <FeedbackList
                                emptyText="No major gaps generated."
                                items={result.tailoredEvaluation.gaps}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5">
                          <p className="text-sm font-semibold text-white">Improvement suggestions</p>
                          <div className="mt-2">
                            <FeedbackList
                              emptyText="No improvements generated."
                              items={result.tailoredEvaluation.improvementSuggestions}
                            />
                          </div>
                        </div>
                      </section>

                      <section className="rounded-xl border border-[#1e293b] bg-[#0f1629] p-5 sm:p-6">
                        <h2 className="text-xl font-semibold text-white">Change log</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-[#94a3b8]">
                          {result.changeLog.changes.map((change) => (
                            <li key={`${change.section}-${change.tailoredText}`}>
                              <span className="font-semibold text-white">{change.section}:</span>{" "}
                              {change.reason}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    {/* ── RIGHT: Resume preview card ── */}
                    <div>
                      <div className="sticky top-8">
                        <p className="mb-3 text-sm font-semibold text-white">Tailored resume</p>
                        <button
                          aria-label="Preview tailored resume"
                          className="relative w-full cursor-pointer overflow-hidden rounded-xl bg-white shadow-2xl"
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
                            style={{ background: "linear-gradient(to bottom, transparent 45%, white 100%)" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded-full bg-[#06b6d4] px-6 py-2.5 text-sm font-semibold text-[#0a0f1e] shadow-lg">
                              Preview & Download →
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

      {/* ── Resume modal (outside sliding container) ── */}
      {isModalOpen && result && (
        <div
          className="fixed inset-0 z-50 overflow-x-auto overflow-y-auto bg-black/75"
          onClick={closeModal}
        >
          <div
            className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-black/60 px-6 py-3 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-2">
              <button
                className="h-9 rounded-lg bg-[#06b6d4] px-4 text-sm font-semibold text-[#0a0f1e] shadow-sm transition hover:bg-[#22d3ee] disabled:cursor-not-allowed disabled:bg-[#1e293b] disabled:text-[#4a5568]"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                type="button"
              >
                {isDownloadingPdf ? "Preparing PDF..." : "Download PDF"}
              </button>
              <button
                className="h-9 rounded-lg border border-[#06b6d4] bg-transparent px-4 text-sm font-semibold text-[#06b6d4] transition hover:bg-[#06b6d4]/10 disabled:cursor-not-allowed disabled:border-[#1e293b] disabled:text-[#4a5568]"
                disabled={isDownloadingDocx}
                onClick={handleDownloadDocx}
                type="button"
              >
                {isDownloadingDocx ? "Preparing DOCX..." : "Download DOCX"}
              </button>
              <button
                className="h-9 rounded-lg border border-[#1e293b] bg-transparent px-4 text-sm font-semibold text-[#94a3b8] transition hover:bg-[#1e293b] hover:text-white"
                onClick={handlePrintResume}
                type="button"
              >
                Print / Save as PDF
              </button>
            </div>
            <button
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e293b] bg-[#0f1629] text-[#94a3b8] transition hover:bg-[#1e293b] hover:text-white"
              onClick={closeModal}
              type="button"
            >
              ✕
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
