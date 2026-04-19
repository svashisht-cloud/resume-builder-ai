'use client'

import PricingCards from '@/components/pricing/PricingCards'

interface SwitchPlanSectionProps {
  currentPlan: string
}

export default function SwitchPlanSection({ currentPlan }: SwitchPlanSectionProps) {
  function handleCTAClick(tier: 'free' | 'pack' | 'plus') {
    console.log('upgrade clicked', tier)
    // TODO: wire Stripe
    alert('Coming soon')
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display mb-6 text-lg font-semibold text-foreground">Switch Plan</h2>
      <PricingCards onCTAClick={handleCTAClick} currentPlan={currentPlan} />
    </div>
  )
}
