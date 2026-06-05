'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { QrCode } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EditDestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qr: QrCode
  onUpdated: (qr: QrCode) => void
}

export function EditDestDialog({ open, onOpenChange, qr, onUpdated }: EditDestDialogProps) {
  const [destUrl, setDestUrl] = useState(qr.destUrl)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDestUrl(qr.destUrl)
    setError('')
  }, [qr.destUrl, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.qr.update(qr.id, { destUrl: destUrl.trim() })
      onUpdated(data)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit destination</DialogTitle>
          <DialogDescription>
            Update where &ldquo;{qr.name}&rdquo; redirects to. The printed QR code will keep working — it just points to the new URL.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dest-url">Destination URL</Label>
            <Input
              id="dest-url"
              type="url"
              value={destUrl}
              onChange={(e) => setDestUrl(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
