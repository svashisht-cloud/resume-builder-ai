'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always initialize to 'dark' so server and client render the same HTML.
  // The inline script in layout.tsx already sets data-theme before React loads,
  // so visuals are correct. We sync the real stored value after mount.
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = document.documentElement

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')

      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    } else {
      root.setAttribute('data-theme', theme)
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
