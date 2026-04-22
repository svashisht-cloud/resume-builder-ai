import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 25

const SOURCES = ['free_tier', 'admin_grant', 'courtesy', 'bug_compensation', 'resume_pack', 'resume_pack_plus']

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; source?: string }>
}) {
  const { page: pageStr = '1', source = '' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminClient() as any

  let query = admin
    .from('credits')
    .select('id, source, granted_at, expires_at, spent_on_resume_id, user_id, profiles(email)', { count: 'exact' })
    .order('granted_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (source) query = query.eq('source', source)

  const { data: credits, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const now = new Date()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Credits</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/admin/credits"
          className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!source ? 'bg-accent/20 text-accent' : 'bg-surface-raised text-muted hover:text-foreground'}`}
        >
          All
        </Link>
        {SOURCES.map(s => (
          <Link
            key={s}
            href={`/admin/credits?source=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${source === s ? 'bg-accent/20 text-accent' : 'bg-surface-raised text-muted hover:text-foreground'}`}
          >
            {s}
          </Link>
        ))}
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-raised">
              <th className="text-left px-4 py-3 text-muted font-medium">User</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Source</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Granted</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Expires</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(credits ?? []).map((c: any) => {
              const isSpent = !!c.spent_on_resume_id
              const isExpired = !isSpent && c.expires_at && new Date(c.expires_at) < now
              return (
                <tr key={c.id} className="border-b border-border/40 last:border-0 hover:bg-surface-raised/40">
                  <td className="px-4 py-3 text-xs truncate max-w-[220px]">
                    {c.profiles?.email ?? c.user_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs rounded-full bg-surface-raised px-2 py-0.5">{c.source}</span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(c.granted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {isSpent ? (
                      <span className="text-xs rounded-full bg-surface-raised text-muted px-2 py-0.5">Spent</span>
                    ) : isExpired ? (
                      <span className="text-xs rounded-full bg-red-500/15 text-red-400 px-2 py-0.5">Expired</span>
                    ) : (
                      <span className="text-xs rounded-full bg-green-500/15 text-green-400 px-2 py-0.5">Active</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {(credits ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted text-sm">No credits found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{count ?? 0} total credits</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/admin/credits?source=${source}&page=${page - 1}`}
              className="px-3 py-1.5 rounded-lg bg-surface-raised hover:text-foreground transition-colors"
            >
              ← Prev
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/admin/credits?source=${source}&page=${page + 1}`}
              className="px-3 py-1.5 rounded-lg bg-surface-raised hover:text-foreground transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
