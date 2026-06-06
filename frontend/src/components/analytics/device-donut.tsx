'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeviceDonutProps {
  data: Array<{ device: string | null; count: number }>
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function DeviceDonut({ data }: DeviceDonutProps) {
  const cleaned = data.map((d) => ({ name: d.device ?? 'Unknown', value: d.count }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By device</CardTitle>
      </CardHeader>
      <CardContent>
        {!cleaned.length ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">No data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={cleaned}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {cleaned.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: 12,
                }}
              />
              <Legend
                iconSize={10}
                formatter={(v) => <span style={{ fontSize: 12, color: 'var(--foreground)' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
