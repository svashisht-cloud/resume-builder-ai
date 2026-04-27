'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function CostOverTimeChart({ data }: { data: { date: string; cost: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => {
            const num = typeof v === 'number' ? v : parseFloat(String(v))
            return [`$${isNaN(num) ? String(v) : num.toFixed(4)}`, 'Cost']
          }}
        />
        <Line type="monotone" dataKey="cost" stroke="#FF1F4E" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
