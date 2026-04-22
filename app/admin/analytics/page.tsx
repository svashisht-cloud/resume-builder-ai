import { getAdminClient } from '@/lib/supabase/admin'
import DailyRunsChart from '@/components/admin/charts/DailyRunsChart'
import ScoreDeltaHistogram from '@/components/admin/charts/ScoreDeltaHistogram'
import AvgScoreChart from '@/components/admin/charts/AvgScoreChart'
import StepLatencyChart from '@/components/admin/charts/StepLatencyChart'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminClient() as any
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  // eslint-disable-next-line react-hooks/purity
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [runsResult, latencyResult, topUsersResult] = await Promise.all([
    admin
      .from('pipeline_runs')
      .select('created_at, error_step, score_delta, score_before, score_after')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
    admin
      .from('pipeline_runs')
      .select('created_at, step1_duration_ms, step2_duration_ms, step3_duration_ms')
      .gte('created_at', fourteenDaysAgo)
      .not('step1_duration_ms', 'is', null)
      .order('created_at', { ascending: true }),
    admin
      .from('pipeline_runs')
      .select('user_id, profiles(email)')
      .gte('created_at', thirtyDaysAgo),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runs = (runsResult.data ?? []) as any[]

  // Daily run counts
  const dailyMap = new Map<string, { success: number; error: number }>()
  for (const r of runs) {
    const day = (r.created_at as string).slice(0, 10)
    const entry = dailyMap.get(day) ?? { success: 0, error: 0 }
    if (r.error_step) entry.error++; else entry.success++
    dailyMap.set(day, entry)
  }
  const dailyRuns = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }))

  // Score delta histogram
  const deltas = runs.filter(r => r.score_delta != null).map(r => r.score_delta as number)
  const histogram = [
    { bucket: '<0', count: deltas.filter(d => d < 0).length },
    { bucket: '0–5', count: deltas.filter(d => d >= 0 && d < 5).length },
    { bucket: '5–10', count: deltas.filter(d => d >= 5 && d < 10).length },
    { bucket: '10–20', count: deltas.filter(d => d >= 10 && d < 20).length },
    { bucket: '20+', count: deltas.filter(d => d >= 20).length },
  ]

  // Avg score before/after per day
  const avgScoreMap = new Map<string, { beforeSum: number; afterSum: number; count: number }>()
  for (const r of runs) {
    if (r.score_before == null || r.score_after == null) continue
    const day = (r.created_at as string).slice(0, 10)
    const entry = avgScoreMap.get(day) ?? { beforeSum: 0, afterSum: 0, count: 0 }
    entry.beforeSum += r.score_before as number
    entry.afterSum += r.score_after as number
    entry.count++
    avgScoreMap.set(day, entry)
  }
  const avgScores = Array.from(avgScoreMap.entries()).map(([date, v]) => ({
    date,
    before: Math.round(v.beforeSum / v.count),
    after: Math.round(v.afterSum / v.count),
  }))

  // Step latency per day
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latencyRuns = (latencyResult.data ?? []) as any[]
  const latencyMap = new Map<string, { s1: number[]; s2: number[]; s3: number[] }>()
  for (const r of latencyRuns) {
    const day = (r.created_at as string).slice(0, 10)
    const entry = latencyMap.get(day) ?? { s1: [], s2: [], s3: [] }
    if (r.step1_duration_ms) entry.s1.push(r.step1_duration_ms as number)
    if (r.step2_duration_ms) entry.s2.push(r.step2_duration_ms as number)
    if (r.step3_duration_ms) entry.s3.push(r.step3_duration_ms as number)
    latencyMap.set(day, entry)
  }
  const stepLatency = Array.from(latencyMap.entries()).map(([date, v]) => ({
    date,
    step1: v.s1.length ? Math.round(v.s1.reduce((a, b) => a + b, 0) / v.s1.length / 1000) : 0,
    step2: v.s2.length ? Math.round(v.s2.reduce((a, b) => a + b, 0) / v.s2.length / 1000) : 0,
    step3: v.s3.length ? Math.round(v.s3.reduce((a, b) => a + b, 0) / v.s3.length / 1000) : 0,
  }))

  // Top users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topUsersRuns = (topUsersResult.data ?? []) as any[]
  const userRunMap = new Map<string, { email: string; count: number }>()
  for (const r of topUsersRuns) {
    const entry = userRunMap.get(r.user_id) ?? { email: r.profiles?.email ?? r.user_id, count: 0 }
    entry.count++
    userRunMap.set(r.user_id, entry)
  }
  const topUsers = Array.from(userRunMap.values()).sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
      <div className="space-y-8">
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <h2 className="text-sm font-medium text-muted mb-4">Daily Runs (30d)</h2>
          <DailyRunsChart data={dailyRuns} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-border/60 bg-surface p-6">
            <h2 className="text-sm font-medium text-muted mb-4">Score Δ Distribution (30d)</h2>
            <ScoreDeltaHistogram data={histogram} />
          </div>
          <div className="rounded-xl border border-border/60 bg-surface p-6">
            <h2 className="text-sm font-medium text-muted mb-4">Avg Score Before/After (30d)</h2>
            <AvgScoreChart data={avgScores} />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <h2 className="text-sm font-medium text-muted mb-4">Step Latency — avg sec (14d)</h2>
          <StepLatencyChart data={stepLatency} />
        </div>
        <div>
          <h2 className="text-lg font-medium mb-3">Top Users (30d)</h2>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-raised">
                  <th className="text-left px-4 py-3 text-muted font-medium">Email</th>
                  <th className="text-right px-4 py-3 text-muted font-medium">Runs</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 text-right font-medium">{u.count}</td>
                  </tr>
                ))}
                {topUsers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted text-sm">No data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
