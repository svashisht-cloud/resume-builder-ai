"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

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

  function handleViewPlans() {
    onDismiss();
    router.push("/settings");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-credits-title"
    >
      <div
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
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

          <p className="mb-6 text-sm leading-6 text-muted">
            Purchase a credit pack to keep tailoring resumes. Each credit covers one full tailored
            generation including ATS report and export.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleViewPlans}
              className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent-secondary text-sm font-semibold text-background shadow-[0_2px_12px_rgba(255,31,78,0.25)] transition-all hover:opacity-95 active:scale-[0.98]"
            >
              View plans
            </button>
            <button
              onClick={onDismiss}
              className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border/60 text-sm font-semibold text-muted transition-colors hover:border-border hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
