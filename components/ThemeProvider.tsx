'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { applyTheme, getCurrentTheme } from '@/lib/themes/client'
import { DEFAULT_THEME_MODE } from '@/lib/themes/registry'

export type Theme = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME_MODE,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize to the server fallback so server and client render the same HTML.
  // Sync from DOM (set server-side via cookie in layout.tsx) after mount.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME_MODE)

  useEffect(() => {
    const current = getCurrentTheme()
    if (current.mode === 'light' || current.mode === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(current.mode)
    }
  }, [])

  useEffect(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(getCurrentTheme().id, prefersDark ? 'dark' : 'light')

      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(getCurrentTheme().id, e.matches ? 'dark' : 'light')
      }
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    } else {
      applyTheme(getCurrentTheme().id, theme)
    }
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
