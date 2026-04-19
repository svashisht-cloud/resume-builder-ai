'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
    <nav className="z-10 flex-shrink-0 border-b border-border bg-background backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-foreground">MockLoop</span>
          <span className="text-lg font-light text-muted">Resume Builder</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised text-sm font-semibold text-foreground transition-colors hover:border-accent"
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
            <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-border bg-surface shadow-xl">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.display_name ?? 'User'}
                </p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setOpen(false); router.push('/settings') }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
                >
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
                >
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
