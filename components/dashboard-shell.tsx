"use client";

import { useState } from "react";
import type {
  ATSScore,
  ChangeLog,
  ParsedJobDescription,
  ParsedResume,
  TailoredResume,
} from "@/types";

type TailorResponse = {
  parsedResume: ParsedResume;
  parsedJobDescription: ParsedJobDescription;
  tailoredResume: TailoredResume;
  atsScore: ATSScore;
  changeLog: ChangeLog;
};

export function DashboardShell() {
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasResumeFile = resumeFileName.length > 0;
  const hasJobDescription = jobDescription.trim().length > 0;
  const canTailor = hasResumeFile && hasJobDescription && !isLoading;

  async function handleTailorResume() {
    if (!canTailor) {
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: `Uploaded resume file: ${resumeFileName}`,
          jobDescriptionText: jobDescription,
        }),
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
                  Upload your resume file. The mocked pipeline uses the file
                  name until real parsing is connected.
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
                {isLoading ? "Tailoring..." : "Tailor Resume"}
              </button>
            </div>
          </section>

          <aside className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-zinc-950">Result</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Mocked tailoring output appears here. PDF export remains a
              placeholder.
            </p>

            <div className="mt-6 space-y-5">
              {error ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  {error}
                </div>
              ) : null}

              <section>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Tailored resume
                </h3>
                <div className="mt-2 rounded-md border border-dashed border-zinc-300 bg-[#fbfbf8] p-4 text-sm leading-6 text-zinc-700">
                  {result ? (
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-zinc-950">
                          {result.tailoredResume.contact.name}
                        </p>
                        <p>{result.tailoredResume.summary}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-950">Skills</p>
                        <p>{result.tailoredResume.skills.join(", ")}</p>
                      </div>
                      {result.tailoredResume.experience.map((experience) => (
                        <div key={experience.sourceExperienceId}>
                          <p className="font-semibold text-zinc-950">
                            {experience.title}, {experience.company}
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {experience.bullets.map((bullet) => (
                              <li key={bullet.text}>{bullet.text}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    "No tailored resume yet."
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-zinc-900">
                  ATS score
                </h3>
                <div className="mt-2 rounded-md border border-dashed border-zinc-300 bg-[#fbfbf8] p-4 text-sm text-zinc-700">
                  {result ? (
                    <div>
                      <p className="text-3xl font-semibold text-zinc-950">
                        {result.atsScore.overall}
                        <span className="text-base font-medium text-zinc-500">
                          /100
                        </span>
                      </p>
                      <div className="mt-4 space-y-2">
                        {result.atsScore.sectionScores.map((sectionScore) => (
                          <div
                            className="flex items-center justify-between gap-4"
                            key={sectionScore.section}
                          >
                            <span>{sectionScore.section}</span>
                            <span className="font-semibold text-zinc-950">
                              {sectionScore.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    "Not scored yet."
                  )}
                </div>
              </section>

              {result ? (
                <section>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Change log
                  </h3>
                  <ul className="mt-2 space-y-2 rounded-md border border-dashed border-zinc-300 bg-[#fbfbf8] p-4 text-sm leading-6 text-zinc-700">
                    {result.changeLog.changes.map((change) => (
                      <li key={`${change.section}-${change.tailoredText}`}>
                        <span className="font-semibold text-zinc-950">
                          {change.section}:
                        </span>{" "}
                        {change.reason}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <button
                className="h-11 w-full rounded-md border border-zinc-300 bg-zinc-100 px-4 text-sm font-semibold text-zinc-500"
                disabled
                type="button"
              >
                Download PDF placeholder
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
