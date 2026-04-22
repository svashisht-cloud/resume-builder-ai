'use client'

import { useRouter } from 'next/navigation'
import PricingCards from '@/components/pricing/PricingCards'

export default function PublicPricingCards() {
  const router = useRouter()

  // Authenticated users land on /dashboard; middleware redirects unauthenticated users to /
  return <PricingCards onCTAClick={() => router.push('/dashboard')} />
}
