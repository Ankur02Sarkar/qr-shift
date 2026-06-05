'use client'

import { useState } from 'react'
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

interface CreateQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (qr: QrCode) => void
}

export function CreateQRDialog({ open, onOpenChange, onCreated }: CreateQRDialogProps) {
  const [name, setName] = useState('')
  const [destUrl, setDestUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.qr.create({ name: name.trim(), destUrl: destUrl.trim() })
      onCreated(data)
      onOpenChange(false)
      setName('')
      setDestUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QR code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New QR code</DialogTitle>
          <DialogDescription>
            Give your QR code a name and enter the destination URL. You can change the URL anytime after printing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-name">Name</Label>
            <Input
              id="qr-name"
              placeholder="e.g. Restaurant Menu, Event Flyer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qr-url">Destination URL</Label>
            <Input
              id="qr-url"
              type="url"
              placeholder="https://example.com"
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
              {loading ? 'Creating...' : 'Create QR code'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
