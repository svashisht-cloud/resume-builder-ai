import { DEFAULT_THEME_ID, DEFAULT_THEME_MODE } from './registry'

const COOKIE_OPTS = 'Path=/; Max-Age=31536000; SameSite=Lax'

export function applyTheme(id: string, mode: string): void {
  document.documentElement.setAttribute('data-theme-id', id)
  document.documentElement.setAttribute('data-theme', mode)
  document.cookie = `theme-id=${id}; ${COOKIE_OPTS}`
  document.cookie = `theme-mode=${mode}; ${COOKIE_OPTS}`
}

export function getCurrentTheme(): { id: string; mode: string } {
  const el = document.documentElement
  return {
    id:   el.getAttribute('data-theme-id') ?? DEFAULT_THEME_ID,
    mode: el.getAttribute('data-theme')    ?? DEFAULT_THEME_MODE,
  }
}
