import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 25

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { search = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminClient() as any

  let query = admin
    .from('profiles')
    .select('id, email, display_name, created_at, credits_remaining, is_admin, disabled_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (search.trim()) {
    query = query.ilike('email', `%${search.trim()}%`)
  }

  const { data: users, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Users</h1>
      <form className="mb-4 flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by email…"
          className="flex-1 rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:ring-1 focus:ring-accent/50"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent/20 text-accent text-sm hover:bg-accent/30 transition-colors"
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-lg bg-surface-raised text-sm text-muted hover:text-foreground transition-colors"
          >
            Clear
          </Link>
        )}
      </form>
      <div className="rounded-xl border border-border/60 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-raised">
              <th className="text-left px-4 py-3 text-muted font-medium">Email</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Joined</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Credits</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-b border-border/40 last:border-0 hover:bg-surface-raised/40">
                <td className="px-4 py-3">
                  <div className="font-medium truncate max-w-[260px]">{u.email}</div>
                  {u.display_name && <div className="text-xs text-muted">{u.display_name}</div>}
                </td>
                <td className="px-4 py-3 text-muted text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">{u.credits_remaining ?? 0}</td>
                <td className="px-4 py-3">
                  {u.disabled_at ? (
                    <span className="text-xs rounded-full bg-red-500/15 text-red-400 px-2 py-0.5">Disabled</span>
                  ) : u.is_admin ? (
                    <span className="text-xs rounded-full bg-indigo-500/15 text-indigo-400 px-2 py-0.5">Admin</span>
                  ) : (
                    <span className="text-xs rounded-full bg-green-500/15 text-green-400 px-2 py-0.5">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/users/${u.id}`} className="text-xs text-accent hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {(users ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted text-sm">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{count ?? 0} total users</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/admin/users?search=${encodeURIComponent(search)}&page=${page - 1}`}
              className="px-3 py-1.5 rounded-lg bg-surface-raised hover:text-foreground transition-colors"
            >
              ← Prev
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/admin/users?search=${encodeURIComponent(search)}&page=${page + 1}`}
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
