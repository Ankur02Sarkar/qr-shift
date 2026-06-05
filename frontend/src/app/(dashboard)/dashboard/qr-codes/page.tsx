'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { QrCode } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateQRDialog } from '@/components/qr/create-qr-dialog'
import { DeleteQRDialog } from '@/components/qr/delete-qr-dialog'
import { EditDestDialog } from '@/components/qr/edit-dest-dialog'
import { QrCodeIcon, AnalyticsIcon, SettingsIcon, LogoutIcon } from '@/components/ui/icons'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8787'

export default function QRCodesPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<QrCode[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<QrCode | null>(null)
  const [editTarget, setEditTarget] = useState<QrCode | null>(null)

  const load = useCallback(async () => {
    try {
      const { data } = await api.qr.list()
      setCodes(data)
    } catch {
      // handled silently — user sees empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleCreated(qr: QrCode) {
    setCodes((prev) => [qr, ...prev])
  }

  function handleDeleted() {
    if (deleteTarget) {
      setCodes((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    }
  }

  function handleUpdated(updated: QrCode) {
    setCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">QR Codes</h1>
          <p className="text-sm text-muted-foreground">Manage your dynamic QR codes</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          + New QR code
        </Button>
      </div>

      {loading ? (
        <QRTableSkeleton />
      ) : codes.length === 0 ? (
        <EmptyState onNew={() => setCreateOpen(true)} />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Short link</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((qr) => (
                <TableRow key={qr.id} className="group">
                  <TableCell>
                    <Link
                      href={`/dashboard/qr-codes/${qr.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {qr.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`${BACKEND_URL}/r/${qr.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      /r/{qr.shortCode}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <span className="text-sm text-muted-foreground" title={qr.destUrl}>
                      {qr.destUrl}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr.isActive ? 'default' : 'secondary'}>
                      {qr.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(qr.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Edit destination"
                        onClick={() => setEditTarget(qr)}
                      >
                        <SettingsIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="View details & style"
                        onClick={() => router.push(`/dashboard/qr-codes/${qr.id}`)}
                      >
                        <QrCodeIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete"
                        onClick={() => setDeleteTarget(qr)}
                      >
                        <LogoutIcon className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateQRDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      {deleteTarget && (
        <DeleteQRDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          qrId={deleteTarget.id}
          qrName={deleteTarget.name}
          onDeleted={handleDeleted}
        />
      )}

      {editTarget && (
        <EditDestDialog
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          qr={editTarget}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <QrCodeIcon className="size-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">No QR codes yet</p>
        <p className="text-sm text-muted-foreground">Create your first dynamic QR code to get started.</p>
      </div>
      <Button onClick={onNew}>Create QR code</Button>
    </div>
  )
}

function QRTableSkeleton() {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Short link</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
