export const DEFAULT_THEME_ID = 'charcoal-periwinkle'
export const DEFAULT_THEME_MODE = 'light'

const VALID_IDS = [
  'aurora-crimson',
  'charcoal-periwinkle',
  'midnight-coral',
  'twilight-apricot',
  'storm-tangerine',
  'deep-sea-marigold',
  'graphite-sage',
  'ink-bronze',
] as const

const VALID_MODES = ['dark', 'light'] as const

export type ThemeId = (typeof VALID_IDS)[number]
export type ThemeMode = (typeof VALID_MODES)[number]

export interface Theme {
  id: ThemeId
  name: string
  tagline: string
  darkBg: string
  darkSurface: string
  darkAccent: string
  lightBg: string
  lightSurface: string
  lightAccent: string
}

export const THEMES: readonly Theme[] = [
  {
    id: 'aurora-crimson',
    name: 'Aurora · Crimson Mono',
    tagline: 'The original',
    darkBg: '#131313', darkSurface: '#171717', darkAccent: '#FF1F4E',
    lightBg: '#F7F7F7', lightSurface: '#FBFBFB', lightAccent: '#D6133E',
  },
  {
    id: 'charcoal-periwinkle',
    name: 'Charcoal & Periwinkle',
    tagline: 'Soft charcoal + blue',
    darkBg: '#161616', darkSurface: '#1A1A1A', darkAccent: '#9AA8FF',
    lightBg: '#F8F8F8', lightSurface: '#FBFBFB', lightAccent: '#5161D2',
  },
  {
    id: 'midnight-coral',
    name: 'Midnight & Coral',
    tagline: 'Ink-blue + punchy coral',
    darkBg: '#131313', darkSurface: '#161616', darkAccent: '#FF7361',
    lightBg: '#F7F7F7', lightSurface: '#FBFBFB', lightAccent: '#C24A39',
  },
  {
    id: 'twilight-apricot',
    name: 'Twilight & Apricot',
    tagline: 'Golden apricot accent',
    darkBg: '#151514', darkSurface: '#1A1A19', darkAccent: '#FFB37A',
    lightBg: '#F7F7F6', lightSurface: '#FBFBFA', lightAccent: '#B36013',
  },
  {
    id: 'storm-tangerine',
    name: 'Storm & Tangerine',
    tagline: 'Cool slate + tangerine',
    darkBg: '#11161C', darkSurface: '#151A21', darkAccent: '#F5894A',
    lightBg: '#F6F7F9', lightSurface: '#FBFBFC', lightAccent: '#A0420D',
  },
  {
    id: 'deep-sea-marigold',
    name: 'Deep Sea & Marigold',
    tagline: 'Teal-ink + warm marigold',
    darkBg: '#0A1620', darkSurface: '#0D1A25', darkAccent: '#F5B13E',
    lightBg: '#F5F8F8', lightSurface: '#FAFCFC', lightAccent: '#A06808',
  },
  {
    id: 'graphite-sage',
    name: 'Graphite & Sage',
    tagline: 'Graphite + sage green',
    darkBg: '#10120F', darkSurface: '#131612', darkAccent: '#9BB88A',
    lightBg: '#F6F6F1', lightSurface: '#FBFBF8', lightAccent: '#4D6B3D',
  },
  {
    id: 'ink-bronze',
    name: 'Ink & Bronze',
    tagline: 'Navy + antique bronze',
    darkBg: '#0D1320', darkSurface: '#101725', darkAccent: '#C89968',
    lightBg: '#F5F1E8', lightSurface: '#F8F5ED', lightAccent: '#7A4F1F',
  },
]

export function isValidThemeId(id: string): id is ThemeId {
  return (VALID_IDS as readonly string[]).includes(id)
}

export function isValidThemeMode(mode: string): mode is ThemeMode {
  return (VALID_MODES as readonly string[]).includes(mode)
}
