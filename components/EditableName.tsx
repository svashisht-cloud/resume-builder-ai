'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EditableNameProps {
  initialName: string
  userId: string
}

export default function EditableName({ initialName, userId }: EditableNameProps) {
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)

  async function handleBlur() {
    if (name === initialName) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ display_name: name }).eq('id', userId)
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent"
      />
      {saving && <span className="text-xs text-muted">Saving…</span>}
    </div>
  )
}
