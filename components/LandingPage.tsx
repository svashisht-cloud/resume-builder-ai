'use client'

import { useState } from 'react'
import AuthModal from './AuthModal'
import Testimonials from './landing/Testimonials'
import HeroTrailer from './landing/HeroTrailer'
import PricingCards from './pricing/PricingCards'

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  function openModal() {
    setIsModalOpen(true)
  }

  function scrollToHowItWorks() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-bold text-foreground">MockLoop</span>
            <span className="text-lg font-light text-muted">Resume Builder</span>
          </div>
          <button
            onClick={openModal}
            className="rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[45%_55%]">
          {/* Left: copy + CTAs */}
          <div>
            <h1 className="font-display mb-4 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Tailor your resume to any job in seconds
            </h1>
            <p className="mb-10 max-w-xl text-lg text-muted">
              Paste your resume and a job description. Get a tailored, ATS-optimized version instantly — with a diff showing exactly what changed.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={openModal}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
              >
                Get Started Free
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                See How It Works
              </button>
            </div>
          </div>
          {/* Right: animated product trailer */}
          <HeroTrailer />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display mb-12 text-center text-2xl font-bold text-foreground">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Paste Your Resume',
                description: 'Drop in your existing resume as plain text',
              },
              {
                step: '2',
                title: 'Add a Job Description',
                description: 'Paste the JD for the role you\'re targeting',
              },
              {
                step: '3',
                title: 'Get Your Tailored Resume',
                description: 'AI rewrites your resume to match, with a diff view showing every change',
              },
            ].map(({ step, title, description }) => (
              <div
                key={step}
                className="rounded-xl border border-border bg-surface-2 p-6"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-background">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display mb-12 text-center text-2xl font-bold text-foreground">Pricing</h2>
          <PricingCards onCTAClick={() => openModal()} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm text-muted">MockLoop Resume Builder</span>
          <div className="flex gap-6 text-sm text-muted">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
