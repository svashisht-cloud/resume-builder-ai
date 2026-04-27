export const DEFAULT_THEME_ID = 'aurora-crimson'
export const DEFAULT_THEME_MODE = 'dark'

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
    darkBg: '#0D1226', darkSurface: '#141A32', darkAccent: '#FF1F4E',
    lightBg: '#F8F7F9', lightSurface: '#FFFFFF', lightAccent: '#D6133E',
  },
  {
    id: 'charcoal-periwinkle',
    name: 'Charcoal & Periwinkle',
    tagline: 'Soft charcoal + blue',
    darkBg: '#15161B', darkSurface: '#1C1E25', darkAccent: '#9AA8FF',
    lightBg: '#F8F7FB', lightSurface: '#FFFFFF', lightAccent: '#5161D2',
  },
  {
    id: 'midnight-coral',
    name: 'Midnight & Coral',
    tagline: 'Ink-blue + punchy coral',
    darkBg: '#0C1224', darkSurface: '#121830', darkAccent: '#FF7361',
    lightBg: '#F6F7FB', lightSurface: '#FFFFFF', lightAccent: '#C24A39',
  },
  {
    id: 'twilight-apricot',
    name: 'Twilight & Apricot',
    tagline: 'Golden apricot accent',
    darkBg: '#0F1428', darkSurface: '#171D35', darkAccent: '#FFB37A',
    lightBg: '#F9F7F1', lightSurface: '#FFFFFF', lightAccent: '#B36013',
  },
  {
    id: 'storm-tangerine',
    name: 'Storm & Tangerine',
    tagline: 'Cool slate + tangerine',
    darkBg: '#11161C', darkSurface: '#181E26', darkAccent: '#F5894A',
    lightBg: '#F6F7F9', lightSurface: '#FFFFFF', lightAccent: '#A0420D',
  },
  {
    id: 'deep-sea-marigold',
    name: 'Deep Sea & Marigold',
    tagline: 'Teal-ink + warm marigold',
    darkBg: '#0A1620', darkSurface: '#101E2A', darkAccent: '#F5B13E',
    lightBg: '#F5F8F8', lightSurface: '#FFFFFF', lightAccent: '#A06808',
  },
  {
    id: 'graphite-sage',
    name: 'Graphite & Sage',
    tagline: 'Graphite + sage green',
    darkBg: '#10120F', darkSurface: '#161914', darkAccent: '#9BB88A',
    lightBg: '#F6F6F1', lightSurface: '#FFFFFF', lightAccent: '#4D6B3D',
  },
  {
    id: 'ink-bronze',
    name: 'Ink & Bronze',
    tagline: 'Navy + antique bronze',
    darkBg: '#0D1320', darkSurface: '#131A2A', darkAccent: '#C89968',
    lightBg: '#F5F1E8', lightSurface: '#FBF8F1', lightAccent: '#7A4F1F',
  },
]

export function isValidThemeId(id: string): id is ThemeId {
  return (VALID_IDS as readonly string[]).includes(id)
}

export function isValidThemeMode(mode: string): mode is ThemeMode {
  return (VALID_MODES as readonly string[]).includes(mode)
}
