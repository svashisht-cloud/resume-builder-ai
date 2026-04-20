'use client'

import { createClient } from '@/lib/supabase/client'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
      onClick={onClose}
    >
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(6,182,212,0.08)] transition-[opacity,transform] duration-[250ms] ease-out motion-reduce:transition-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="mb-6 text-center">
            <div className="mb-3 flex justify-center">
              <span className="font-display bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-xl font-bold text-transparent">
                MockLoop
              </span>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted">Sign in to tailor your resume</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.98]"
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-5 text-center text-xs text-text-dim">
            By signing in you agree to our{' '}
            <a href="#" className="text-muted underline underline-offset-2 transition-colors hover:text-foreground">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
