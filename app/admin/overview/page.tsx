import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6">
      <div className="text-xs text-muted uppercase tracking-wide mb-1">{label}</div>
      <div className="text-3xl font-semibold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  )
}

export default async function OverviewPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminClient() as any
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayIso = todayStart.toISOString()
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  // eslint-disable-next-line react-hooks/purity
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: runsToday },
    avgDeltaResult,
    costTodayResult,
    recentRunsResult,
    errorCheckResult,
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('pipeline_runs').select('*', { count: 'exact', head: true }).gte('created_at', todayIso),
    admin.from('pipeline_runs').select('score_delta').gte('created_at', sevenDaysAgo).not('score_delta', 'is', null),
    admin.from('pipeline_runs').select('estimated_cost_usd').gte('created_at', todayIso).not('estimated_cost_usd', 'is', null),
    admin.from('pipeline_runs').select('id, created_at, score_before, score_after, score_delta, error_step, error_code, profiles(email)').order('created_at', { ascending: false }).limit(20),
    admin.from('pipeline_runs').select('error_step').gte('created_at', oneHourAgo),
  ])

  const deltas = (avgDeltaResult.data ?? []).map((r: { score_delta: number }) => r.score_delta)
  const avgDelta = deltas.length ? (deltas.reduce((a: number, b: number) => a + b, 0) / deltas.length).toFixed(1) : '—'

  const costs = (costTodayResult.data ?? []).map((r: { estimated_cost_usd: string }) => Number(r.estimated_cost_usd))
  const costToday = costs.length ? `$${costs.reduce((a: number, b: number) => a + b, 0).toFixed(4)}` : '$0.0000'

  const recentRuns = recentRunsResult.data ?? []
  const hourRuns = errorCheckResult.data ?? []
  const errorRate = hourRuns.length > 0 ? hourRuns.filter((r: { error_step: string | null }) => r.error_step).length / hourRuns.length : 0
  const showErrorBanner = errorRate > 0.1

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Overview</h1>
      {showErrorBanner && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          High error rate in the last hour ({(errorRate * 100).toFixed(0)}% of runs failed). Check System for details.
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Users" value={totalUsers ?? 0} />
        <KpiCard label="Runs Today" value={runsToday ?? 0} />
        <KpiCard label="Avg Score Δ (7d)" value={avgDelta} />
        <KpiCard label="Cost Today" value={costToday} />
      </div>
      <h2 className="text-lg font-medium mb-3">Recent Runs</h2>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-raised">
              <th className="text-left px-4 py-3 text-muted font-medium">Time</th>
              <th className="text-left px-4 py-3 text-muted font-medium">User</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Before</th>
              <th className="text-right px-4 py-3 text-muted font-medium">After</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Δ</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recentRuns.map((run: any) => (
              <tr key={run.id} className="border-b border-border/40 last:border-0 hover:bg-surface-raised/40">
                <td className="px-4 py-3 text-muted text-xs">{new Date(run.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs truncate max-w-[180px]">{run.profiles?.email ?? '—'}</td>
                <td className="px-4 py-3 text-right">{run.score_before ?? '—'}</td>
                <td className="px-4 py-3 text-right">{run.score_after ?? '—'}</td>
                <td className={`px-4 py-3 text-right font-medium ${run.score_delta > 0 ? 'text-green-400' : run.score_delta < 0 ? 'text-red-400' : 'text-muted'}`}>
                  {run.score_delta != null ? (run.score_delta > 0 ? '+' : '') + run.score_delta : '—'}
                </td>
                <td className="px-4 py-3">
                  {run.error_step ? (
                    <span className="text-xs rounded-full bg-red-500/15 text-red-400 px-2 py-0.5">Error: {run.error_step}</span>
                  ) : (
                    <span className="text-xs rounded-full bg-green-500/15 text-green-400 px-2 py-0.5">OK</span>
                  )}
                </td>
              </tr>
            ))}
            {recentRuns.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted text-sm">No runs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
