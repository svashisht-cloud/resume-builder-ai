'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, CheckCircle2, Download } from 'lucide-react'

// step 0: upload zone   (1000ms)
// step 1: file flying   (1500ms)
// step 2: pill appears  (1500ms)
// step 3: JD typing     (3000ms)
// step 4: tailor btn    (1000ms)
// step 5: loading       (800ms)
// step 6: ATS increase  (2500ms)
// step 7: resume view   (4000ms)
// step 8: fade/reset    (500ms)
const STEP_DURATIONS = [1000, 1500, 1500, 3000, 1000, 800, 2500, 4000, 500]
const TOTAL_STEPS = STEP_DURATIONS.length

const JD_TEXT =
  'Senior Frontend Engineer - React, TypeScript, Next.js. 5+ years building scalable design systems and component libraries. Deep focus on performance optimization and Core Web Vitals. Strong grasp of accessibility (WCAG 2.1), modern bundlers, and CI/CD workflows. Remote-friendly. Collaborative culture, high ownership.'

export default function HeroTrailer() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const [step, setStep] = useState(() => (prefersReducedMotion ? 7 : 0))
  const [typedChars, setTypedChars] = useState(0)
  const [atsAfter, setAtsAfter] = useState(() => (prefersReducedMotion ? 94 : 62))
  const [showDownload, setShowDownload] = useState(() => prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return

    function schedule(s: number) {
      timerRef.current = setTimeout(() => {
        const next = (s + 1) % TOTAL_STEPS
        setStep(next)
        if (next === 0) {
          setTypedChars(0)
          setAtsAfter(62)
          setShowDownload(false)
        }
        schedule(next)
      }, STEP_DURATIONS[s])
    }
    schedule(0)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (step !== 3) return
    setTypedChars(0)
    let i = 0
    const iv = setInterval(
      () => {
        i++
        setTypedChars(i)
        if (i >= JD_TEXT.length) clearInterval(iv)
      },
      9,
    )
    return () => clearInterval(iv)
  }, [step])

  useEffect(() => {
    if (step !== 6) return
    setAtsAfter(62)
    let val = 62
    const iv = setInterval(
      () => {
        val++
        if (val >= 94) {
          val = 94
          clearInterval(iv)
        }
        setAtsAfter(val)
      },
      (2500 * 0.7) / (94 - 62),
    )
    return () => clearInterval(iv)
  }, [step])

  useEffect(() => {
    if (step !== 7) return
    setShowDownload(false)
    const t = setTimeout(() => setShowDownload(true), 600)
    return () => clearTimeout(t)
  }, [step])

  const showUploadZone = step <= 1 || step === 8
  const fileAnimating = step === 1
  const showSinglePane = step >= 2 && step <= 5
  const showJD = step >= 3 && step <= 5
  const showTailorBtn = step >= 3 && step <= 4
  const showLoading = step === 5
  const isAtsView = step === 6
  const isResumeView = step === 7

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-surface">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <div className="mx-auto rounded-full border border-border px-4 py-0.5 text-xs text-text-dim">
          resume.app/tailor
        </div>
        <span className="h-3 w-3" />
      </div>

      {/* Content area — panes cross-fade via absolute + opacity */}
      <div className="relative h-[360px] overflow-hidden sm:h-[520px] md:h-[560px]">

        {/* ── Pane 1: Upload zone (steps 0–1, 8) ── */}
        <div
          className={`absolute inset-0 p-4 transition-opacity duration-300 ${showUploadZone ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <div
            className={`relative flex h-full flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed transition-colors duration-500 ${fileAnimating ? 'border-accent bg-accent/5' : 'border-border'}`}
          >
            <div
              className={`rounded-2xl p-5 transition-colors duration-500 ${fileAnimating ? 'bg-accent/20' : 'bg-surface-2'}`}
            >
              <Upload
                className={`transition-colors duration-500 ${fileAnimating ? 'text-accent' : 'text-muted'}`}
                size={44}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Drop your resume here</p>
              <p className="mt-1.5 text-xs text-muted">PDF, DOCX, or TXT. Up to 5 MB</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 px-6 py-2 text-xs font-medium text-foreground">
              Browse files
            </div>
            {/* Flying file card */}
            <div
              className={`absolute flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 shadow-lg transition-all duration-500 ease-out ${fileAnimating ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-90 opacity-0'}`}
            >
              <FileText className="flex-shrink-0 text-accent" size={24} />
              <div>
                <p className="text-xs font-medium text-foreground">megan_connor_resume.pdf</p>
                <p className="text-[10px] text-muted">218 KB</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pane 2: Single-pane with file pill + JD (steps 2–5) ── */}
        <div
          className={`absolute inset-0 flex flex-col gap-3 p-4 transition-opacity duration-300 ${showSinglePane ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          {/* File pill — bigger text */}
          <div className="flex flex-shrink-0 items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3">
            <CheckCircle2 className="flex-shrink-0 text-success-fg" size={18} />
            <FileText className="flex-shrink-0 text-accent" size={16} />
            <span className="truncate text-sm font-medium text-foreground">
              megan_connor_resume.pdf
            </span>
            <span className="ml-auto flex-shrink-0 text-xs text-muted">218 KB</span>
          </div>

          {/* JD textarea — fills remaining height, bigger text */}
          <div
            className={`flex flex-1 flex-col gap-2 transition-all duration-300 ${showJD ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
          >
            <p className="flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">
              Job Description
            </p>
            <div className="flex-1 rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-sm leading-relaxed text-foreground">
              {JD_TEXT.slice(0, typedChars)}
              {step === 3 && (
                <span className="ml-px inline-block h-3.5 w-0.5 animate-pulse bg-accent align-middle" />
              )}
            </div>
          </div>

          {/* Tailor button */}
          {showTailorBtn && (
            <div className="flex-shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground">
                Tailor Resume →
              </div>
            </div>
          )}

          {/* Loading shimmer */}
          {showLoading && (
            <div className="flex-shrink-0">
              <div className="animate-pulse rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                  Tailoring…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Pane 3: ATS score increase (step 6) — full width ── */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${isAtsView ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <div className="w-full max-w-xs rounded-xl border border-border bg-surface-2 px-8 py-8">
            <p className="mb-7 text-center text-xs font-semibold uppercase tracking-widest text-muted">
              ATS Match Score
            </p>
            <div className="flex items-end gap-5">
              {/* Before */}
              <div className="flex flex-1 flex-col items-center gap-2.5">
                <span className="font-display text-5xl font-bold text-muted">62%</span>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-2 rounded-full bg-muted" style={{ width: '62%' }} />
                </div>
                <span className="text-xs text-muted">Before</span>
              </div>

              <span className="mb-7 flex-shrink-0 text-xl text-accent">→</span>

              {/* After — animates */}
              <div className="flex flex-1 flex-col items-center gap-2.5">
                <span className="font-display text-5xl font-bold text-accent">{atsAfter}%</span>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-2 rounded-full bg-accent transition-all duration-100"
                    style={{ width: `${atsAfter}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-accent">After</span>
              </div>
            </div>

            <div className="mt-7 flex justify-center">
              <div className="rounded-full border border-success-border bg-success-bg px-4 py-1.5 text-sm font-bold text-success-fg">
                +{atsAfter - 62}% improvement
              </div>
            </div>
          </div>
        </div>

        {/* ── Pane 4: Resume view (step 7) — full width ── */}
        <div
          className={`absolute inset-0 flex flex-col gap-3 p-4 transition-opacity duration-300 ${isResumeView ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          {/* Button row */}
          <div className="h-9 flex-shrink-0">
            <div
              className={`flex gap-2 transition-all duration-300 ${showDownload ? 'translate-y-0 opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-xs font-medium text-foreground">
                Edit Resume
              </div>
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-xs font-semibold text-accent-foreground">
                <Download size={12} />
                Download PDF
              </div>
            </div>
          </div>

          {/* Full-width resume card */}
          <div className="flex-1 overflow-hidden">
            <div className="relative h-full overflow-hidden rounded-md bg-white p-5 shadow-xl">
              {/* Header */}
              <div className="text-center">
                <p className="font-display text-[13px] font-bold text-slate-900">Megan Connor</p>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  megan@email.com • (555) 012-3456 • San Francisco, CA
                </p>
              </div>

              {/* Education */}
              <div className="mt-2.5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Education</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-[9px] font-semibold text-slate-800">B.S. Computer Science, UC Berkeley</p>
                  <p className="flex-shrink-0 pl-1 text-[8px] text-slate-400">2019</p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-2.5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Skills</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <p className="text-[9px] text-slate-600">
                  React, TypeScript, Next.js, Tailwind CSS, GraphQL, Node.js, Figma, Jest, Webpack
                </p>
              </div>

              {/* Experience */}
              <div className="mt-2.5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Experience</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[10px] font-semibold text-slate-800">Senior Frontend Engineer, Acme Corp</p>
                      <p className="flex-shrink-0 pl-1 text-[8px] text-slate-400">2021–Present</p>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <p className="rounded border-l-2 border-success bg-success-bg pl-1.5 text-[9px] text-slate-700">
                        • Led React + TypeScript design system adopted by 8 product teams
                      </p>
                      <p className="rounded border-l-2 border-success bg-success-bg pl-1.5 text-[9px] text-slate-700">
                        • Optimized Core Web Vitals; LCP improved 38% across key flows
                      </p>
                      <p className="rounded border-l-2 border-success bg-success-bg pl-1.5 text-[9px] text-slate-700">
                        • Drove Next.js migration, cutting bundle size 45% site-wide
                      </p>
                      <p className="text-[9px] text-slate-600">• Mentored 3 engineers in scalable component architecture</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[10px] font-semibold text-slate-800">Frontend Developer, Beacon Labs</p>
                      <p className="flex-shrink-0 pl-1 text-[8px] text-slate-400">2019–2021</p>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <p className="rounded border-l-2 border-success bg-success-bg pl-1.5 text-[9px] text-slate-700">
                        • Built Next.js marketing site; reduced TTI by 42% via code splitting
                      </p>
                      <p className="text-[9px] text-slate-600">• Integrated Figma→code pipeline, cutting design handoff 60%</p>
                      <p className="text-[9px] text-slate-600">• Maintained component library with 90%+ unit test coverage</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects — blurred to suggest more content */}
              <div className="mt-2.5 select-none blur-[2px]">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Projects</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold text-slate-800">Open-Source Design Tokens CLI</p>
                  <p className="text-[9px] text-slate-600">• Built a CLI tool to sync design tokens from Figma to code repositories</p>
                  <p className="text-[9px] text-slate-600">• 1.2k GitHub stars; adopted by 3 design teams at enterprise companies</p>
                </div>
              </div>

              {/* Gradient fade */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
