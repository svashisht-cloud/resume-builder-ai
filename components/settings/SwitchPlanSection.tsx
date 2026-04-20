'use client'

import { useState } from 'react'
import PricingCards from '@/components/pricing/PricingCards'
import { X, Check } from 'lucide-react'

interface SwitchPlanSectionProps {
  currentPlan?: string
}

export default function SwitchPlanSection({ currentPlan }: SwitchPlanSectionProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null)

  async function handleCTAClick(tier: 'free' | 'pack' | 'plus') {
    if (tier === 'free') return

    setPurchasing(tier)
    setToast(null)

    try {
      const res = await fetch('/api/billing/mock-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: tier === 'pack' ? 'resume_pack' : 'resume_pack_plus' }),
      })
      const data = await res.json() as { success?: boolean; error?: string }

      if (res.ok) {
        const count = tier === 'pack' ? 3 : 10
        setToast({ message: `${count} credits added to your account`, ok: true })
      } else {
        setToast({ message: data.error ?? 'Purchase failed', ok: false })
      }
    } catch {
      setToast({ message: 'Network error — please try again.', ok: false })
    } finally {
      setPurchasing(null)
      setTimeout(() => setToast(null), 5000)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display mb-4 text-lg font-semibold text-foreground">Switch Plan</h2>

      {toast && (
        <div className={`mb-4 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm ${
          toast.ok
            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
            : 'border-red-500/30 bg-red-950/20 text-red-400'
        }`}>
          {toast.ok ? <Check size={14} className="flex-shrink-0" /> : <X size={14} className="flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <PricingCards
        onCTAClick={handleCTAClick}
        currentPlan={currentPlan}
        loadingTier={purchasing}
      />
    </div>
  )
}
