'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Check, Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { applyTheme } from '@/lib/themes/client'
import { THEMES, DEFAULT_THEME_ID, DEFAULT_THEME_MODE, type ThemeId, type ThemeMode } from '@/lib/themes/registry'

export default function ThemeSection() {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID)
  const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('profiles')
        .select('theme_id, theme_mode')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const raw = data as Record<string, string> | null
          if (raw?.theme_id)   setThemeId(raw.theme_id as ThemeId)
          if (raw?.theme_mode) setThemeMode(raw.theme_mode as ThemeMode)
          setLoading(false)
        })
    })
  }, [])

  async function handlePaletteChange(id: ThemeId) {
    const prev = themeId
    setThemeId(id)
    applyTheme(id, themeMode)
    setSaveError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ theme_id: id } as any)
        .eq('id', user.id)
      if (error) throw error
    } catch {
      setThemeId(prev)
      applyTheme(prev, themeMode)
      setSaveError('Failed to save theme. Please try again.')
    }
  }

  async function handleModeChange(mode: ThemeMode) {
    const prev = themeMode
    setThemeMode(mode)
    applyTheme(themeId, mode)
    setSaveError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ theme_mode: mode } as any)
        .eq('id', user.id)
      if (error) throw error
    } catch {
      setThemeMode(prev)
      applyTheme(themeId, prev)
      setSaveError('Failed to save mode. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-surface p-6 text-sm text-muted">
        Loading appearance…
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6">
      <div className="mb-1 flex items-center gap-2">
        <Palette size={15} className="text-muted" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Appearance</h2>
      </div>
      <p className="mb-5 text-xs text-text-dim">
        Pick a palette and mode. Changes apply instantly and sync across your devices.
      </p>

      {/* Mode toggle */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-foreground">Mode</span>
        <div className="flex rounded-lg border border-border/60 bg-surface-raised p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => void handleModeChange('dark')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              themeMode === 'dark'
                ? 'bg-accent text-background shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Moon size={13} />
            Dark
          </button>
          <button
            type="button"
            onClick={() => void handleModeChange('light')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              themeMode === 'light'
                ? 'bg-accent text-background shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Sun size={13} />
            Light
          </button>
        </div>
      </div>

      {/* Palette grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {THEMES.map((theme) => {
          const bg      = themeMode === 'dark' ? theme.darkBg      : theme.lightBg
          const surface = themeMode === 'dark' ? theme.darkSurface  : theme.lightSurface
          const accent  = themeMode === 'dark' ? theme.darkAccent   : theme.lightAccent
          const selected = themeId === theme.id

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => void handlePaletteChange(theme.id)}
              className={`relative rounded-lg border-2 p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                selected
                  ? 'border-accent shadow-sm'
                  : 'border-border/60 hover:border-border'
              }`}
            >
              {/* 3-band swatch */}
              <div className="mb-2 flex h-8 overflow-hidden rounded-md">
                <div className="flex-1" style={{ background: bg }} />
                <div className="flex-1" style={{ background: surface }} />
                <div className="w-5 flex-none" style={{ background: accent }} />
              </div>

              <p className="text-xs font-medium text-foreground leading-tight">{theme.name}</p>
              <p className="mt-0.5 text-[10px] text-text-dim leading-tight">{theme.tagline}</p>

              {selected && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                  <Check size={10} className="text-background" strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {saveError && (
        <p className="mt-3 text-xs text-red-400">{saveError}</p>
      )}
    </div>
  )
}
