'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'

const SCORE_START = 63
const SCORE_END = 94

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

const STEPS = [
  {
    label: 'Your original resume',
    description: 'Start with exactly what you have — PDF, DOCX, or plain text.',
  },
  {
    label: 'Surfacing the right keywords',
    description: 'We read the job description and highlight every skill gap.',
  },
  {
    label: 'Rewriting your bullets',
    description: "AI strengthens your wording using only what's already on your resume.",
  },
  {
    label: 'ATS-ready and tailored',
    description: 'Score jumps. Download your PDF or DOCX. No invented claims.',
  },
]

export default function ResumeTransformSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const reducedInit = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [maxScrollProgress, setMaxScrollProgress] = useState(() => (reducedInit() ? 1 : 0))

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    function handleMotionChange(e: MediaQueryListEvent) {
      setPrefersReducedMotion(e.matches)
      if (e.matches) setMaxScrollProgress(1)
    }

    mq.addEventListener('change', handleMotionChange)

    if (mq.matches) {
      return () => mq.removeEventListener('change', handleMotionChange)
    }

    function onScroll() {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const totalScrollable = el.offsetHeight - window.innerHeight
      const scrolled = Math.max(0, -rect.top)
      const raw = Math.min(1, scrolled / totalScrollable)
      setMaxScrollProgress((prev) => Math.max(prev, raw))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', handleMotionChange)
    }
  }, [])

  const phase =
    maxScrollProgress < 0.25 ? 0
    : maxScrollProgress < 0.5 ? 1
    : maxScrollProgress < 0.75 ? 2
    : 3

  const displayScore = Math.round(
    SCORE_START + (SCORE_END - SCORE_START) * easeOutCubic(maxScrollProgress),
  )

  const sectionStyle = prefersReducedMotion ? undefined : { height: 'clamp(280vh, 360vh, 400vh)' }

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-border/50 bg-surface"
      style={sectionStyle}
    >
      <div
        className={`${prefersReducedMotion ? 'relative' : 'sticky top-0'} h-screen overflow-hidden`}
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 50%), radial-gradient(ellipse at 80% 30%, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 50%)',
        }}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-6 px-6 py-10 lg:flex-row lg:items-center lg:gap-14">
        {/* Left: step indicators (desktop) / phase label (mobile) */}
        <div className="flex w-full flex-col gap-1 lg:w-[38%] lg:gap-2">
          {/* Mobile: just show active step label */}
          <div className="lg:hidden">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">Step {phase + 1} of 4</span>
            </div>
            <p className="text-lg font-bold text-foreground">{STEPS[phase].label}</p>
            <p className="mt-1 text-sm text-muted">{STEPS[phase].description}</p>
          </div>

          {/* Desktop: full step list */}
          <div className="hidden lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">Live preview</span>
            </div>
            <h2 className="font-display mb-8 text-3xl font-bold leading-tight text-foreground">
              Watch your resume<br />transform in real time
            </h2>
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const isActive = i === phase
                const isPast = i < phase
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
                      isActive
                        ? 'border-accent/40 bg-accent/8 shadow-accent-soft'
                        : isPast
                          ? 'border-success/20 bg-success/5'
                          : 'border-border/40 bg-surface/50 opacity-50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300 ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : isPast
                            ? 'bg-success text-white'
                            : 'bg-border text-muted'
                      }`}
                    >
                      {isPast ? <CheckCircle2 size={12} /> : i + 1}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-foreground' : isPast ? 'text-foreground/70' : 'text-muted'}`}
                      >
                        {step.label}
                      </p>
                      {isActive && (
                        <p className="mt-0.5 text-xs leading-5 text-muted">{step.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: resume card + ATS widget */}
        <div className="flex w-full flex-col gap-3 lg:w-[62%]">
          <div className="flex items-start gap-3">
            {/* Resume card */}
            <div className="relative w-[260px] flex-shrink-0 overflow-hidden rounded-sm bg-white px-5 py-4 text-slate-900 shadow-elevated ring-1 ring-border/50">
              {/* Header */}
              <div className="text-center">
                <h3 className="font-display text-[11px] font-bold tracking-wide text-slate-950">
                  Jordan Lee
                </h3>
                <p className="mt-0.5 text-[8px] text-slate-500">
                  Frontend Engineer · React · TypeScript · Next.js
                </p>
              </div>

              {/* Summary */}
              <div className="mt-3">
                <SectionTitle label="Summary" />
                <p className="mt-1 text-[8.5px] leading-[1.5] text-slate-700">
                  Frontend engineer building accessible product interfaces, design systems, and fast
                  web experiences for cross-functional teams.
                </p>
              </div>

              {/* Skills */}
              <div className="mt-3">
                <SectionTitle label="Skills" />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {['React', 'TypeScript', 'Next.js', 'Accessibility', 'Core Web Vitals'].map(
                    (skill) => {
                      const highlighted =
                        phase >= 1 &&
                        ['Next.js', 'Accessibility', 'Core Web Vitals'].includes(skill)
                      return (
                        <span
                          key={skill}
                          className={`rounded border px-1.5 py-0.5 text-[7px] font-medium transition-all duration-500 ${
                            highlighted
                              ? 'border-accent/40 bg-accent/10 text-slate-900 shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          {skill}
                        </span>
                      )
                    },
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="mt-3">
                <SectionTitle label="Experience" />

                {/* Job 1 */}
                <div className="mt-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[9px] font-bold text-slate-900">Senior Frontend Engineer</p>
                    <p className="text-[7px] text-slate-500">2021–Present</p>
                  </div>
                  <p className="mt-0.5 text-[8px] text-slate-500">Acme Product Studio</p>
                  <div className="mt-1.5 space-y-1">
                    <MorphingBullet
                      before="Built internal UI components for the product team."
                      after="Led React + TypeScript design system adopted by 8 product teams."
                      active={phase >= 2}
                    />
                    <MorphingBullet
                      before="Worked on web performance improvements."
                      after="Improved Core Web Vitals, reducing LCP by 38% on high-traffic flows."
                      active={phase >= 3}
                    />
                    <Bullet text="Partnered with design to document reusable UI patterns." />
                  </div>
                </div>

                {/* Job 2 */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[9px] font-bold text-slate-900">Frontend Developer</p>
                    <p className="text-[7px] text-slate-500">2019–2021</p>
                  </div>
                  <p className="mt-0.5 text-[8px] text-slate-500">Northstar Labs</p>
                  <div className="mt-1.5 space-y-1">
                    <Bullet text="Shipped responsive interfaces with React, GraphQL, and design tokens." />
                    <Bullet text="Supported accessibility fixes across shared checkout components." />
                  </div>
                </div>
              </div>

              {/* "AI Tailored" badge — phase 3 */}
              {phase === 3 && (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-2 py-1 shadow-sm">
                  <Sparkles size={10} className="text-success" />
                  <span className="text-[9px] font-semibold text-success">AI Tailored ✓</span>
                </div>
              )}

              {/* Fade-out bottom */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* ATS score widget */}
            <div className="flex w-[110px] flex-shrink-0 flex-col gap-2 rounded-xl border border-border bg-surface-raised/95 p-3 shadow-accent-soft backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                ATS Fit
              </p>
              <div className="flex items-end gap-1">
                <span
                  className={`font-display text-3xl font-bold tabular-nums transition-colors duration-300 ${
                    displayScore >= 88 ? 'text-success' : 'text-foreground'
                  }`}
                >
                  {displayScore}
                </span>
                <span className="mb-1 text-xs text-muted/60">/ 100</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    displayScore >= 88 ? 'bg-success' : 'bg-accent'
                  }`}
                  style={{ width: `${displayScore}%` }}
                />
              </div>
              <div className="mt-1 space-y-1">
                {['Next.js', 'Design systems', 'Performance'].map((kw) => (
                  <span
                    key={kw}
                    className={`block rounded px-1.5 py-0.5 text-[8px] font-medium transition-all duration-500 ${
                      phase >= 1
                        ? 'border border-accent/30 bg-accent/10 text-foreground'
                        : 'border border-border bg-surface text-muted'
                    }`}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: phase dots */}
          <div className="flex items-center justify-center gap-2 lg:hidden">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === phase ? 'w-5 bg-accent' : i < phase ? 'w-2 bg-success' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Desktop scroll hint */}
          <p className="hidden text-center text-xs text-muted/60 lg:block">
            {phase < 3 ? '↓ Keep scrolling to see the transformation' : '✓ Fully tailored — ready to export'}
          </p>
        </div>
        </div>
      </div>
    </section>
  )
}

function MorphingBullet({ before, after, active }: { before: string; after: string; active: boolean }) {
  return (
    <div
      key={active ? 'after' : 'before'}
      className={`animate-in fade-in slide-in-from-bottom-1 rounded border-l-2 py-0.5 pl-2 text-[8px] leading-[1.4] duration-500 ${
        active
          ? 'border-success bg-success-bg text-slate-800'
          : 'border-transparent text-slate-700'
      }`}
    >
      {active ? after : before}
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <p className="rounded border-l-2 border-transparent py-0.5 pl-2 text-[8px] leading-[1.4] text-slate-700">
      {text}
    </p>
  )
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}
