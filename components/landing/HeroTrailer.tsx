'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, CheckCircle2, Download } from 'lucide-react'

// 0: upload zone   (1000ms)
// 1: file flying   (1500ms)
// 2: pill appears  (1500ms)
// 3: JD typing     (3000ms)
// 4: tailor btn    (1000ms)
// 5: loading       (800ms)
// 6: two-col view  (5000ms)
// 7: fade/reset    (500ms)
const STEP_DURATIONS = [1000, 1500, 1500, 3000, 1000, 800, 5000, 500]
const TOTAL_STEPS = STEP_DURATIONS.length

const JD_TEXT =
  'Senior Frontend Engineer — React, TypeScript, Next.js. Experience with design systems, performance optimization, and scalable component architectures. Remote-friendly.'

export default function HeroTrailer() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const [step, setStep] = useState(() => (prefersReducedMotion ? 6 : 0))
  const [typedChars, setTypedChars] = useState(0)
  const [atsAfter, setAtsAfter] = useState(() => (prefersReducedMotion ? 94 : 62))
  const [showExport, setShowExport] = useState(() => prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return

    function schedule(s: number) {
      timerRef.current = setTimeout(() => {
        const next = (s + 1) % TOTAL_STEPS
        setStep(next)
        if (next === 0) {
          setTypedChars(0)
          setAtsAfter(62)
          setShowExport(false)
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
      3000 / JD_TEXT.length,
    )
    return () => clearInterval(iv)
  }, [step])

  useEffect(() => {
    if (step !== 6) return
    setAtsAfter(62)
    setShowExport(false)

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
      (5000 * 0.6) / (94 - 62),
    )

    const exportTimer = setTimeout(() => setShowExport(true), 3200)
    return () => {
      clearInterval(iv)
      clearTimeout(exportTimer)
    }
  }, [step])

  const showUploadZone = step <= 1 || step === 7
  const fileAnimating = step === 1
  const showSinglePane = step >= 2 && step <= 5
  const showJD = step >= 3 && step <= 5
  const showTailorBtn = step >= 3 && step <= 4
  const showLoading = step === 5
  const isAppView = step === 6

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

      {/* Content area — all three panes are absolute so they cross-fade cleanly */}
      <div className="relative h-[520px] overflow-hidden md:h-[560px]">

        {/* ── Pane 1: Upload zone (steps 0–1, 7) ── */}
        <div
          className={`absolute inset-0 p-4 transition-opacity duration-300 ${showUploadZone ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        >
          <div
            className={`relative flex h-full flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed transition-colors duration-500 ${fileAnimating ? 'border-accent bg-accent/5' : 'border-border'
              }`}
          >
            {/* Icon in accent bubble */}
            <div
              className={`rounded-2xl p-5 transition-colors duration-500 ${fileAnimating ? 'bg-accent/20' : 'bg-surface-2'
                }`}
            >
              <Upload
                className={`transition-colors duration-500 ${fileAnimating ? 'text-accent' : 'text-muted'
                  }`}
                size={44}
              />
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Drop your resume here</p>
              <p className="mt-1.5 text-xs text-muted">PDF, DOCX, or TXT — up to 5 MB</p>
            </div>

            {/* Browse button */}
            <div className="rounded-lg border border-border bg-surface-2 px-6 py-2 text-xs font-medium text-foreground">
              Browse files
            </div>

            {/* Flying file card */}
            <div
              className={`absolute flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 shadow-lg transition-all duration-500 ease-out ${fileAnimating
                  ? 'translate-y-0 scale-100 opacity-100'
                  : 'translate-y-8 scale-90 opacity-0'
                }`}
            >
              <FileText className="flex-shrink-0 text-red-400" size={24} />
              <div>
                <p className="text-xs font-medium text-foreground">megan_connor_resume.pdf</p>
                <p className="text-[10px] text-muted">218 KB</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pane 2: Single-pane (steps 2–5) ── */}
        <div
          className={`absolute inset-0 flex flex-col gap-3 p-4 transition-opacity duration-300 ${showSinglePane ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        >
          {/* File pill */}
          <div className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
            <CheckCircle2 className="flex-shrink-0 text-emerald-400" size={16} />
            <FileText className="flex-shrink-0 text-red-400" size={14} />
            <span className="truncate text-xs font-medium text-foreground">
              megan_connor_resume.pdf
            </span>
            <span className="ml-auto flex-shrink-0 text-[10px] text-muted">218 KB</span>
          </div>

          {/* JD textarea — fills remaining height */}
          <div
            className={`flex flex-1 flex-col gap-2 transition-all duration-300 ${showJD ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
          >
            <p className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Job Description
            </p>
            <div className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-foreground">
              {JD_TEXT.slice(0, typedChars)}
              {step === 3 && (
                <span className="ml-px inline-block h-3 w-0.5 animate-pulse bg-accent align-middle" />
              )}
            </div>
          </div>

          {/* Tailor button — step 4 */}
          {showTailorBtn && (
            <div className="flex-shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-background">
                Tailor Resume →
              </div>
            </div>
          )}

          {/* Loading shimmer — step 5 */}
          {showLoading && (
            <div className="flex-shrink-0">
              <div className="animate-pulse rounded-lg bg-accent/70 px-4 py-2.5 text-center text-sm font-semibold text-background">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                  Tailoring…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Pane 3: App view (step 6) — two-col grid ── */}
        <div
          className={`absolute inset-0 grid p-4 transition-opacity duration-300 ${isAppView ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          style={{ gridTemplateColumns: '2fr 3fr', columnGap: '0.75rem' }}
        >
          {/* Left: big ATS comparison only */}
          <div className="flex min-w-0 flex-col items-center justify-center gap-5 overflow-hidden rounded-lg border border-border bg-surface-2 px-4 py-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              ATS Match Score
            </p>

            <div className="flex w-full items-end gap-3">
              {/* Before */}
              <div className="flex flex-1 flex-col items-center gap-2">
                <span className="font-display text-4xl font-bold text-muted">62%</span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-1.5 rounded-full bg-muted" style={{ width: '62%' }} />
                </div>
                <span className="text-[10px] text-muted">Before</span>
              </div>

              <span className="mb-5 flex-shrink-0 text-base text-accent">→</span>

              {/* After */}
              <div className="flex flex-1 flex-col items-center gap-2">
                <span className="font-display text-4xl font-bold text-accent">{atsAfter}%</span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-1.5 rounded-full bg-accent transition-all duration-100"
                    style={{ width: `${atsAfter}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-accent">After</span>
              </div>
            </div>

            {/* Delta badge */}
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              +{atsAfter - 62}% improvement
            </div>
          </div>

          {/* Right: action buttons + tailored resume */}
          <div
            className="flex h-full flex-col overflow-hidden"
            style={{ opacity: isAppView ? 1 : 0, transition: 'opacity 500ms ease-out 200ms' }}
          >
            {/* Button row — always reserves height so resume position doesn't jump */}
            <div className="h-9 flex-shrink-0">
              <div
                className={`flex gap-2 transition-all duration-300 ${showExport ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0'}`}
              >
                <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 py-2 text-[10px] font-medium text-foreground">
                  Edit Resume
                </div>
                <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-[10px] font-semibold text-background">
                  <Download size={10} />
                  Download
                </div>
              </div>
            </div>

            {/* Resume card — vertically centered in remaining space */}
            <div className="flex flex-1 flex-col justify-center pt-1">
            <div className="relative overflow-hidden rounded-md bg-white p-4 shadow-xl">
              {/* Header */}
              <div className="text-center">
                <p className="font-display text-[11px] font-bold text-slate-900">Megan Connor</p>
                <p className="mt-0.5 text-[8px] text-slate-500">
                  megan@email.com • (555) 012-3456 • San Francisco, CA
                </p>
              </div>


              {/* Education */}
              <div className="mt-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">
                    Education
                  </span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-[8px] font-semibold text-slate-800">
                    B.S. Computer Science — UC Berkeley
                  </p>
                  <p className="flex-shrink-0 pl-1 text-[7px] text-slate-400">2019</p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-2">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">
                    Skills
                  </span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <p className="text-[8px] text-slate-600">
                  React, TypeScript, Next.js, Tailwind CSS, GraphQL, Node.js, Figma, Jest, Webpack
                </p>
              </div>
              {/* Experience */}
              <div className="mt-2.5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">
                    Experience
                  </span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[9px] font-semibold text-slate-800">
                        Senior Frontend Engineer — Acme Corp
                      </p>
                      <p className="flex-shrink-0 pl-1 text-[7px] text-slate-400">2021–Present</p>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <p className="rounded border-l-2 border-green-400 bg-green-50 pl-1.5 text-[8px] text-slate-700">
                        • Led React + TypeScript design system adopted by 8 product teams
                      </p>
                      <p className="rounded border-l-2 border-green-400 bg-green-50 pl-1.5 text-[8px] text-slate-700">
                        • Optimized Core Web Vitals; LCP improved 38% across key flows
                      </p>
                      <p className="rounded border-l-2 border-green-400 bg-green-50 pl-1.5 text-[8px] text-slate-700">
                        • Drove Next.js migration, cutting bundle size 45% site-wide
                      </p>
                      <p className="text-[8px] text-slate-600">
                        • Mentored 3 engineers in scalable component architecture
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[9px] font-semibold text-slate-800">
                        Frontend Developer — Beacon Labs
                      </p>
                      <p className="flex-shrink-0 pl-1 text-[7px] text-slate-400">2019–2021</p>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <p className="rounded border-l-2 border-green-400 bg-green-50 pl-1.5 text-[8px] text-slate-700">
                        • Built Next.js marketing site; reduced TTI by 42% via code splitting
                      </p>
                      <p className="text-[8px] text-slate-600">
                        • Integrated Figma→code pipeline, cutting design handoff 60%
                      </p>
                      <p className="text-[8px] text-slate-600">
                        • Maintained component library with 90%+ unit test coverage
                      </p>
                    </div>
                  </div>
                </div>
              </div>



              {/* Blurred overflow — suggests more content below */}
              <div className="mt-2 select-none blur-[2px]">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">
                    Projects
                  </span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-semibold text-slate-800">Open-Source Design Tokens CLI</p>
                  <p className="text-[8px] text-slate-600">• Built a CLI tool to sync design tokens from Figma to code repositories</p>
                  <p className="text-[8px] text-slate-600">• 1.2k GitHub stars; adopted by 3 design teams at enterprise companies</p>
                  <p className="mt-1 text-[8px] font-semibold text-slate-800">Real-Time Collaboration Board</p>
                  <p className="text-[8px] text-slate-600">• WebSocket-based whiteboard with React, Yjs CRDT, and Node.js backend</p>
                </div>
              </div>

              {/* Gradient fade */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
