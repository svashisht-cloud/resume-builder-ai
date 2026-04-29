"use client";

import { useEffect, useState } from "react";
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

let cachedPayments: Payment[] | null = null;
let cachedError: string | null = null;
let pendingPaymentsRequest: Promise<Payment[]> | null = null;

export function clearPaymentHistoryCache() {
  cachedPayments = null;
  cachedError = null;
}

async function fetchPayments() {
  if (cachedPayments) return cachedPayments;
  if (pendingPaymentsRequest) return pendingPaymentsRequest;

  pendingPaymentsRequest = fetch("/api/billing/payment-history")
    .then(async (res) => {
      const data = await res.json() as { payments?: Payment[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load payment history.");
      cachedPayments = data.payments ?? [];
      cachedError = null;
      return cachedPayments;
    })
    .catch((err) => {
      cachedError = err instanceof Error ? err.message : "Failed to load payment history.";
      throw err;
    })
    .finally(() => {
      pendingPaymentsRequest = null;
    });

  return pendingPaymentsRequest;
}

function formatProduct(product: string) {
  if (product === "resume_pack") return "Resume Pack";
  if (product === "resume_pack_plus") return "Resume Pack Plus";
  if (product === "pro_monthly") return "Pro — Monthly";
  if (product === "pro_annual") return "Pro — Annual";
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
  const [fetched, setFetched] = useState(cachedPayments !== null || cachedError !== null);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(cachedPayments ?? []);
  const [error, setError] = useState<string | null>(cachedError);

  useEffect(() => {
    if (!open || fetched) return;

    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      setError(null);
      try {
        const nextPayments = await fetchPayments();
        if (!cancelled) {
          setPayments(nextPayments);
          setFetched(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payment history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPayments();

    return () => {
      cancelled = true;
    };
  }, [fetched, open]);

  function handleToggle() {
    setOpen((v) => !v);
  }

  return (
    <div className="surface-card-quiet rounded-2xl">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-colors hover:bg-surface-raised/50 sm:px-6 sm:py-5"
      >
        <div className="flex items-center gap-2">
          <Receipt size={15} className="text-muted" />
          <span className="font-display text-base font-semibold text-foreground">
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
        <div className="border-t border-border/60 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
              Loading…
            </div>
          )}

          {error && (
            <p className="text-sm text-danger-fg">{error}</p>
          )}

          {!loading && !error && payments.length === 0 && (
            <p className="text-sm text-muted">No purchases yet.</p>
          )}

          {!loading && !error && payments.length > 0 && (
            <ul className="space-y-3">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/40 bg-background/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatProduct(p.product)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(p.paid_at)}{p.credits_granted > 0 ? ` · ${p.credits_granted} credit${p.credits_granted !== 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-shrink-0 sm:flex-col sm:items-end sm:gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {formatAmount(p.amount_cents, p.currency)}
                    </span>
                    {p.status !== "succeeded" && (
                      <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger-fg">
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
