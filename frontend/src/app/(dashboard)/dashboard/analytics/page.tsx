'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { QrCode, AnalyticsData } from '@/lib/api'
import { RangeSelector, rangeToParams } from '@/components/analytics/range-selector'
import type { DateRange } from '@/components/analytics/range-selector'
import { StatCard } from '@/components/analytics/stat-card'
import { ScansOverTime } from '@/components/analytics/scans-over-time'
import { DeviceDonut } from '@/components/analytics/device-donut'
import { CountryBar } from '@/components/analytics/country-bar'
import { OsBrowserBar } from '@/components/analytics/os-browser-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QRWithAnalytics {
  qr:        QrCode
  analytics: AnalyticsData | null
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function downloadCSV(items: QRWithAnalytics[], range: DateRange) {
  const rows: string[][] = [['QR Name', 'Short Code', 'Date', 'Scans']]
  for (const { qr, analytics } of items) {
    if (!analytics) continue
    for (const { date, count } of analytics.byDay) {
      rows.push([qr.name, qr.shortCode, date, String(count)])
    }
  }
  if (rows.length === 1) return // nothing to export
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `qr-shift-analytics-${range}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange]     = useState<DateRange>('30d')
  const [items, setItems]     = useState<QRWithAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async (r: DateRange) => {
    setLoading(true)
    try {
      const { data: codes } = await api.qr.list()
      const params = rangeToParams(r)

      const results = await Promise.all(
        codes.map(async (qr) => {
          try {
            const { data: analytics } = await api.analytics.get(qr.id, params)
            return { qr, analytics }
          } catch {
            return { qr, analytics: null }
          }
        }),
      )
      setItems(results)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(range) }, [load, range])

  // Aggregate stats across all QRs
  const totalScans    = items.reduce((s, { analytics: a }) => s + (a?.total ?? 0), 0)
  const activeQRs     = items.filter(({ qr }) => qr.isActive).length
  const topQR         = [...items].sort((a, b) => (b.analytics?.total ?? 0) - (a.analytics?.total ?? 0))[0]

  // Merge byDay across all QRs
  const mergedByDay = (() => {
    const map = new Map<string, number>()
    for (const { analytics: a } of items) {
      for (const { date, count } of a?.byDay ?? []) {
        map.set(date, (map.get(date) ?? 0) + count)
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  })()

  // Merge byDevice across all QRs
  const mergedByDevice = (() => {
    const map = new Map<string, number>()
    for (const { analytics: a } of items) {
      for (const { device, count } of a?.byDevice ?? []) {
        const key = device ?? 'Unknown'
        map.set(key, (map.get(key) ?? 0) + count)
      }
    }
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([device, count]) => ({ device, count }))
  })()

  // Merge byCountry across all QRs
  const mergedByCountry = (() => {
    const map = new Map<string, number>()
    for (const { analytics: a } of items) {
      for (const { country, count } of a?.byCountry ?? []) {
        const key = country ?? 'Unknown'
        map.set(key, (map.get(key) ?? 0) + count)
      }
    }
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([country, count]) => ({ country, count }))
  })()

  // Merge byOs + byBrowser
  const mergedByOs = (() => {
    const map = new Map<string, number>()
    for (const { analytics: a } of items) {
      for (const { os, count } of a?.byOs ?? []) {
        const key = os ?? 'Unknown'
        map.set(key, (map.get(key) ?? 0) + count)
      }
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => b - a).map(([os, count]) => ({ os, count }))
  })()

  const mergedByBrowser = (() => {
    const map = new Map<string, number>()
    for (const { analytics: a } of items) {
      for (const { browser, count } of a?.byBrowser ?? []) {
        const key = browser ?? 'Unknown'
        map.set(key, (map.get(key) ?? 0) + count)
      }
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => b - a).map(([browser, count]) => ({ browser, count }))
  })()

  if (loading) return <AnalyticsSkeleton />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Scan data across all your QR codes</p>
        </div>
        <div className="flex items-center gap-2">
          <RangeSelector value={range} onChange={(r) => { setRange(r); load(r) }} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV(items, range)}
            disabled={totalScans === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total scans" value={totalScans.toLocaleString()} sub={`in the last ${range === 'all' ? 'all time' : range}`} />
        <StatCard title="Active QR codes" value={activeQRs} sub={`of ${items.length} total`} />
        <StatCard
          title="Top QR code"
          value={topQR?.analytics?.total ? `${topQR.analytics.total} scans` : '—'}
          sub={topQR?.qr.name}
        />
      </div>

      {/* Scans over time — aggregate */}
      <ScansOverTime data={mergedByDay} title="All QR codes — scans over time" />

      {/* Device + Country row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DeviceDonut data={mergedByDevice} />
        <CountryBar  data={mergedByCountry} />
      </div>

      {/* OS + Browser */}
      <OsBrowserBar osData={mergedByOs} browserData={mergedByBrowser} />

      {/* Per-QR drilldown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per QR code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No QR codes yet.</p>
              <Link href="/dashboard/qr-codes">
                <Button size="sm">Create a QR code</Button>
              </Link>
            </div>
          ) : (
            items
              .sort((a, b) => (b.analytics?.total ?? 0) - (a.analytics?.total ?? 0))
              .map(({ qr, analytics: a }) => (
                <div key={qr.id}>
                  <button
                    className="flex w-full items-center justify-between px-6 py-3 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => setExpanded(expanded === qr.id ? null : qr.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={qr.isActive ? 'default' : 'secondary'} className="text-xs">
                        {qr.isActive ? 'Active' : 'Paused'}
                      </Badge>
                      <span className="font-medium">{qr.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">/r/{qr.shortCode}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{(a?.total ?? 0).toLocaleString()} scans</span>
                      <span className="text-muted-foreground">{expanded === qr.id ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expanded === qr.id && a && (
                    <div className="grid gap-4 border-t border-border bg-muted/20 p-4 md:grid-cols-2">
                      <ScansOverTime data={a.byDay} title={`${qr.name} — daily scans`} />
                      <div className="grid gap-4">
                        <DeviceDonut data={a.byDevice} />
                        <CountryBar  data={a.byCountry} limit={5} />
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <Skeleton className="h-60 rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  )
}
