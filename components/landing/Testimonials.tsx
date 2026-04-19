'use client'

import { useRef, useState } from 'react'

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
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('[data-card]') as HTMLElement | null
    if (!card) return
    const cardWidth = card.offsetWidth + 16 // gap-4
    track.scrollBy({ left: direction * cardWidth, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('[data-card]') as HTMLElement | null
    if (!card) return
    const cardWidth = card.offsetWidth + 16
    const idx = Math.round(track.scrollLeft / cardWidth)
    setActiveIndex(Math.min(idx, testimonials.length - 1))
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
            aria-label="Previous testimonials"
            className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-surface-raised p-2 text-muted transition-colors hover:border-accent hover:text-accent lg:flex"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Track */}
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                data-card
                className="min-w-[340px] max-w-[380px] flex-shrink-0 snap-start rounded-xl border border-border bg-surface p-6"
              >
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
          </div>

          {/* Right chevron */}
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Next testimonials"
            className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-surface-raised p-2 text-muted transition-colors hover:border-accent hover:text-accent lg:flex"
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
              onClick={() => {
                const track = trackRef.current
                const card = track?.querySelector('[data-card]') as HTMLElement | null
                if (!track || !card) return
                const cardWidth = card.offsetWidth + 16
                track.scrollTo({ left: i * cardWidth, behavior: reducedMotion ? 'instant' : 'smooth' })
              }}
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
