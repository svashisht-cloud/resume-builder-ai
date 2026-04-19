'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, CheckCircle2, Download } from 'lucide-react'

// Step durations in ms
// 0: upload zone shown              (0–1000)
// 1: file card animating in         (1000–2500)
// 2: file "lands", pill appears     (2500–4000)
// 3: JD textarea + typing           (4000–7000)
// 4: Tailor button slides up        (7000–8000)
// 5: loading shimmer                (8000–9000)
// 6: ATS score                      (9000–11500)
// 7: resume preview                 (11500–14500)
// 8: fade out, reset to step 0      (14500–15000)
const STEP_DURATIONS = [1000, 1500, 1500, 3000, 1000, 1000, 2500, 3000, 500]
const TOTAL_STEPS = STEP_DURATIONS.length

const JD_TEXT =
  'Senior Frontend Engineer — React, TypeScript, Next.js. Experience with design systems, performance optimization, and scalable component architectures. Remote-friendly.'

const ATS_CHECKS = ['Keywords matched', 'Formatting ATS-safe', 'Skills aligned']

export default function HeroTrailer() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [step, setStep] = useState(0)
  const [typedChars, setTypedChars] = useState(0)
  const [atsCount, setAtsCount] = useState(0)
  const [atsScore, setAtsScore] = useState(0)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Advance through steps
  useEffect(() => {
    if (prefersReducedMotion) {
      setStep(7)
      return
    }

    function schedule(s: number) {
      timerRef.current = setTimeout(() => {
        const next = (s + 1) % TOTAL_STEPS
        setStep(next)
        if (next === 0) {
          setTypedChars(0)
          setAtsCount(0)
          setAtsScore(0)
        }
        schedule(next)
      }, STEP_DURATIONS[s])
    }
    schedule(0)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Typing effect during step 3
  useEffect(() => {
    if (step !== 3) return
    setTypedChars(0)
    let i = 0
    const iv = setInterval(() => {
      i++
      setTypedChars(i)
      if (i >= JD_TEXT.length) clearInterval(iv)
    }, JD_TEXT.length > 0 ? 3000 / JD_TEXT.length : 20)
    return () => clearInterval(iv)
  }, [step])

  // ATS score count-up during step 6
  useEffect(() => {
    if (step !== 6) return
    setAtsScore(0)
    setAtsCount(0)
    let score = 0
    const iv = setInterval(() => {
      score += 3
      if (score >= 94) {
        score = 94
        clearInterval(iv)
      }
      setAtsScore(score)
    }, 2500 / (94 / 3))
    // Stagger ATS check rows
    const t1 = setTimeout(() => setAtsCount(1), 400)
    const t2 = setTimeout(() => setAtsCount(2), 900)
    const t3 = setTimeout(() => setAtsCount(3), 1400)
    return () => { clearInterval(iv); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [step])

  // Derived visibility flags
  const showUploadZone   = step <= 1 || step === 8
  const fileAnimating    = step === 1
  const showFilePill     = step >= 2 && step <= 7
  const showJD           = step >= 3 && step <= 7
  const showTailorBtn    = step === 4
  const showLoading      = step === 5
  const showATS          = step === 6
  const showResume       = step === 7

  const circumference = 2 * Math.PI * 36 // r=36

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

      {/* Content area — single pane, content cross-fades */}
      <div className="relative min-h-[380px] p-5">

        {/* ── Step 1–2: Drop zone ── */}
        <div
          className={`absolute inset-5 transition-opacity duration-300 ${
            showUploadZone ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div
            className={`relative flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-500 ${
              fileAnimating ? 'border-accent bg-accent/5' : 'border-border'
            }`}
          >
            <Upload className="mb-3 text-muted" size={40} />
            <p className="text-sm font-medium text-foreground">Drop your resume here</p>
            <p className="mt-1 text-xs text-muted">or click to browse</p>

            {/* Animated file card */}
            <div
              className={`absolute flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 shadow-lg transition-all duration-500 ease-out ${
                fileAnimating
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

        {/* ── Steps 2–7: Content area with pill + forms ── */}
        <div
          className={`flex h-full flex-col gap-4 transition-opacity duration-300 ${
            showFilePill ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {/* Uploaded file pill */}
          <div
            className={`flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 transition-opacity duration-300 ${
              showFilePill ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <CheckCircle2 className="flex-shrink-0 text-emerald-400" size={16} />
            <FileText className="flex-shrink-0 text-red-400" size={14} />
            <span className="text-xs font-medium text-foreground">megan_connor_resume.pdf</span>
            <span className="ml-auto text-[10px] text-muted">218 KB</span>
          </div>

          {/* ── Step 3–4: JD textarea ── */}
          <div
            className={`flex flex-col gap-3 transition-all duration-300 ${
              showJD ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Job Description
            </p>
            <div className="min-h-[100px] rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-foreground">
              {JD_TEXT.slice(0, typedChars)}
              {(step === 3) && (
                <span className="ml-px inline-block h-3 w-0.5 animate-pulse bg-accent align-middle" />
              )}
            </div>
          </div>

          {/* ── Step 4: Tailor button ── */}
          <div
            className={`transition-all duration-300 ${
              showTailorBtn ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <div className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-background">
              Tailor Resume →
            </div>
          </div>

          {/* ── Step 5: Loading shimmer ── */}
          <div
            className={`transition-opacity duration-300 ${
              showLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <div className="animate-pulse rounded-lg bg-accent/70 px-4 py-2.5 text-center text-sm font-semibold text-background">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Tailoring…
              </span>
            </div>
          </div>

          {/* ── Step 6: ATS score ── */}
          <div
            className={`flex flex-col items-center gap-4 transition-opacity duration-300 ${
              showATS ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* Circular progress ring */}
            <div className="relative flex items-center justify-center">
              <svg width="100" height="100" className="-rotate-90">
                <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
                <circle
                  cx="50" cy="50" r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (atsScore / 100) * circumference}
                  className="text-accent transition-all duration-100"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-2xl font-bold text-foreground">{atsScore}%</span>
              </div>
            </div>
            <p className="text-sm text-muted">ATS Match Score</p>
            <div className="space-y-1.5">
              {ATS_CHECKS.map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 text-xs text-muted transition-opacity duration-300 ${
                    atsCount > i ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <CheckCircle2 className="text-emerald-400" size={14} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 7: Resume preview ── */}
          <div
            className={`flex-1 overflow-hidden transition-opacity duration-300 ${
              showResume ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <div className="relative rounded-md bg-white p-5 shadow-xl">
              {/* Export button */}
              <div className="absolute right-4 top-4 flex animate-pulse items-center gap-1.5 rounded-full border border-accent bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent">
                <Download size={10} />
                Export PDF
              </div>

              {/* Resume content */}
              <div className="text-center">
                <p className="font-display text-sm font-bold text-slate-900">Megan Connor</p>
                <p className="mt-0.5 text-[9px] text-slate-500">megan@email.com • (555) 012-3456 • San Francisco, CA</p>
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Experience</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[10px] font-semibold text-slate-800">Senior Frontend Engineer — Acme Corp</p>
                      <p className="text-[8px] text-slate-400">2021–Present</p>
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="rounded border-l-2 border-green-400 bg-green-50 pl-1.5 text-[9px] text-slate-700">
                        • Led React + TypeScript design system adopted by 8 product teams
                      </p>
                      <p className="rounded border-l-2 border-green-400 bg-green-50 pl-1.5 text-[9px] text-slate-700">
                        • Optimized Core Web Vitals; LCP improved 38% across key flows
                      </p>
                      <p className="text-[9px] text-slate-600">• Mentored 3 engineers in scalable component architecture</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[10px] font-semibold text-slate-800">Frontend Developer — Beacon Labs</p>
                      <p className="text-[8px] text-slate-400">2019–2021</p>
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-[9px] text-slate-600">• Built Next.js marketing site; reduced TTI by 42%</p>
                      <p className="text-[9px] text-slate-600">• Integrated Figma→code pipeline, cutting design handoff 60%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Skills</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <p className="text-[9px] text-slate-600">React, TypeScript, Next.js, Tailwind CSS, Figma, GraphQL, Node.js</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
