'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Upload, Target, Sparkles, ArrowRight } from 'lucide-react'
import AuthModal from './AuthModal'
import Testimonials from './landing/Testimonials'
import HeroTrailer from './landing/HeroTrailer'
import PricingCards from './pricing/PricingCards'
import Footer from './Footer'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], weight: ['600'] })

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
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`${sora.className} text-xl font-semibold tracking-tight text-foreground`}>forte</span>
            <span className="text-border/60 select-none">/</span>
            <span className="text-m font-medium text-muted">resume builder</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <button
              onClick={openModal}
              className="rounded-lg border border-accent/60 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/20 hover:border-accent"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 py-12 sm:py-20">
        {/* Radial glow behind content */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[200px] w-[200px] rounded-full bg-accent/5 blur-3xl sm:h-[500px] sm:w-[500px]" />
        <div className="pointer-events-none absolute -top-20 right-1/4 h-[150px] w-[150px] rounded-full bg-accent-secondary/5 blur-3xl sm:h-[400px] sm:w-[400px]" />

        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[9fr_11fr]">
          {/* Left: copy + CTAs */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">AI-powered tailoring</span>
            </div>
            <h1 className="font-display mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              Tailor your resume to{' '}
              <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                any job in seconds
              </span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted">
              Paste your resume and a job description. Get a tailored, ATS-optimized version instantly — with a diff showing exactly what changed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={openModal}
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-6 py-3 text-sm font-semibold text-background shadow-[0_4px_20px_rgba(255,31,78,0.3)] transition-all hover:shadow-[0_4px_28px_rgba(255,31,78,0.45)] hover:opacity-95 active:scale-[0.98]"
              >
                Get Started Free
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="rounded-xl border border-border bg-surface-raised px-6 py-3 text-sm font-medium text-muted transition-all hover:border-border/80 hover:text-foreground"
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
      <section id="how-it-works" className="border-t border-border/60 bg-surface py-12 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-3 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-sm text-muted">From paste to polished in under a minute.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: <Upload className="text-accent" size={24} />,
                step: '01',
                title: 'Upload your resume',
                description:
                  "Drop in your existing resume as a PDF or paste it as plain text. We'll parse every section — experience, skills, education — so nothing gets lost.",
              },
              {
                icon: <Target className="text-accent" size={24} />,
                step: '02',
                title: 'Add a job description',
                description:
                  "Paste the JD for the role you're targeting. Requirements, responsibilities, and tech stack all feed into the tailoring engine.",
              },
              {
                icon: <Sparkles className="text-accent" size={24} />,
                step: '03',
                title: 'Get your tailored resume',
                description:
                  'Receive a rewritten resume with a diff showing what changed and why — plus an ATS match score and one-click PDF export.',
              },
            ].map(({ icon, step, title, description }) => (
              <div
                key={step}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-surface-2 p-6 transition-all hover:border-accent/30 hover:shadow-[0_4px_24px_rgba(255,31,78,0.08)]"
              >
                {/* Step number watermark */}
                <span className="absolute right-4 top-3 font-display text-5xl font-bold text-border/60 select-none">
                  {step}
                </span>
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 transition-colors group-hover:border-accent/40 group-hover:bg-accent/15">
                  {icon}
                </div>
                <h3 className="font-display mb-2 text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Pricing */}
      <section className="border-t border-border/60 py-12 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-3 text-3xl font-bold text-foreground">Pricing</h2>
            <p className="text-sm text-muted">Start for free. No credit card required.</p>
          </div>
          <PricingCards onAuthRequired={() => openModal()} />
        </div>
      </section>

      <Footer />

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
