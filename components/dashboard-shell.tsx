"use client";

import { useEffect, useState } from "react";
import { ResumePreview } from "@/components/ResumePreview";
import { buildResumePdfFilename } from "@/lib/resume/filename";
import type {
  ChangeLog,
  ResumeEvaluation,
  ScoreComparison,
  TailoredResume,
} from "@/types";

type TailorResponse = {
  tailoredResume: TailoredResume;
  originalEvaluation: ResumeEvaluation;
  tailoredEvaluation: ResumeEvaluation;
  scoreComparison: ScoreComparison;
  evaluationMode: "llm";
  changeLog: ChangeLog;
};

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
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasResumeFile = resumeFileName.length > 0;
  const hasJobDescription = jobDescription.trim().length > 0;
  const canTailor = hasResumeFile && hasJobDescription && !isLoading;

  async function handleTailorResume() {
    if (!canTailor || !resumeFile) {
      return;
    }

    setIsLoading(true);
    setError("");
    setPdfError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resumeFile", resumeFile);
      formData.append("jobDescriptionText", jobDescription);

      const response = await fetch("/api/tailor", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Tailoring request failed.");
      }

      setResult(data as TailorResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Tailoring request failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!result || isDownloadingPdf) {
      return;
    }

    setIsDownloadingPdf(true);
    setPdfError("");

    try {
      const filename = buildResumePdfFilename({
        resume: result.tailoredResume,
      });
      const response = await fetch("/api/export-pdf", {
        body: JSON.stringify({
          tailoredResume: result.tailoredResume,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "PDF download failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setPdfError(
        downloadError instanceof Error
          ? downloadError.message
          : "PDF download failed.",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function handlePrintResume() {
    if (!result) {
      return;
    }

    window.print();
  }

  useEffect(() => {
    if (!isModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsModalOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  return (
    <>
    <main className="min-h-screen bg-[#0a0f1e] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-medium text-[#06b6d4]">
            Resume Builder
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
            Tailor a resume to a job description.
          </h1>
          <p className="mt-3 text-base leading-7 text-[#94a3b8]">
            Add your source resume and target job description. Tailoring will
            stay grounded in the experience you provide.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[#1e293b] bg-[#0f1629] p-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-semibold text-white"
                  htmlFor="resume-upload"
                >
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
                {resumeFileName ? (
                  <p className="mt-2 text-sm text-[#94a3b8]">
                    Selected file:{" "}
                    <span className="font-medium text-white">
                      {resumeFileName}
                    </span>
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-white"
                  htmlFor="job-description"
                >
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
                {isLoading ? "Tailoring..." : "Tailor Resume"}
              </button>
            </div>
          </section>

          <aside className="rounded-xl border border-[#1e293b] bg-[#0f1629] p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">Result</h2>
            <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
              Review the score, preview the tailored resume, and export a
              recruiter-ready PDF.
            </p>

            <div className="mt-6 space-y-5">
              {error ? (
                <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-400">
                  {error}
                </div>
              ) : null}
              {pdfError ? (
                <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-400">
                  {pdfError}
                </div>
              ) : null}

              <section>
                <h3 className="text-sm font-semibold text-white">
                  Fit score comparison
                </h3>
                <div className="mt-2 max-h-[28rem] overflow-auto rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-4 text-sm text-[#94a3b8]">
                  {result ? (
                    <div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-normal text-[#4a5568]">
                            Before
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-white">
                            {result.scoreComparison.before}
                            <span className="text-sm font-medium text-[#4a5568]">
                              /100
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-normal text-[#4a5568]">
                            After
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-white">
                            {result.scoreComparison.after}
                            <span className="text-sm font-medium text-[#4a5568]">
                              /100
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-normal text-[#4a5568]">
                            Delta
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-[#06b6d4]">
                            {formatScoreDelta(result.scoreComparison.delta)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-[#1e293b] bg-[#0f1629] p-3">
                        <p className="font-semibold text-white">
                          Overall assessment
                        </p>
                        <p className="mt-1 leading-6 text-[#94a3b8]">
                          {result.tailoredEvaluation.summary}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold text-white">
                            Matched areas
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {result.tailoredEvaluation.matchedAreas.length > 0 ? (
                              result.tailoredEvaluation.matchedAreas.map(
                                (area) => (
                                  <span
                                    className="rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-2 py-1 text-xs font-medium text-[#06b6d4]"
                                    key={area}
                                  >
                                    {area}
                                  </span>
                                ),
                              )
                            ) : (
                              <p className="text-[#4a5568]">
                                No matched areas generated.
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            Missing areas
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {result.tailoredEvaluation.missingAreas.length > 0 ? (
                              result.tailoredEvaluation.missingAreas.map(
                                (area) => (
                                  <span
                                    className="rounded-full border border-[#1e293b] bg-[#131c35] px-2 py-1 text-xs font-medium text-[#94a3b8]"
                                    key={area}
                                  >
                                    {area}
                                  </span>
                                ),
                              )
                            ) : (
                              <p className="text-[#4a5568]">
                                No missing areas generated.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold text-white">
                            Strengths
                          </p>
                          <div className="mt-2">
                            <FeedbackList
                              emptyText="No strengths generated."
                              items={result.tailoredEvaluation.strengths}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Gaps</p>
                          <div className="mt-2">
                            <FeedbackList
                              emptyText="No major gaps generated."
                              items={result.tailoredEvaluation.gaps}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="font-semibold text-white">
                          Suggested improvements
                        </p>
                        <div className="mt-2">
                          <FeedbackList
                            emptyText="No improvements generated."
                            items={result.tailoredEvaluation.improvementSuggestions}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    "Not scored yet."
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white">
                  Tailored resume
                </h3>
                <div className="mt-3">
                  {result ? (
                    <div
                      aria-label="View tailored resume"
                      className="relative h-[233px] w-[180px] cursor-pointer overflow-hidden rounded-lg border border-[#1e293b] transition hover:border-[#06b6d4]"
                      onClick={() => setIsModalOpen(true)}
                      role="button"
                    >
                      {/* Scaled + blurred resume thumbnail */}
                      <div
                        className="absolute blur-[2px]"
                        style={{
                          transform: "scale(0.2206)",
                          transformOrigin: "top left",
                          width: 816,
                        }}
                      >
                        <ResumePreview resume={result.tailoredResume} />
                      </div>
                      {/* Gradient overlay + label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-[#0a0f1e]/70 to-transparent pb-3">
                        <span className="text-xs font-semibold text-white">
                          View Resume →
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[233px] w-[180px] items-center justify-center rounded-lg border border-[#1e293b] bg-[#0a0f1e]">
                      <p className="px-3 text-center text-xs text-[#4a5568]">
                        Resume preview will appear here
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {result ? (
                <section>
                  <h3 className="text-sm font-semibold text-white">
                    Change log
                  </h3>
                  <ul className="mt-2 space-y-2 rounded-lg border border-[#1e293b] bg-[#0a0f1e] p-4 text-sm leading-6 text-[#94a3b8]">
                    {result.changeLog.changes.map((change) => (
                      <li key={`${change.section}-${change.tailoredText}`}>
                        <span className="font-semibold text-white">
                          {change.section}:
                        </span>{" "}
                        {change.reason}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

            </div>
          </aside>
        </div>
      </div>
    </main>

    {/* ── Loading modal ── */}
    {isLoading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="w-full max-w-sm rounded-2xl border border-[#1e293b] bg-[#0f1629] p-8 text-center shadow-2xl">
          <p className="text-base font-semibold text-white">
            Tailoring your resume…
          </p>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Analyzing the job description and optimizing for ATS keywords.
          </p>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[#1e293b]">
            <div
              className="h-full w-1/3 rounded-full bg-[#06b6d4]"
              style={{ animation: "slide 1.4s linear infinite" }}
            />
          </div>
        </div>
      </div>
    )}

    {/* ── Resume modal ── */}
    {isModalOpen && result && (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/75"
        onClick={() => setIsModalOpen(false)}
      >
        {/* Action bar — sticky at top, full width */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-black/60 px-6 py-3 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            <button
              className="h-9 rounded-lg bg-[#06b6d4] px-4 text-sm font-semibold text-[#0a0f1e] shadow-sm transition hover:bg-[#22d3ee] disabled:cursor-not-allowed disabled:bg-[#1e293b] disabled:text-[#4a5568]"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              type="button"
            >
              {isDownloadingPdf ? "Preparing PDF..." : "Download PDF"}
            </button>
            <button
              className="h-9 rounded-lg border border-[#06b6d4] bg-transparent px-4 text-sm font-semibold text-[#06b6d4] transition hover:bg-[#06b6d4]/10"
              onClick={handlePrintResume}
              type="button"
            >
              Print / Save as PDF
            </button>
          </div>
          <button
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e293b] bg-[#0f1629] text-[#94a3b8] transition hover:bg-[#1e293b] hover:text-white"
            onClick={() => setIsModalOpen(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Resume document — centred, full 816px page width */}
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
