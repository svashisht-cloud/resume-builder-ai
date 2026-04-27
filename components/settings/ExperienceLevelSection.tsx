'use client'

import { useState } from 'react'
import { Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Level = 'junior' | 'mid' | 'senior'

const LEVELS: { value: Level; label: string; description: string }[] = [
  { value: 'junior', label: 'Junior', description: '1 page · 6–8 bullets · 2–3 sentence summary' },
  { value: 'mid',    label: 'Mid',    description: '1 page · 8–10 bullets · 2–3 sentence summary' },
  { value: 'senior', label: 'Senior', description: '1–2 pages · 10–18 bullets · 3–4 sentence summary' },
]

export default function ExperienceLevelSection({ initialLevel }: { initialLevel: Level }) {
  const [level, setLevel] = useState<Level>(initialLevel)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleChange(newLevel: Level) {
    const previousLevel = level
    setLevel(newLevel)
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('profiles')
        .update({ experience_level: newLevel })
        .eq('id', user.id)
      if (error) throw error
    } catch (err) {
      setLevel(previousLevel)
      setSaveError('Failed to save. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const description = LEVELS.find((l) => l.value === level)?.description ?? ''

  return (
    <div className="surface-card-quiet rounded-xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <Briefcase size={15} className="text-muted" />
        <h2 className="font-display text-base font-semibold text-foreground">Experience level</h2>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Career stage</span>
        <div className="flex rounded-lg border border-border/60 bg-surface-raised p-0.5 gap-0.5">
          {LEVELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              disabled={saving}
              onClick={() => void handleChange(value)}
              className={`flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60 ${
                level === value
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">{description}</p>

      {saving && <p className="mt-2 text-xs text-muted">Saving…</p>}
      {saveError && <p className="mt-2 text-xs text-danger-fg">{saveError}</p>}
    </div>
  )
}
