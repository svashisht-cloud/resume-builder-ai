'use client'
import { useState } from 'react'

export default function GrantCreditsForm({ userId }: { userId: string }) {
  const [count, setCount] = useState(1)
  const [reason, setReason] = useState('admin_grant')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/grant-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, count, reason }),
      })
      const data = await res.json()
      setResult(data.ok ? { ok: true } : { error: data.error ?? 'Failed' })
    } catch {
      setResult({ error: 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={e => setCount(parseInt(e.target.value, 10) || 1)}
          className="w-20 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-accent/50"
        />
        <select
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="flex-1 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-accent/50"
        >
          <option value="admin_grant">Admin grant</option>
          <option value="courtesy">Courtesy</option>
          <option value="bug_compensation">Bug compensation</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-accent/20 text-accent text-sm hover:bg-accent/30 transition-colors disabled:opacity-50"
      >
        {loading ? 'Granting…' : 'Grant Credits'}
      </button>
      {result?.ok && <div className="text-xs text-green-400">Credits granted successfully.</div>}
      {result?.error && <div className="text-xs text-red-400">{result.error}</div>}
    </form>
  )
}
