'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface OsBrowserBarProps {
  osData:      Array<{ os:      string | null; count: number }>
  browserData: Array<{ browser: string | null; count: number }>
}

export function OsBrowserBar({ osData, browserData }: OsBrowserBarProps) {
  // Merge OS + browser into combined dataset for a grouped bar chart
  const allNames = Array.from(new Set([
    ...osData.map((d) => d.os ?? 'Unknown'),
    ...browserData.map((d) => d.browser ?? 'Unknown'),
  ]))

  const combined = allNames.map((name) => ({
    name,
    OS:      osData.find((d) => (d.os ?? 'Unknown') === name)?.count ?? 0,
    Browser: browserData.find((d) => (d.browser ?? 'Unknown') === name)?.count ?? 0,
  })).filter((d) => d.OS > 0 || d.Browser > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">OS & browser</CardTitle>
      </CardHeader>
      <CardContent>
        {!combined.length ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">No data</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={combined} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
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
              <Legend
                iconSize={10}
                formatter={(v) => <span style={{ fontSize: 12, color: 'var(--foreground)' }}>{v}</span>}
              />
              <Bar dataKey="OS"      fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Browser" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
