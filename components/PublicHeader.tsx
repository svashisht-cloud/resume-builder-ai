'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sora } from 'next/font/google'
import AuthModal from '@/components/AuthModal'

const sora = Sora({ subsets: ['latin'], weight: ['600'] })

export default function PublicHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="Forte home" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <span className={`${sora.className} text-xl font-semibold tracking-tight text-foreground`}>forte</span>
            <span className="text-border/60 select-none">/</span>
            <span className="text-m font-medium text-muted">resume builder</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg border border-accent/60 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-all hover:bg-accent/20 hover:border-accent"
          >
            Sign In
          </button>
        </div>
      </nav>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
