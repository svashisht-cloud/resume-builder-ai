"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Receipt } from "lucide-react";

interface Payment {
  id: string;
  product: string;
  amount_cents: number;
  currency: string;
  credits_granted: number;
  status: string;
  paid_at: string;
}

function formatProduct(product: string) {
  if (product === "resume_pack") return "Resume Pack";
  if (product === "resume_pack_plus") return "Resume Pack Plus";
  return product;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PaymentHistory() {
  const [open, setOpen] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    if (!open && !fetched) {
      setLoading(true);
      try {
        const res = await fetch("/api/billing/payment-history");
        const data = await res.json() as { payments?: Payment[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to load payment history.");
        setPayments(data.payments ?? []);
        setFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    }
    setOpen((v) => !v);
  }

  return (
    <div className="rounded-xl border border-border/60 bg-surface">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-surface-raised/50 rounded-xl"
      >
        <div className="flex items-center gap-2">
          <Receipt size={15} className="text-muted" />
          <span className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Payment History
          </span>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-muted" />
        ) : (
          <ChevronDown size={15} className="text-muted" />
        )}
      </button>

      {open && (
        <div className="border-t border-border/60 px-6 pb-6 pt-5">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
              Loading…
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {!loading && !error && payments.length === 0 && (
            <p className="text-sm text-muted">No purchases yet.</p>
          )}

          {!loading && !error && payments.length > 0 && (
            <ul className="space-y-3">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-background/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatProduct(p.product)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(p.paid_at)} · {p.credits_granted} credit{p.credits_granted !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {formatAmount(p.amount_cents, p.currency)}
                    </span>
                    {p.status !== "succeeded" && (
                      <span className="rounded-full bg-red-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                        {p.status}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
