import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Phase 3 shipped — QR Code UI',
  description: 'Full QR code creation, style editor, and download buttons live.',
}

export default function Phase3Post() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16 space-y-8">
      <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground">← Changelog</Link>

      <div className="space-y-2">
        <time className="text-sm text-muted-foreground">2026-06-05</time>
        <h1 className="text-3xl font-bold tracking-tight">Phase 3 shipped — QR Code UI</h1>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
        <p className="text-muted-foreground">Phase 3 is complete. Here is everything that shipped.</p>

        <h2 className="text-lg font-semibold mt-8">QR code list <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/dashboard/qr-codes</code></h2>
        <p className="text-muted-foreground">A table view of all QR codes with name, short link, destination, status badge, and created date. Row hover reveals quick actions: edit destination, view detail, delete.</p>

        <h2 className="text-lg font-semibold mt-8">QR code detail <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/dashboard/qr-codes/[id]</code></h2>
        <p className="text-muted-foreground">Two-column layout: live QR preview (updates in real time as you style it) + download buttons on the left; style editor on the right.</p>

        <h2 className="text-lg font-semibold mt-8">Style options</h2>
        <p className="text-muted-foreground">Powered by <code className="text-xs bg-muted px-1.5 py-0.5 rounded">qr-code-styling</code>: dot type (Square, Dots, Rounded, Classy, Extra Rounded), corner square and dot styles, foreground/background colour pickers, logo upload embedded in centre.</p>

        <h2 className="text-lg font-semibold mt-8">Download formats</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><strong>PNG</strong> — raster, any size</li>
          <li><strong>SVG</strong> — vector, infinitely scalable</li>
          <li><strong>PDF</strong> — A4 poster with name and branding</li>
        </ul>

        <h2 className="text-lg font-semibold mt-8">Edit destination</h2>
        <p className="text-muted-foreground">Update where the QR redirects without reprinting. The short link stays the same — only the destination changes.</p>

        <h2 className="text-lg font-semibold mt-8">What&apos;s next</h2>
        <p className="text-muted-foreground">Phase 4 — Analytics Dashboard: recharts charts, date range filtering, per-QR drilldown, CSV export.</p>
      </div>
    </article>
  )
}
