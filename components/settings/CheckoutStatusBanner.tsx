"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PlanType = "free" | "pro_monthly" | "pro_annual";

interface CheckoutStatusBannerProps {
  userId: string;
  initialPlanType: string | null | undefined;
  initialPlanStatus: string | null | undefined;
  initialPeriodEnd: string | null | undefined;
  initialCreditsRemaining: number;
}

function hasProAccess(
  planType: string | null | undefined,
  planStatus: string | null | undefined,
  periodEnd: string | null | undefined,
) {
  const stillInPeriod = periodEnd ? new Date(periodEnd) > new Date() : false;
  return (
    (planType === "pro_monthly" || planType === "pro_annual") &&
    (planStatus === "active" ||
      (planStatus === "cancelled" && stillInPeriod) ||
      (planStatus === "past_due" && stillInPeriod))
  );
}

export default function CheckoutStatusBanner({
  userId,
  initialPlanType,
  initialPlanStatus,
  initialPeriodEnd,
  initialCreditsRemaining,
}: CheckoutStatusBannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const isSubscriptionFlow = searchParams.get("type") === "subscription";
  const [state, setState] = useState<"syncing" | "pending">("syncing");

  useEffect(() => {
    if (checkout !== "success") return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;
    const supabase = createClient();

    const poll = async () => {
      attempts += 1;

      const { data, error } = await supabase
        .from("profiles")
        .select("plan_type, plan_status, plan_current_period_end, credits_remaining")
        .eq("id", userId)
        .single();

      if (!cancelled && !error) {
        const planType = data?.plan_type as PlanType | null | undefined;
        const planStatus = data?.plan_status as string | null | undefined;
        const periodEnd = data?.plan_current_period_end as string | null | undefined;
        const creditsRemaining = data?.credits_remaining ?? 0;

        const subscriptionConfirmed =
          isSubscriptionFlow && hasProAccess(planType, planStatus, periodEnd);
        const creditsConfirmed =
          !isSubscriptionFlow && creditsRemaining > initialCreditsRemaining;
        const planChanged =
          initialPlanType !== planType ||
          initialPlanStatus !== planStatus ||
          initialPeriodEnd !== periodEnd;

        if (subscriptionConfirmed || creditsConfirmed || planChanged) {
          router.replace("/settings");
          router.refresh();
          return;
        }
      }

      if (attempts >= maxAttempts) {
        if (!cancelled) setState("pending");
        return;
      }

      if (!cancelled) {
        window.setTimeout(poll, 1500);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [
    checkout,
    initialCreditsRemaining,
    initialPeriodEnd,
    initialPlanStatus,
    initialPlanType,
    isSubscriptionFlow,
    router,
    userId,
  ]);

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
            Payment received. Finalizing your {isSubscriptionFlow ? "plan" : "credits"}...
          </span>
        </div>
      ) : (
        <p>
          Payment was submitted, but confirmation is still pending. Refresh in a moment if your
          account has not updated yet.
        </p>
      )}
    </div>
  );
}
