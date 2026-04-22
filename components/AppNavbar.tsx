'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Settings, LogOut, Monitor, Sun, Moon } from 'lucide-react'
import { Sora } from 'next/font/google'
import { useTheme, type Theme } from '@/components/ThemeProvider'

const sora = Sora({ subsets: ['latin'], weight: ['600'] })

interface AppNavbarUser {
  display_name: string | null
  email: string | null
  avatar_url: string | null
}

interface AppNavbarProps {
  user: AppNavbarUser
  credits?: number
}

const themeOrder: Theme[] = ['dark', 'light', 'system']

export default function AppNavbar({ user, credits }: AppNavbarProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  function cycleTheme() {
    const next = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
    setTheme(next)
  }

  const ThemeIcon = theme === 'light' ? Sun : theme === 'system' ? Monitor : Moon

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
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className={`${sora.className} text-xl font-semibold tracking-tight text-foreground`}>forte</span>
          <span className="text-border/60 select-none">/</span>
          <span className="text-m font-medium text-muted">resume builder</span>
        </button>

        <div className="flex items-center gap-3">
          {credits !== undefined && (
            credits > 0 ? (
              <span className="rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted">
                <span className="font-semibold text-accent">{credits}</span>
                {' '}credit{credits !== 1 ? 's' : ''}
              </span>
            ) : (
              <button
                onClick={() => router.push('/settings')}
                className="rounded-full border border-rose-500/30 bg-rose-950/20 px-2.5 py-1 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-950/40"
              >
                No credits
              </button>
            )
          )}

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
                    onClick={cycleTheme}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
                  >
                    <ThemeIcon size={14} className="text-muted" />
                    {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'} Theme
                  </button>
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
      </div>
    </nav>
  )
}
