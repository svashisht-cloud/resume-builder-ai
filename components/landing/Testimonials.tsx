'use client'

import { useRef, useState } from 'react'
import { Star, Quote } from 'lucide-react'

const CARD_WIDTH = 340
const GAP = 24 // gap-6

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

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * (CARD_WIDTH + GAP), behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    const idx = Math.round(track.scrollLeft / (CARD_WIDTH + GAP))
    setActiveIndex(Math.min(idx, testimonials.length - 1))
    setAtStart(track.scrollLeft <= 4)
    setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 4)
  }

  function scrollToIndex(i: number) {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: i * (CARD_WIDTH + GAP), behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  return (
    <section id="testimonials" className="border-t border-border bg-surface py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display mb-12 text-center text-2xl font-bold text-foreground">
          What our users are saying
        </h2>

        <div className="relative">
          {/* Left chevron */}
          <button
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            aria-label="Previous testimonials"
            className="absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-surface-raised p-2 text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-30 lg:flex"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Track — overflow-hidden wrapper so cards don't spill out */}
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="relative w-[340px] flex-none snap-start overflow-hidden rounded-xl border border-border bg-surface p-6"
                >
                  {/* Decorative quote watermark */}
                  <Quote
                    className="absolute right-4 top-4 text-accent/20"
                    size={32}
                    aria-hidden="true"
                  />

                  {/* Stars */}
                  <div className="mb-3 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="mb-6 text-sm leading-7 text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.color}`}
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
              {/* Phantom spacer so last card doesn't get cut off */}
              <div className="w-1 flex-none" aria-hidden="true" />
            </div>
          </div>

          {/* Right chevron */}
          <button
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            aria-label="Next testimonials"
            className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-surface-raised p-2 text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-default disabled:opacity-30 lg:flex"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 bg-accent' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
