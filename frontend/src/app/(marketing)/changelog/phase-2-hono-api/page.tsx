import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Phase 2 shipped — Hono API',
  description: 'Complete Hono v4 backend on Cloudflare Workers.',
}

export default function Phase2Post() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16 space-y-8">
      <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground">← Changelog</Link>

      <div className="space-y-2">
        <time className="text-sm text-muted-foreground">2026-06-05</time>
        <h1 className="text-3xl font-bold tracking-tight">Phase 2 shipped — Hono API</h1>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <p className="text-muted-foreground">The backend is live. QR codes can be created, redirected, and tracked.</p>

        <h2 className="text-lg font-semibold mt-8">API routes</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Method</th>
                <th className="px-4 py-2 text-left font-medium">Path</th>
                <th className="px-4 py-2 text-left font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              {[
                ['GET', '/health', 'Health check'],
                ['GET', '/qr', "List user's QR codes"],
                ['POST', '/qr', 'Create QR code'],
                ['PATCH', '/qr/:id', 'Update destination or name'],
                ['DELETE', '/qr/:id', 'Delete QR code'],
                ['GET', '/r/:code', 'Redirect + async scan log'],
                ['GET', '/analytics/:qrId', 'Aggregated scan data'],
              ].map(([method, path, purpose]) => (
                <tr key={path}>
                  <td className="px-4 py-2 font-mono font-medium">{method}</td>
                  <td className="px-4 py-2 font-mono">{path}</td>
                  <td className="px-4 py-2">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-lg font-semibold mt-8">Auth</h2>
        <p className="text-muted-foreground">No JWT. The backend looks up the Better Auth session token directly in the shared D1 <code className="bg-muted px-1 rounded">sessions</code> table. Works cross-origin via <code className="bg-muted px-1 rounded">Authorization: Bearer</code> header.</p>

        <h2 className="text-lg font-semibold mt-8">Scan logging</h2>
        <p className="text-muted-foreground">The redirect handler uses <code className="bg-muted px-1 rounded">ctx.waitUntil()</code> to log scans asynchronously — the 302 redirect fires immediately without waiting for the D1 write.</p>

        <h2 className="text-lg font-semibold mt-8">UA parser</h2>
        <p className="text-muted-foreground">Pure regex, ~40 lines, no external dependency. Detects device (mobile/tablet/desktop), OS, and browser.</p>
      </div>
    </article>
  )
}
