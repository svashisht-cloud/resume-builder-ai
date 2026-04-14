"use client";

import { useMemo, useState } from "react";

export function DashboardShell() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailorRequested, setTailorRequested] = useState(false);

  const hasResume = useMemo(
    () => resumeText.trim().length > 0 || resumeFileName.length > 0,
    [resumeFileName, resumeText],
  );
  const hasJobDescription = jobDescription.trim().length > 0;
  const canTailor = hasResume && hasJobDescription;

  function handleTailorResume() {
    if (!canTailor) {
      return;
    }

    setTailorRequested(true);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-medium text-emerald-700">
            Resume Builder
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
            Tailor a resume to a job description.
          </h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            Add your source resume and target job description. Tailoring will
            stay grounded in the experience you provide.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="space-y-6">
              <div>
                <label
                  className="block text-sm font-semibold text-zinc-900"
                  htmlFor="resume-upload"
                >
                  Resume
                </label>
                <p className="mt-1 text-sm text-zinc-600">
                  Upload a resume file or paste the resume text below.
                </p>
                <input
                  accept=".pdf,.doc,.docx,.txt"
                  className="mt-3 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200"
                  id="resume-upload"
                  onChange={(event) =>
                    setResumeFileName(event.target.files?.[0]?.name ?? "")
                  }
                  type="file"
                />
                {resumeFileName ? (
                  <p className="mt-2 text-sm text-zinc-600">
                    Selected file:{" "}
                    <span className="font-medium text-zinc-900">
                      {resumeFileName}
                    </span>
                  </p>
                ) : null}
                <textarea
                  className="mt-3 min-h-56 w-full resize-y rounded-md border border-zinc-300 px-3 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  onChange={(event) => setResumeText(event.target.value)}
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-zinc-900"
                  htmlFor="job-description"
                >
                  Job description
                </label>
                <textarea
                  className="mt-3 min-h-56 w-full resize-y rounded-md border border-zinc-300 px-3 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  id="job-description"
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the target job description here..."
                  value={jobDescription}
                />
              </div>

              <button
                className="h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 sm:w-auto"
                disabled={!canTailor}
                onClick={handleTailorResume}
                type="button"
              >
                Tailor Resume
              </button>
            </div>
          </section>

          <aside className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-xl font-semibold text-zinc-950">Result</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Tailored resume output, score, and PDF download will appear here
              once backend tailoring is connected.
            </p>

            <div className="mt-6 space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Tailored resume
                </h3>
                <div className="mt-2 rounded-md border border-dashed border-zinc-300 bg-[#fbfbf8] p-4 text-sm leading-6 text-zinc-600">
                  {tailorRequested
                    ? "Backend tailoring is not connected yet."
                    : "No tailored resume yet."}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-zinc-900">
                  ATS score
                </h3>
                <div className="mt-2 rounded-md border border-dashed border-zinc-300 bg-[#fbfbf8] p-4 text-sm text-zinc-600">
                  Not scored yet.
                </div>
              </section>

              <button
                className="h-11 w-full rounded-md border border-zinc-300 bg-zinc-100 px-4 text-sm font-semibold text-zinc-500"
                disabled
                type="button"
              >
                Download PDF
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
