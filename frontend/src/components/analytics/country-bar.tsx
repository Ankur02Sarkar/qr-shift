'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CountryBarProps {
  data: Array<{ country: string | null; count: number }>
  limit?: number
}

export function CountryBar({ data, limit = 10 }: CountryBarProps) {
  const cleaned = data
    .slice(0, limit)
    .map((d) => ({ name: d.country ?? 'Unknown', value: d.count }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By country</CardTitle>
      </CardHeader>
      <CardContent>
        {!cleaned.length ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">No data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(cleaned.length * 32, 160)}>
            <BarChart
              layout="vertical"
              data={cleaned}
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={40}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: 12,
                }}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="value" name="Scans" radius={[0, 4, 4, 0]}>
                {cleaned.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? 'var(--chart-1)' : 'var(--chart-2)'}
                    fillOpacity={1 - i * 0.06}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
