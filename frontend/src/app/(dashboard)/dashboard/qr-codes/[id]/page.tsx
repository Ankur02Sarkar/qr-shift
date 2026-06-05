'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { QrCode } from '@/lib/api'
import { QRPreview } from '@/components/qr/qr-preview'
import type { QROptions } from '@/components/qr/qr-preview'
import { QRStyleEditor } from '@/components/qr/qr-style-editor'
import { DownloadButtons } from '@/components/qr/download-buttons'
import { EditDestDialog } from '@/components/qr/edit-dest-dialog'
import { DeleteQRDialog } from '@/components/qr/delete-qr-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardIcon, SettingsIcon, LogoutIcon } from '@/components/ui/icons'
import type QRCodeStyling from 'qr-code-styling'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8787'

const DEFAULT_OPTIONS: Omit<QROptions, 'data'> = {
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  foreground: '#000000',
  background: '#ffffff',
  logo: null,
}

export default function QRDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [qr, setQr] = useState<QrCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<{ total: number } | null>(null)
  const [options, setOptions] = useState<QROptions>({
    ...DEFAULT_OPTIONS,
    data: '',
  })
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toggling, setToggling] = useState(false)
  const qrInstanceRef = useRef<QRCodeStyling | null>(null)

  const load = useCallback(async () => {
    try {
      const [qrResult, analyticsResult] = await Promise.allSettled([
        api.qr.get(id),
        api.analytics.get(id),
      ])

      if (qrResult.status !== 'fulfilled') {
        router.replace('/dashboard/qr-codes')
        return
      }

      const qrData = qrResult.value.data
      setQr(qrData)
      setOptions((prev) => ({
        ...prev,
        data: `${BACKEND_URL}/r/${qrData.shortCode}`,
      }))

      if (analyticsResult.status === 'fulfilled') {
        setAnalytics({ total: analyticsResult.value.data.total })
      }
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { load() }, [load])

  async function handleToggleActive() {
    if (!qr) return
    setToggling(true)
    try {
      const { data } = await api.qr.update(qr.id, { isActive: !qr.isActive })
      setQr(data)
    } finally {
      setToggling(false)
    }
  }

  if (loading) return <QRDetailSkeleton />
  if (!qr) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push('/dashboard/qr-codes')}>
            <DashboardIcon className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{qr.name}</h1>
              <Badge variant={qr.isActive ? 'default' : 'secondary'}>
                {qr.isActive ? 'Active' : 'Paused'}
              </Badge>
            </div>
            <a
              href={`${BACKEND_URL}/r/${qr.shortCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              /r/{qr.shortCode}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
            disabled={toggling}
          >
            {toggling ? 'Updating...' : qr.isActive ? 'Pause' : 'Activate'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <SettingsIcon className="mr-1.5 size-3.5" />
            Edit destination
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
            <LogoutIcon className="mr-1.5 size-3.5 text-destructive" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left — QR preview + downloads */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              {/* data-qr-canvas wrapper used by download-buttons PDF export */}
              <div data-qr-canvas>
                <QRPreview options={options} size={280} qrRef={qrInstanceRef} />
              </div>
              <DownloadButtons qrInstance={qrInstanceRef.current} name={qr.name} />
            </CardContent>
          </Card>

          {/* Stats mini-card */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total scans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{analytics?.total ?? '—'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">Destination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="truncate text-sm text-muted-foreground" title={qr.destUrl}>
                  {qr.destUrl}
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            View full analytics on the{' '}
            <Link href="/dashboard/analytics" className="underline hover:text-foreground">
              Analytics page
            </Link>
          </p>
        </div>

        {/* Right — Style editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customise style</CardTitle>
          </CardHeader>
          <CardContent>
            <QRStyleEditor options={options} onChange={setOptions} />
          </CardContent>
        </Card>
      </div>

      <EditDestDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        qr={qr}
        onUpdated={(updated) => {
          setQr(updated)
          setOptions((prev) => ({ ...prev, data: `${BACKEND_URL}/r/${updated.shortCode}` }))
        }}
      />

      <DeleteQRDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        qrId={qr.id}
        qrName={qr.name}
        onDeleted={() => router.push('/dashboard/qr-codes')}
      />
    </div>
  )
}

function QRDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  )
}
