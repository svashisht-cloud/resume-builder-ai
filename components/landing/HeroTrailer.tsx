'use client'

import { useEffect, useRef, useState } from 'react'

const RESUME_LINES = [
  { text: 'Software Engineer — Acme Corp (2021–Present)', highlight: true },
  { text: '• Led migration of monolith to microservices, reducing p99 latency by 40%', highlight: false },
  { text: '• Built internal CI/CD pipeline serving 60+ engineers', highlight: false },
  { text: '• Mentored 3 junior engineers; drove TypeScript adoption across 4 teams', highlight: false },
]

const JD_LINES = [
  'React • TypeScript • scalable distributed systems',
  'Experience with CI/CD and developer tooling',
  'Strong communication and cross-team collaboration',
]

const DIFF_LINES = [
  { type: 'removed', text: 'Led migration of monolith to microservices, reducing p99 latency by 40%' },
  { type: 'added', text: 'Architected React + TypeScript microservices migration, cutting p99 latency 40%' },
  { type: 'context', text: 'Built internal CI/CD pipeline serving 60+ engineers' },
  { type: 'removed', text: 'Mentored 3 junior engineers; drove TypeScript adoption across 4 teams' },
  { type: 'added', text: 'Grew TypeScript adoption across 4 teams; mentored 3 engineers in scalable system design' },
]

const TOTAL_STEPS = 7
const STEP_DURATIONS = [2000, 2000, 2000, 4000, 2000, 2000, 500]

export default function HeroTrailer() {
  const [step, setStep] = useState(0)
  const [visibleDiffLines, setVisibleDiffLines] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const diffTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) {
      setStep(4)
      setVisibleDiffLines(DIFF_LINES.length)
      return
    }

    function advance(current: number) {
      const next = (current + 1) % TOTAL_STEPS
      timerRef.current = setTimeout(() => {
        setStep(next)
        if (next === 0) setVisibleDiffLines(0)
        advance(next)
      }, STEP_DURATIONS[current])
    }

    advance(0)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Progressively reveal diff lines during step 3
  useEffect(() => {
    if (step === 3) {
      setVisibleDiffLines(0)
      let count = 0
      diffTimerRef.current = setInterval(() => {
        count++
        setVisibleDiffLines(count)
        if (count >= DIFF_LINES.length && diffTimerRef.current) {
          clearInterval(diffTimerRef.current)
        }
      }, 600)
    }
    return () => {
      if (diffTimerRef.current) clearInterval(diffTimerRef.current)
    }
  }, [step])

  const showResume = step >= 0
  const showJD = step >= 1
  const showTailorBtn = step >= 0 && step < 3
  const showLoading = step === 2
  const showDiff = step >= 3
  const showAtsBadge = step >= 4
  const showExportBtn = step >= 5

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-surface will-change-transform">
      {/* Browser chrome top bar */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <div className="mx-auto rounded-full border border-border px-4 py-0.5 text-xs text-text-dim">
          resume.app/tailor
        </div>
        <span className="h-3 w-3" />
      </div>

      {/* Content area */}
      <div className="relative min-h-[360px] p-4">
        {/* ATS badge */}
        <div
          className={`absolute right-6 top-4 z-10 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition-all duration-500 ${
            showAtsBadge ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          ATS Match: 94%
        </div>

        <div className="flex h-full gap-3">
          {/* Resume / Diff pane */}
          <div
            className={`flex-1 overflow-hidden rounded-lg border border-border bg-background p-3 transition-all duration-500 ${
              showResume ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              {showDiff ? 'Diff View' : 'Your Resume'}
            </p>

            {!showDiff && (
              <div className="space-y-1.5 font-mono text-xs">
                {RESUME_LINES.map((line, i) => (
                  <p
                    key={i}
                    className={
                      line.highlight
                        ? 'font-semibold text-accent'
                        : 'text-muted'
                    }
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            )}

            {showDiff && (
              <div className="space-y-1 font-mono text-xs">
                {DIFF_LINES.slice(0, visibleDiffLines).map((line, i) => (
                  <div
                    key={i}
                    className={`rounded px-1.5 py-0.5 transition-all duration-300 ${
                      line.type === 'added'
                        ? 'border-l-2 border-green-500 bg-green-500/10 text-green-400'
                        : line.type === 'removed'
                          ? 'border-l-2 border-red-500 bg-red-500/10 text-red-400 line-through'
                          : 'text-muted'
                    }`}
                  >
                    <span className="mr-1 select-none text-text-dim">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    {line.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* JD pane */}
          <div
            className={`w-36 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background p-3 transition-all duration-500 ${
              showJD ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-dim">Job</p>
            <div className="space-y-1.5 text-xs text-muted">
              {JD_LINES.map((line, i) => (
                <p key={i} className="leading-4">{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Tailor button / loading */}
        <div
          className={`mt-3 flex items-center justify-between transition-all duration-300 ${
            showTailorBtn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="h-px flex-1 bg-border" />
          <div
            className={`mx-3 flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-background transition-all duration-300 ${
              showLoading ? 'animate-pulse bg-accent/70' : 'bg-accent'
            }`}
          >
            {showLoading ? (
              <>
                <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Tailoring…
              </>
            ) : (
              'Tailor Resume →'
            )}
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Export button */}
        {showExportBtn && (
          <div className="mt-2 flex justify-end">
            <div className="flex animate-bounce items-center gap-1.5 rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
