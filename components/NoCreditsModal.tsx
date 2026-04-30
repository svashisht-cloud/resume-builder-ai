"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Sparkles, Coins } from "lucide-react";

interface NoCreditsModalProps {
  open: boolean;
  onDismiss: () => void;
}

export default function NoCreditsModal({ open, onDismiss }: NoCreditsModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  if (!open) return null;

  function handleGoToBilling(highlight: string) {
    onDismiss();
    router.push(`/settings?section=billing&highlight=${highlight}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-credits-title"
    >
      <div
        className="shadow-elevated relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="mb-2 flex items-start justify-between gap-4">
            <h2
              id="no-credits-title"
              className="font-display text-xl font-bold text-foreground"
            >
              You&rsquo;re out of credits
            </h2>
            <button
              onClick={onDismiss}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface-raised text-muted transition-colors hover:bg-border hover:text-foreground"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mb-5 text-sm leading-6 text-muted">
            Choose how you&rsquo;d like to continue tailoring.
          </p>

          {/* Two-path cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Pro card */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-accent/40 bg-accent/5">
              <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-accent" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Pro Plan</p>
                </div>
                <p className="font-display text-3xl leading-none tracking-tight text-foreground">
                  $12<span className="text-sm font-normal tracking-normal text-muted"> / month</span>
                </p>
                <p className="mt-1 text-sm text-muted">or $79/yr — save ~45%</p>

                <ul className="mt-4 flex-1 space-y-2">
                  {[
                    "Unlimited tailored resumes",
                    "Unlimited regenerations",
                    "Resume styling & PDF/DOCX export",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm leading-5 text-muted">
                      <Check size={13} className="mt-0.5 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleGoToBilling("pro")}
                  className="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent-hover text-sm font-semibold text-accent-foreground shadow-accent-soft transition-all hover:opacity-95 active:scale-[0.98]"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>

            {/* Credits card */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-surface-raised/40">
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-1.5">
                  <Coins size={12} className="text-muted" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Pay as you go</p>
                </div>
                <p className="font-display text-3xl leading-none tracking-tight text-foreground">
                  from $9
                </p>
                <p className="mt-1 text-sm text-muted">one-time · no subscription</p>

                <ul className="mt-4 flex-1 space-y-2">
                  <li className="flex items-center justify-between rounded-lg border border-border/50 bg-surface px-3 py-2.5 text-sm">
                    <span className="font-medium text-foreground">3 credits</span>
                    <span className="font-bold text-accent">$9</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border border-border/50 bg-surface px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">10 credits</span>
                      <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">Best value</span>
                    </div>
                    <span className="font-bold text-accent">$19</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleGoToBilling("credits")}
                  className="mt-5 flex h-10 w-full items-center justify-center rounded-lg border border-border/60 text-sm font-semibold text-foreground transition-colors hover:border-border hover:bg-surface-raised active:scale-[0.98]"
                >
                  Buy credits
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={onDismiss}
              className="text-sm text-text-dim transition-colors hover:text-muted"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
