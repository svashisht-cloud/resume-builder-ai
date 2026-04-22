'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DisableUserButton({
  userId,
  email,
  disabled,
}: {
  userId: string
  email: string
  disabled: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (disabled) {
    return <div className="text-sm text-muted">This account is already disabled.</div>
  }

  async function handleDisable() {
    if (!confirm(`Disable account for ${email}? They will be signed out immediately.`)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/disable-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.ok) {
        router.refresh()
      } else {
        setError(data.error ?? 'Failed')
      }
    } catch {
      setError('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDisable}
        disabled={loading}
        className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
      >
        {loading ? 'Disabling…' : 'Disable Account'}
      </button>
      {error && <div className="text-xs text-red-400">{error}</div>}
    </div>
  )
}
