'use client'

import { useRouter } from 'next/navigation'
import PricingCards from '@/components/pricing/PricingCards'

export default function PublicPricingCards() {
  const router = useRouter()

  return <PricingCards onAuthRequired={() => router.push('/dashboard')} />
}
