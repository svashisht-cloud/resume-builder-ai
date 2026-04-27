'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Upload, Target, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import AuthModal from './AuthModal'
import Testimonials from './landing/Testimonials'
import HeroTrailer from './landing/HeroTrailer'
import InteractiveHeroPreview from './landing/InteractiveHeroPreview'
import TiltCard from './landing/TiltCard'
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
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-app-glass backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`${sora.className} text-xl font-semibold tracking-tight text-foreground`}>forte</span>
            <span className="text-border/60 select-none">/</span>
            <span className="text-sm font-medium text-muted">resume builder</span>
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
      <section className="relative mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl items-center overflow-hidden px-6 py-10 sm:py-12 lg:py-14">
        {/* Radial glow behind content */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[200px] w-[200px] rounded-full bg-accent/5 blur-3xl sm:h-[500px] sm:w-[500px]" />
        <div className="pointer-events-none absolute -top-20 right-1/4 h-[150px] w-[150px] rounded-full bg-accent-secondary/5 blur-3xl sm:h-[400px] sm:w-[400px]" />

        <div className="relative grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[9fr_11fr] lg:gap-14">
          {/* Left: copy + CTAs */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">AI-powered tailoring</span>
            </div>
            <h1 className="font-display mb-4 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              Tailor your resume to{' '}
              <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                any job in seconds
              </span>
            </h1>
            <p className="mb-8 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-relaxed">
              Paste your resume and a job description. Get a tailored, ATS-optimized version instantly — with a diff showing exactly what changed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={openModal}
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-hover px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:shadow-accent-strong hover:opacity-95 active:scale-[0.98]"
              >
                Get Started Free
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="rounded-xl border border-border bg-surface-raised px-6 py-3.5 text-sm font-medium text-muted transition-all hover:border-border/80 hover:text-foreground"
              >
                See How It Works
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted sm:text-sm">
                <CheckCircle2 size={13} className="flex-shrink-0 text-success" />
                No credit card
              </span>
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted sm:text-sm">
                <CheckCircle2 size={13} className="flex-shrink-0 text-success" />
                Cancel anytime
              </span>
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted sm:text-sm">
                <Zap size={13} className="flex-shrink-0 text-accent" />
                Instant results
              </span>
            </div>
            <div className="mt-7 flex items-center gap-5 border-t border-border/40 pt-5 sm:gap-6">
              <div>
                <p className="text-xl font-bold text-foreground">12k+</p>
                <p className="text-xs text-muted">Users</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div>
                <p className="text-xl font-bold text-foreground">94%</p>
                <p className="text-xs text-muted">Pass rate</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div>
                <p className="text-xl font-bold text-foreground">30s</p>
                <p className="text-xs text-muted">Avg time</p>
              </div>
            </div>
          </div>
          {/* Right: interactive product preview */}
          <InteractiveHeroPreview />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border/50 bg-surface/70 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-3 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-sm text-muted">Three steps. No reformatting. Under 60 seconds.</p>
          </div>
          <div className="mb-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
            <HeroTrailer />
            <div className="surface-card-quiet rounded-[1.875rem] p-6 sm:p-8">
              <h3 className="font-display text-3xl font-bold leading-tight text-foreground">
                Your resume, tailored to the job — in 30 seconds
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                Paste your resume and the job description. The AI reads the requirements, finds your
                gaps, and rewrites your bullets — using only what you actually wrote.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  'Your original resume is the only source. No experience is invented.',
                  'Keywords and skills from the job description get woven in naturally.',
                  'See a before/after ATS score and a diff of every change — you stay in control.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-surface/80 px-4 py-3.5">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: <Upload className="text-accent" size={24} />,
                step: '01',
                title: 'Upload your resume',
                description:
                  'PDF, DOCX, or plain text — drop it in. We parse every section automatically, so nothing gets lost or misformatted.',
              },
              {
                icon: <Target className="text-accent" size={24} />,
                step: '02',
                title: 'Add a job description',
                description:
                  "Paste the job listing directly — even a rough copy works. We read the requirements, keywords, and tech stack to find your gaps.",
              },
              {
                icon: <Sparkles className="text-accent" size={24} />,
                step: '03',
                title: 'Get your tailored resume',
                description:
                  'In under 30 seconds, get a rewritten resume with a diff of every change, your new ATS match score, and one-click PDF or DOCX export.',
              },
            ].map(({ icon, step, title, description }) => (
              <TiltCard
                key={step}
                className="surface-card-quiet group flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-[box-shadow,border-color] duration-300 hover:border-accent/30 hover:shadow-accent-soft sm:p-7"
              >
                {/* Step number watermark */}
                <span className="absolute right-4 top-3 font-display text-5xl font-bold text-border/60 select-none">
                  {step}
                </span>
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 transition-colors group-hover:border-accent/40 group-hover:bg-accent/15">
                  {icon}
                </div>
                <h3 className="font-display mb-2 text-[1.05rem] font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-6 text-muted">{description}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Pricing */}
      <section className="border-t border-border/50 py-12 md:py-20">
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
