'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyTheme, getCurrentTheme } from './client'
import {
  isValidThemeId,
  isValidThemeMode,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_MODE,
} from './registry'

export function useThemeSync(): void {
  useEffect(() => {
    // Check whether this browser already has an explicit theme cookie.
    // Our cookies are written by applyTheme() with Path=/ and a 1-year max-age,
    // so their presence means the user has a known local state for this device.
    const hasCookie = document.cookie.split('; ').some(c => c.startsWith('theme-mode='))

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('theme_id, theme_mode')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const raw = data as Record<string, string> | null
          const dbId   = isValidThemeId(raw?.theme_id ?? '')     ? (raw!.theme_id as string)   : DEFAULT_THEME_ID
          const dbMode = isValidThemeMode(raw?.theme_mode ?? '') ? (raw!.theme_mode as string) : DEFAULT_THEME_MODE
          const current = getCurrentTheme()

          if (!hasCookie) {
            // Fresh browser / new device — no local cookie exists. Use DB as source of truth.
            if (dbId !== current.id || dbMode !== current.mode) {
              applyTheme(dbId, dbMode)
            }
          } else if (dbId !== current.id || dbMode !== current.mode) {
            // Cookie is already set — the local state is intentional.
            // Silently bring the DB into sync so other devices pick up the change.
            supabase
              .from('profiles')
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .update({ theme_id: current.id, theme_mode: current.mode } as any)
              .eq('id', user.id)
              .then(() => { /* fire and forget */ })
          }
        })
    })
  }, [])
}
