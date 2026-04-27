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
      <section className="relative mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl items-center overflow-hidden px-6 py-12 sm:py-14 lg:py-16">
        {/* Radial glow behind content */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[200px] w-[200px] rounded-full bg-accent/5 blur-3xl sm:h-[500px] sm:w-[500px]" />
        <div className="pointer-events-none absolute -top-20 right-1/4 h-[150px] w-[150px] rounded-full bg-accent-secondary/5 blur-3xl sm:h-[400px] sm:w-[400px]" />

        <div className="relative grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[8.6fr_11.4fr] lg:gap-14">
          {/* Left: copy + CTAs */}
          <div className="max-w-[34rem]">
            <div className="landing-kicker mb-5">AI-powered tailoring</div>
            <h1 className="font-display mb-4 text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]">
              Tailor your resume to{' '}
              <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                any job in seconds
              </span>
            </h1>
            <p className="mb-4 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-relaxed">
              Paste your resume and a job description. Get a tailored, ATS-optimized version
              instantly, with a diff showing exactly what changed.
            </p>
            <p className="mb-8 text-sm font-medium text-foreground/80">
              Evidence-grounded rewriting only. No invented experience, titles, or metrics.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={openModal}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:shadow-accent-strong hover:opacity-95 active:scale-[0.98]"
              >
                Get Started Free
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="rounded-2xl border border-border bg-surface-raised px-6 py-3.5 text-sm font-medium text-muted transition-all hover:border-border/80 hover:text-foreground"
              >
                See How It Works
              </button>
            </div>
            <div className="landing-panel-quiet mt-8 rounded-[1.75rem] p-4 sm:p-5">
              <div className="grid grid-cols-3 gap-1 border-b border-border/50 pb-4 min-[380px]:gap-2">
                <span className="inline-flex min-w-0 items-center justify-center gap-0.5 whitespace-nowrap rounded-full border border-border/50 bg-surface/70 px-1 py-1.5 text-[9px] text-muted min-[360px]:gap-1 min-[360px]:px-1.5 min-[360px]:text-[10px] sm:gap-1.5 sm:px-3 sm:text-xs">
                  <CheckCircle2 size={11} className="text-success min-[360px]:h-[13px] min-[360px]:w-[13px]" />
                  No credit card
                </span>
                <span className="inline-flex min-w-0 items-center justify-center gap-0.5 whitespace-nowrap rounded-full border border-border/50 bg-surface/70 px-1 py-1.5 text-[9px] text-muted min-[360px]:gap-1 min-[360px]:px-1.5 min-[360px]:text-[10px] sm:gap-1.5 sm:px-3 sm:text-xs">
                  <CheckCircle2 size={11} className="text-success min-[360px]:h-[13px] min-[360px]:w-[13px]" />
                  Cancel anytime
                </span>
                <span className="inline-flex min-w-0 items-center justify-center gap-0.5 whitespace-nowrap rounded-full border border-border/50 bg-surface/70 px-1 py-1.5 text-[9px] text-muted min-[360px]:gap-1 min-[360px]:px-1.5 min-[360px]:text-[10px] sm:gap-1.5 sm:px-3 sm:text-xs">
                  <Zap size={11} className="text-accent min-[360px]:h-[13px] min-[360px]:w-[13px]" />
                  Instant results
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
                  <p className="text-xl font-bold text-foreground">12k+</p>
                  <p className="mt-1 text-xs text-muted">Users</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
                  <p className="text-xl font-bold text-foreground">94%</p>
                  <p className="mt-1 text-xs text-muted">Pass rate</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
                  <p className="text-xl font-bold text-foreground">30s</p>
                  <p className="mt-1 text-xs text-muted">Avg time</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right: interactive product preview */}
          <div className="lg:pl-4">
            <InteractiveHeroPreview />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative border-t border-border/50 bg-surface/70 py-16 md:py-24">
        <div className="landing-section-glow" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="landing-eyebrow mb-4">How it works</div>
            <h2 className="font-display mb-3 text-3xl font-bold text-foreground sm:text-[2.15rem]">
              A recruiter-safe workflow built around your original resume
            </h2>
            <p className="text-sm leading-6 text-muted sm:text-base">
              Three steps, one review loop, and no formatting cleanup. The product reads the job,
              rewrites only from your evidence, and shows the fit improvement before you export.
            </p>
          </div>
          <div className="mb-12 grid items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
            <div className="landing-panel-quiet rounded-[2rem] p-3 sm:p-4">
              <HeroTrailer />
            </div>
            <div className="landing-panel rounded-[2rem] p-6 sm:p-8">
              <h3 className="font-display text-3xl font-bold leading-tight text-foreground">
                Your resume, tailored to the job, in 30 seconds
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">
                Paste your resume and the job description. The AI reads the requirements, finds your
                gaps, and rewrites your bullets using only what you actually wrote.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  'Your original resume is the only source. No experience is invented.',
                  'Keywords and skills from the job description get woven in naturally.',
                  'See a before-and-after ATS score and a diff of every change. You stay in control.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/75 px-4 py-3.5">
                    <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/12 text-[10px] font-bold text-accent">
                      ✓
                    </span>
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                icon: <Upload className="text-accent" size={24} />,
                step: '01',
                title: 'Upload your resume',
                description:
                  'PDF, DOCX, or plain text. Drop it in. We parse every section automatically, so nothing gets lost or misformatted.',
              },
              {
                icon: <Target className="text-accent" size={24} />,
                step: '02',
                title: 'Add a job description',
                description:
                  "Paste the job listing directly. Even a rough copy works. We read the requirements, keywords, and tech stack to find your gaps.",
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
                className="landing-panel-quiet group flex h-full flex-col overflow-hidden rounded-[1.75rem] p-6 sm:p-7"
              >
                {/* Step number watermark */}
                <span className="absolute right-4 top-3 font-display text-6xl font-bold text-border/45 select-none">
                  {step}
                </span>
                <div className="mb-4 inline-flex w-fit items-center rounded-full border border-border/60 bg-surface/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Step {step}
                </div>
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 transition-colors group-hover:border-accent/40 group-hover:bg-accent/15">
                  {icon}
                </div>
                <h3 className="font-display mb-3 text-[1.08rem] font-semibold leading-6 text-foreground">{title}</h3>
                <p className="text-sm leading-6 text-muted">{description}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Pricing */}
      <section className="relative border-t border-border/50 py-16 md:py-24">
        <div className="landing-section-glow" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="landing-eyebrow mb-4">Pricing</div>
            <h2 className="font-display mb-3 text-3xl font-bold text-foreground sm:text-[2.1rem]">
              Start free, then scale into the workflow that matches your search
            </h2>
            <p className="text-sm leading-6 text-muted sm:text-base">
              Try the full experience first. Upgrade only when you need higher volume or a faster
              job-search loop.
            </p>
          </div>
          <div className="mx-auto max-w-5xl">
            <PricingCards onAuthRequired={() => openModal()} />
          </div>
        </div>
      </section>

      <Footer />

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
