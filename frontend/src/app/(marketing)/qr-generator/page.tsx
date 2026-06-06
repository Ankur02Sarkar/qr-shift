'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { QRPreview } from '@/components/qr/qr-preview'
import type { QROptions } from '@/components/qr/qr-preview'
import { QRStyleEditor } from '@/components/qr/qr-style-editor'
import { DownloadButtons } from '@/components/qr/download-buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type QRCodeStyling from 'qr-code-styling'

const DEFAULT: QROptions = {
  data:              'https://qr-shift.dev',
  dotType:           'rounded',
  cornerSquareType:  'extra-rounded',
  cornerDotType:     'dot',
  foreground:        '#000000',
  background:        '#ffffff',
  logo:              null,
}

// Metadata can't be exported from a 'use client' component.
// A sibling layout.tsx handles metadata for this route.

export default function QRGeneratorPage() {
  const [url, setUrl]         = useState('https://')
  const [options, setOptions] = useState<QROptions>(DEFAULT)
  const qrRef = useRef<QRCodeStyling | null>(null)

  const liveOptions: QROptions = { ...options, data: url || 'https://qr-shift.dev' }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Free QR Code Generator</h1>
        <p className="mt-3 text-muted-foreground">
          Create a styled QR code instantly — no account needed.
          Sign up to track scans.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left — URL input + style editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Destination URL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="gen-url">URL</Label>
                <Input
                  id="gen-url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Style</CardTitle>
            </CardHeader>
            <CardContent>
              <QRStyleEditor options={options} onChange={setOptions} />
            </CardContent>
          </Card>
        </div>

        {/* Right — preview + download */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-6">
              <div data-qr-canvas>
                <QRPreview options={liveOptions} size={280} qrRef={qrRef} />
              </div>
              <DownloadButtons qrInstance={qrRef.current} name="qr-code" />
            </CardContent>
          </Card>

          {/* Upsell */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-5 text-center space-y-3">
              <p className="font-medium">Want to track who scans this?</p>
              <p className="text-sm text-muted-foreground">
                Sign up free to make this a dynamic QR code — edit the URL anytime
                and see scans by day, country, and device.
              </p>
              <Link href="/signup">
                <Button size="sm">Create free account →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
