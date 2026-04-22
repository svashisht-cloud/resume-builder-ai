import { getAdminClient } from '@/lib/supabase/admin'
import CostOverTimeChart from '@/components/admin/charts/CostOverTimeChart'

export const dynamic = 'force-dynamic'

export default async function SystemPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminClient() as any
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const thisMonthStart = new Date()
  thisMonthStart.setDate(1)
  thisMonthStart.setHours(0, 0, 0, 0)
  const lastMonthStart = new Date(thisMonthStart)
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)

  const [costResult, thisMonthResult, lastMonthResult, errorsResult] = await Promise.all([
    admin
      .from('pipeline_runs')
      .select('created_at, estimated_cost_usd')
      .gte('created_at', thirtyDaysAgo)
      .not('estimated_cost_usd', 'is', null)
      .order('created_at', { ascending: true }),
    admin
      .from('pipeline_runs')
      .select('estimated_cost_usd')
      .gte('created_at', thisMonthStart.toISOString())
      .not('estimated_cost_usd', 'is', null),
    admin
      .from('pipeline_runs')
      .select('estimated_cost_usd')
      .gte('created_at', lastMonthStart.toISOString())
      .lt('created_at', thisMonthStart.toISOString())
      .not('estimated_cost_usd', 'is', null),
    admin
      .from('pipeline_runs')
      .select('error_step, error_code')
      .not('error_step', 'is', null)
      .gte('created_at', thirtyDaysAgo),
  ])

  // Daily cost data
  const costMap = new Map<string, number>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (costResult.data ?? []) as any[]) {
    const day = (r.created_at as string).slice(0, 10)
    costMap.set(day, (costMap.get(day) ?? 0) + Number(r.estimated_cost_usd))
  }
  const costData = Array.from(costMap.entries()).map(([date, cost]) => ({
    date,
    cost: Number(cost.toFixed(4)),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thisMonthCost = ((thisMonthResult.data ?? []) as any[]).reduce(
    (acc: number, r: { estimated_cost_usd: string }) => acc + Number(r.estimated_cost_usd),
    0,
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastMonthCost = ((lastMonthResult.data ?? []) as any[]).reduce(
    (acc: number, r: { estimated_cost_usd: string }) => acc + Number(r.estimated_cost_usd),
    0,
  )

  // Error breakdown
  const errorMap = new Map<string, number>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (errorsResult.data ?? []) as any[]) {
    const key = `${r.error_step}: ${r.error_code ?? 'unknown'}`
    errorMap.set(key, (errorMap.get(key) ?? 0) + 1)
  }
  const errors = Array.from(errorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  const evalModel = process.env.OPENAI_EVAL_MODEL ?? 'gpt-5-chat-latest (default)'
  const tailorModel = process.env.OPENAI_TAILOR_MODEL ?? 'gpt-5-chat-latest (default)'

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">System</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">This Month Cost</div>
          <div className="text-3xl font-semibold">${thisMonthCost.toFixed(4)}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-6">
          <div className="text-xs text-muted uppercase tracking-wide mb-1">Last Month Cost</div>
          <div className="text-3xl font-semibold">${lastMonthCost.toFixed(4)}</div>
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-surface p-6 mb-8">
        <h2 className="text-sm font-medium text-muted mb-4">Cost Over Time (30d)</h2>
        <CostOverTimeChart data={costData} />
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-medium mb-3">Model Config</h2>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-muted">Eval model</td>
                  <td className="px-4 py-3 font-mono text-xs">{evalModel}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted">Tailor model</td>
                  <td className="px-4 py-3 font-mono text-xs">{tailorModel}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium mb-3">Rate Limiting</h2>
          <div className="rounded-xl border border-border/60 bg-surface p-4 text-sm text-muted">
            Powered by Upstash Redis. View limits in{' '}
            <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">lib/ratelimit.ts</code>.
          </div>
        </div>
      </div>
      <h2 className="text-lg font-medium mb-3">Error Breakdown (30d)</h2>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-raised">
              <th className="text-left px-4 py-3 text-muted font-medium">Error</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            {errors.map(([key, count], i) => (
              <tr key={i} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{key}</td>
                <td className="px-4 py-3 text-right font-medium">{count}</td>
              </tr>
            ))}
            {errors.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted text-sm">
                  No errors in the last 30 days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
