'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import type { QrCode } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Stats {
  total: number
  active: number
  totalScans: number
}

export default function DashboardPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const [codes, setCodes] = useState<QrCode[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await api.qr.list()
        setCodes(data)

        // Aggregate scan counts across all QR codes
        let totalScans = 0
        await Promise.all(
          data.map(async (qr) => {
            try {
              const { data: a } = await api.analytics.get(qr.id)
              totalScans += a.total
            } catch {
              // ignore per-QR analytics errors
            }
          }),
        )

        setStats({
          total: data.length,
          active: data.filter((q) => q.isActive).length,
          totalScans,
        })
      } catch {
        setStats({ total: 0, active: 0, totalScans: 0 })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (sessionPending || loading) return <DashboardSkeleton />

  const recentCodes = codes.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s an overview of your QR codes.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalScans ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.active ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent QR codes or empty state */}
      {codes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-center text-muted-foreground">
              You haven&apos;t created any QR codes yet.
            </p>
            <Link href="/dashboard/qr-codes">
              <Button>Create your first QR code</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent QR codes</CardTitle>
            <Link href="/dashboard/qr-codes">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentCodes.map((qr) => (
              <Link
                key={qr.id}
                href={`/dashboard/qr-codes/${qr.id}`}
                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{qr.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">/r/{qr.shortCode}</p>
                </div>
                <Badge variant={qr.isActive ? 'default' : 'secondary'} className="ml-auto">
                  {qr.isActive ? 'Active' : 'Paused'}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
