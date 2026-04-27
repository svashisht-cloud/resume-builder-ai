import { Mail, MapPin, Globe, TrendingUp } from 'lucide-react'

export default function InteractiveHeroPreview() {
  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div
        className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:p-5"
        style={{
          background:
            'radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 14rem), radial-gradient(circle at 84% 72%, color-mix(in srgb, var(--accent-secondary) 20%, transparent), transparent 16rem), linear-gradient(135deg, color-mix(in srgb, var(--surface-raised) 88%, var(--accent) 12%), var(--surface))',
        }}
      >
        <div className="w-full max-w-[380px] flex-shrink-0">
          <div className="overflow-hidden rounded-[1.35rem] shadow-elevated ring-1 ring-slate-200/90 sm:rounded-none sm:shadow-none sm:ring-0">
            {/* Resume document */}
            <div className="relative overflow-hidden border-t-[3px] border-t-accent bg-white sm:rounded-sm sm:shadow-elevated sm:ring-1 sm:ring-slate-200">
              <div className="px-5 pb-0 pt-4">
                {/* Name + contact */}
                <div className="text-center">
                  <h3 className="font-display text-[15px] font-bold leading-tight tracking-tight text-slate-950">
                    Jordan Lee
                  </h3>
                  <p className="mt-0.5 text-[9px] text-slate-500">Senior Frontend Engineer</p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Mail size={7} />
                      <span className="text-[7px]">j.lee@email.com</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin size={7} />
                      <span className="text-[7px]">San Francisco, CA</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Globe size={7} />
                      <span className="text-[7px]">linkedin/jlee</span>
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 border-b border-slate-100" />

                {/* Summary */}
                <div className="mt-2.5">
                  <SectionTitle label="Summary" />
                  <p className="mt-1 text-[8.5px] leading-[1.5] text-slate-600">
                    Frontend engineer with 6+ years building accessible, high-performance web
                    products for cross-functional teams.
                  </p>
                </div>

                {/* Skills */}
                <div className="mt-2.5">
                  <SectionTitle label="Skills" />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {['React', 'TypeScript'].map((s) => (
                      <span
                        key={s}
                        className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[7px] font-medium text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                    {['Next.js', 'Accessibility', 'Core Web Vitals'].map((s) => (
                      <span
                        key={s}
                        className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[7px] font-medium text-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="mt-2.5">
                  <SectionTitle label="Experience" />

                  <div className="mt-1.5">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-[9px] font-semibold text-slate-900">
                        Senior Frontend Engineer
                      </p>
                      <p className="whitespace-nowrap text-[7px] text-slate-400">2021–Present</p>
                    </div>
                    <p className="text-[8px] font-medium text-slate-500">Acme Product Studio</p>
                    <div className="mt-1 space-y-0.5">
                      <Bullet
                        text="Led React + TypeScript design system adopted by 8 product teams."
                        highlighted
                      />
                      <Bullet
                        text="Improved Core Web Vitals, reducing LCP by 38% on high-traffic flows."
                        highlighted
                      />
                      <Bullet text="Partnered with design to document reusable UI patterns." />
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-[9px] font-semibold text-slate-900">Frontend Developer</p>
                      <p className="whitespace-nowrap text-[7px] text-slate-400">2019–2021</p>
                    </div>
                    <p className="text-[8px] font-medium text-slate-500">Northstar Labs</p>
                    <div className="mt-1 space-y-0.5">
                      <Bullet text="Shipped responsive interfaces with React, GraphQL, and design tokens." />
                      <Bullet text="Supported accessibility fixes across shared checkout components." />
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="mt-2.5">
                  <SectionTitle label="Education" />
                  <div className="mt-1.5">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-[9px] font-semibold text-slate-900">
                        B.S. Computer Science
                      </p>
                      <p className="text-[7px] text-slate-400">2019</p>
                    </div>
                    <p className="text-[8px] text-slate-500">University of Washington</p>
                  </div>
                </div>

                <div className="h-6" />
              </div>

              {/* Fade-out bottom */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />
            </div>

            <div className="border-t border-slate-200 bg-surface-raised/95 px-4 py-3 backdrop-blur sm:hidden">
              <div className="flex items-start gap-3">
                <div className="min-w-[84px]">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted">
                    ATS Score
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-success">
                    <TrendingUp size={12} />
                    <span className="text-[11px] font-bold">+31 pts</span>
                  </div>
                  <p className="mt-1 text-[7.5px] text-muted">63 → 94 match lift</p>
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                  <ScorePill
                    tone="before"
                    label="Before"
                    score="63"
                    barWidth="63%"
                    note="Needs improvement"
                  />
                  <ScorePill
                    tone="after"
                    label="After"
                    score="94"
                    barWidth="94%"
                    note="Strong match"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ATS Score widget — desktop only: vertical card beside resume, centered */}
        <div className="hidden w-[128px] flex-shrink-0 self-center rounded-xl border border-border bg-surface-raised/95 p-3 shadow-accent-soft backdrop-blur sm:flex sm:flex-col sm:gap-2">
          <p className="text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-muted">ATS Score</p>
          <div className="rounded-lg bg-amber-50/80 p-2">
            <p className="text-[8px] font-medium text-slate-500">Before</p>
            <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-slate-400">63</p>
            <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-amber-100">
              <div className="h-full w-[63%] rounded-full bg-amber-300/90" />
            </div>
            <p className="mt-0.5 text-[7px] text-amber-600/80">Needs improvement</p>
          </div>
          <div className="flex items-center justify-center gap-1">
            <TrendingUp size={10} className="text-success" />
            <span className="text-[10px] font-bold text-success">+31 pts</span>
          </div>
          <div className="rounded-lg bg-success/8 p-2">
            <p className="text-[8px] font-medium text-success">After</p>
            <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-success">94</p>
            <div className="mt-1 h-[4px] overflow-hidden rounded-full bg-success/20">
              <div className="h-full w-[94%] rounded-full bg-success" />
            </div>
            <p className="mt-0.5 text-[7px] text-success/80">Strong match ✓</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScorePill({
  tone,
  label,
  score,
  barWidth,
  note,
}: {
  tone: 'before' | 'after'
  label: string
  score: string
  barWidth: string
  note: string
}) {
  const isAfter = tone === 'after'

  return (
    <div className={`rounded-lg p-2 ${isAfter ? 'bg-success/8' : 'bg-amber-50/80'}`}>
      <p className={`text-[8px] font-medium ${isAfter ? 'text-success' : 'text-slate-500'}`}>
        {label}
      </p>
      <p
        className={`mt-0.5 font-display text-xl font-bold tabular-nums ${
          isAfter ? 'text-success' : 'text-slate-400'
        }`}
      >
        {score}
      </p>
      <div className={`mt-1 h-[4px] overflow-hidden rounded-full ${isAfter ? 'bg-success/20' : 'bg-amber-100'}`}>
        <div
          className={`h-full rounded-full ${isAfter ? 'bg-success' : 'bg-amber-300/90'}`}
          style={{ width: barWidth }}
        />
      </div>
      <p className={`mt-0.5 text-[7px] ${isAfter ? 'text-success/80' : 'text-amber-600/80'}`}>
        {note}
      </p>
    </div>
  )
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[7.5px] font-bold uppercase tracking-[0.22em] text-slate-600">{label}</span>
      <div className="h-px flex-1 bg-accent/20" />
    </div>
  )
}

function Bullet({ text, highlighted = false }: { text: string; highlighted?: boolean }) {
  return (
    <p
      className={`rounded border-l-2 py-0.5 pl-2 text-[8.5px] leading-[1.45] ${
        highlighted ? 'border-success bg-success-bg text-slate-800' : 'border-transparent text-slate-600'
      }`}
    >
      {text}
    </p>
  )
}
