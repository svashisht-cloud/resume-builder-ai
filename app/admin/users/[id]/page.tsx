import { getAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GrantCreditsForm from '@/components/admin/GrantCreditsForm'
import DisableUserButton from '@/components/admin/DisableUserButton'

export const dynamic = 'force-dynamic'

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminClient() as any

  const [profileResult, creditsResult, resumesResult] = await Promise.all([
    admin.from('profiles').select('*').eq('id', id).single(),
    admin
      .from('credits')
      .select('source, spent_on_resume_id, expires_at, granted_at')
      .eq('user_id', id)
      .order('granted_at', { ascending: false }),
    admin
      .from('resumes')
      .select('id, job_title, company_name, created_at, regen_count')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (profileResult.error || !profileResult.data) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileResult.data as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const credits = (creditsResult.data ?? []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resumes = (resumesResult.data ?? []) as any[]

  const granted = credits.length
  const spent = credits.filter((c) => c.spent_on_resume_id).length
  const now = new Date()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="text-muted hover:text-foreground text-sm transition-colors">
          ← Users
        </Link>
        <span className="text-border">/</span>
        <span className="text-sm">{profile.email}</span>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{profile.display_name ?? profile.email}</h1>
            <div className="text-sm text-muted mt-1">{profile.email}</div>
            <div className="text-xs text-muted mt-1">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {profile.is_admin && (
              <span className="text-xs rounded-full bg-indigo-500/15 text-indigo-400 px-2 py-0.5">Admin</span>
            )}
            {profile.disabled_at ? (
              <span className="text-xs rounded-full bg-red-500/15 text-red-400 px-2 py-0.5">
                Disabled {new Date(profile.disabled_at).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-xs rounded-full bg-green-500/15 text-green-400 px-2 py-0.5">Active</span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border/60">
          <div>
            <div className="text-xs text-muted">Credits remaining</div>
            <div className="text-lg font-semibold">{profile.credits_remaining ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Total granted</div>
            <div className="text-lg font-semibold">{granted}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Total spent</div>
            <div className="text-lg font-semibold">{spent}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-border/60 bg-surface p-5">
          <h2 className="text-sm font-medium mb-3">Grant Credits</h2>
          <GrantCreditsForm userId={id} />
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-5">
          <h2 className="text-sm font-medium mb-3">Account Actions</h2>
          <DisableUserButton userId={id} email={profile.email} disabled={!!profile.disabled_at} />
        </div>
      </div>

      <h2 className="text-lg font-medium mb-3">Credit Ledger</h2>
      <div className="rounded-xl border border-border/60 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-raised">
              <th className="text-left px-4 py-3 text-muted font-medium">Source</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Granted</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Expires</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {credits.slice(0, 20).map((c, i) => {
              const isSpent = !!c.spent_on_resume_id
              const isExpired = !isSpent && c.expires_at && new Date(c.expires_at) < now
              return (
                <tr key={i} className="border-b border-border/40 last:border-0">
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
            {credits.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted text-sm">No credits.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-medium mb-3">Recent Resumes</h2>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-raised">
              <th className="text-left px-4 py-3 text-muted font-medium">Job</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Company</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Regens</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((r) => (
              <tr key={r.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 truncate max-w-[200px]">{r.job_title ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{r.company_name ?? '—'}</td>
                <td className="px-4 py-3 text-right">{r.regen_count ?? 0}</td>
                <td className="px-4 py-3 text-muted text-xs">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {resumes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted text-sm">No resumes yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
