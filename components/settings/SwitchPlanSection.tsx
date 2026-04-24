'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PricingCards from '@/components/pricing/PricingCards'
import { createClient } from '@/lib/supabase/client'

type PlanType = 'free' | 'pro_monthly' | 'pro_annual'

export default function SwitchPlanSection() {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')
  const [cancellationScheduled, setCancellationScheduled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('profiles')
        .select('plan_type, plan_status, plan_current_period_end')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const pt = data?.plan_type as string | null | undefined
          const ps = data?.plan_status as string | null | undefined
          const pe = data?.plan_current_period_end as string | null | undefined
          const stillInPeriod = pe ? new Date(pe) > new Date() : false

          if ((pt === 'pro_monthly' || pt === 'pro_annual') && (ps === 'active' || (ps === 'cancelled' && stillInPeriod))) {
            setCurrentPlan(pt as PlanType)
            setCancellationScheduled(ps === 'cancelled')
          } else {
            setCurrentPlan('free')
            setCancellationScheduled(false)
          }
          setLoading(false)
        })
    })
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-surface p-6 text-sm text-muted">
        Loading plan…
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6">
      <h2 className="font-display mb-6 text-lg font-semibold text-foreground">Manage Plan</h2>
      <PricingCards currentPlan={currentPlan} cancellationScheduled={cancellationScheduled} stacked />
      <p className="mt-4 text-center text-xs text-text-dim">
        <Link
          href="/refund-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          View refund policy
        </Link>
      </p>
    </div>
  )
}
