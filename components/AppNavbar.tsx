'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Settings, LogOut } from 'lucide-react'

interface AppNavbarUser {
  display_name: string | null
  email: string | null
  avatar_url: string | null
}

interface AppNavbarProps {
  user: AppNavbarUser
}

export default function AppNavbar({ user }: AppNavbarProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  const initial = user.display_name?.[0] ?? user.email?.[0] ?? '?'

  return (
    <nav className="z-10 flex-shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-baseline gap-1.5 transition-opacity hover:opacity-80"
        >
          <span className="font-display bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-lg font-bold text-transparent">
            MockLoop
          </span>
          <span className="text-lg font-light text-muted">Resume Builder</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised text-sm font-semibold text-foreground transition-all hover:border-accent/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            aria-label="Account menu"
          >
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="Avatar"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              initial.toUpperCase()
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border/80 bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
              <div className="border-b border-border/60 px-4 py-3">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.display_name ?? 'User'}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setOpen(false); router.push('/settings') }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
                >
                  <Settings size={14} className="text-muted" />
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
                >
                  <LogOut size={14} className="text-muted" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
