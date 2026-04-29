"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";

type CheckoutType = "subscription" | "credits";
type CheckoutStatus = "confirmed" | "pending" | "not_found";

export default function CheckoutStatusBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const checkoutType = searchParams.get("type") as CheckoutType | null;
  const product = searchParams.get("product");
  const startedAt = searchParams.get("started_at");
  const [state, setState] = useState<"syncing" | "pending">("syncing");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (checkout !== "success") return;

    if (
      (checkoutType !== "subscription" && checkoutType !== "credits") ||
      !product ||
      !startedAt
    ) {
      setState("pending");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;
    let timeoutId: number | undefined;

    const poll = async () => {
      attempts += 1;

      try {
        const params = new URLSearchParams({
          type: checkoutType,
          product,
          started_at: startedAt,
        });
        const res = await fetch(`/api/billing/checkout-status?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Verification request failed.");
        }

        const data = (await res.json()) as { status?: CheckoutStatus };
        if (!cancelled && data.status === "confirmed") {
          router.replace("/settings?section=billing");
          router.refresh();
          return;
        }

        if (!cancelled && data.status === "not_found") {
          setState("pending");
          return;
        }
      } catch {
        // Keep polling for transient network or webhook delays.
      }

      if (attempts >= maxAttempts) {
        if (!cancelled) setState("pending");
        return;
      }

      if (!cancelled) {
        timeoutId = window.setTimeout(poll, 1500);
      }
    };

    setState("syncing");
    poll();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [checkout, checkoutType, product, startedAt, retryKey, router]);

  if (checkout !== "success") return null;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        state === "syncing"
          ? "border-accent/30 bg-accent/10 text-foreground"
          : "border-warning-border bg-warning-bg text-warning-fg"
      }`}
    >
      {state === "syncing" ? (
        <div className="flex items-center gap-2">
          <LoaderCircle size={16} className="animate-spin text-accent" />
          <span>
            Payment received. Finalizing your {checkoutType === "subscription" ? "plan" : "credits"}...
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Confirmation is taking longer than expected. Your payment may still settle, but this
            page could not verify the update automatically yet.
          </p>
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-warning-border/80 bg-background/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-background"
          >
            <RefreshCw size={14} />
            Retry check
          </button>
        </div>
      )}
    </div>
  );
}
