'use client'

import { Monitor, Sun, Moon } from 'lucide-react'
import { useTheme, type Theme } from '@/components/ThemeProvider'

const options: { value: Theme; label: string; Icon: typeof Monitor }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light',  label: 'Light',  Icon: Sun },
  { value: 'dark',   label: 'Dark',   Icon: Moon },
]

export default function AppearanceSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6">
      <div className="mb-5 flex items-center gap-2">
        <Sun size={15} className="text-muted" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">Appearance</h2>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Theme</span>
        <div className="flex rounded-lg border border-border/60 bg-surface-raised p-0.5 gap-0.5">
          {options.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                theme === value
                  ? 'bg-accent text-background shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
