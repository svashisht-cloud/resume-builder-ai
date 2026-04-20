'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, Quote } from 'lucide-react'

const GAP = 24 // px — matches gap-6
const VISIBLE = 3

const testimonials = [
  {
    quote:
      'Landed my first FAANG interview after two weeks using this. The tailored bullets actually sounded like me — not a generic AI rewrite.',
    name: 'Priya S.',
    role: 'Senior Software Engineer',
    initials: 'PS',
    color: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    quote:
      "I was skeptical about another resume tool, but the diff view sold me. Seeing exactly what changed and why made editing so much faster.",
    name: 'Marcus T.',
    role: 'Product Manager',
    initials: 'MT',
    color: 'bg-indigo-500/20 text-indigo-400',
  },
  {
    quote:
      "Got three callbacks in a week after tailoring my resume for each role. The ATS match report caught keywords I'd never have thought of.",
    name: 'Elena R.',
    role: 'Data Scientist',
    initials: 'ER',
    color: 'bg-violet-500/20 text-violet-400',
  },
  {
    quote:
      'Used this for a career pivot from backend to ML. It knew how to reframe my existing experience in a way that actually landed.',
    name: 'David K.',
    role: 'ML Engineer',
    initials: 'DK',
    color: 'bg-teal-500/20 text-teal-400',
  },
  {
    quote:
      "The single-page PDF output is perfect. Clean, ATS-safe, and I didn't have to fight with formatting for an hour.",
    name: 'Jordan M.',
    role: 'Frontend Developer',
    initials: 'JM',
    color: 'bg-sky-500/20 text-sky-400',
  },
  {
    quote:
      "Finally a resume tool that doesn't just stuff keywords. It rewrites with intent — and the before/after diff is genuinely useful.",
    name: 'Sam L.',
    role: 'Engineering Manager',
    initials: 'SL',
    color: 'bg-purple-500/20 text-purple-400',
  },
]

const MAX_INDEX = testimonials.length - VISIBLE // 3

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Measure container width and recompute card width on mount + resize
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        setCardWidth((w - GAP * (VISIBLE - 1)) / VISIBLE)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function goTo(idx: number) {
    setCurrentIndex(Math.max(0, Math.min(idx, MAX_INDEX)))
  }

  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < MAX_INDEX
  const offset = cardWidth > 0 ? currentIndex * (cardWidth + GAP) : 0

  return (
    <section id="testimonials" className="border-t border-border/60 bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display mb-3 text-3xl font-bold text-foreground">
            What our users are saying
          </h2>
          <p className="text-sm text-muted">Real results from real job seekers.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Left chevron */}
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            disabled={!canGoBack}
            aria-label="Previous testimonials"
            className="hidden flex-shrink-0 rounded-full border border-border bg-surface-2 p-2 text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-30 lg:flex"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Track */}
          <div ref={containerRef} className="flex-1 overflow-hidden">
            <div
              className="flex"
              style={{
                gap: `${GAP}px`,
                transform: `translateX(-${offset}px)`,
                transition: prefersReducedMotion ? 'none' : 'transform 300ms ease-out',
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="relative flex-none overflow-hidden rounded-xl border border-border/60 bg-surface-2 p-6 transition-all hover:border-accent/20 hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                  style={{ width: cardWidth > 0 ? `${cardWidth}px` : 'calc(33.333% - 16px)' }}
                >
                  {/* Decorative quote watermark */}
                  <Quote
                    className="absolute right-4 top-4 text-accent/15"
                    size={28}
                    aria-hidden="true"
                  />

                  {/* Stars */}
                  <div className="mb-3 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="mb-5 text-sm leading-[1.75] text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${t.color}`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right chevron */}
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={!canGoForward}
            aria-label="Next testimonials"
            className="hidden flex-shrink-0 rounded-full border border-border bg-surface-2 p-2 text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-30 lg:flex"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots — one per stop position */}
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: MAX_INDEX + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to testimonials ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-accent' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
