import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'QR Codes for Restaurants & Cafés',
  description:
    'Create dynamic QR codes for your restaurant menu. Update prices and dishes without reprinting. Track scans by table and time of day.',
}

const FEATURES = [
  { icon: '🍽️', title: 'Always up-to-date menu', body: 'Change dishes, prices, or specials in seconds — the printed QR on the table keeps working.' },
  { icon: '📊', title: 'Table-level insights', body: 'See which tables scan most, what times are busiest, and which menu sections drive the most traffic.' },
  { icon: '📄', title: 'Print-ready PDF posters', body: 'One-click A4 poster with your QR code and branding. Place on tables, walls, or windows.' },
]

export default function RestaurantsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-16 text-center">
        <div className="mb-4 text-5xl">🍽️</div>
        <h1 className="text-4xl font-bold tracking-tight">QR Codes for Restaurants & Cafés</h1>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Table tents that always show the latest menu and prices.
          No reprinting, no downtime.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/signup"><Button>Start free</Button></Link>
          <Link href="/qr-generator"><Button variant="outline">Try the generator</Button></Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="text-3xl">{f.icon}</div>
            <h2 className="font-semibold">{f.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to modernise your menu?</h2>
        <p className="text-muted-foreground">Free for your first 3 dynamic QR codes. No credit card.</p>
        <Link href="/signup"><Button size="lg">Create your menu QR →</Button></Link>
      </div>
    </div>
  )
}
