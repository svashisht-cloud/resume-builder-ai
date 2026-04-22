import type { ReactNode } from 'react'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        {children}
      </main>
      <Footer />
    </>
  )
}
