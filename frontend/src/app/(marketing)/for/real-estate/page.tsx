import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'QR Codes for Real Estate',
  description:
    'Create dynamic QR codes for yard signs and property listings. Update the listing link without replacing the sign. Track drive-by interest.',
}

const FEATURES = [
  { icon: '🏠', title: 'Update listings without reprinting', body: 'Property details change. Update the destination URL and the sign QR keeps redirecting.' },
  { icon: '🚗', title: 'Track drive-by interest', body: 'See how many potential buyers scanned your yard sign, when, and from which device.' },
  { icon: '📱', title: 'Works after dark', body: 'QR codes work 24/7. Drive-bys can self-serve your listing any time — even at 2am.' },
]

export default function RealEstatePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-16 text-center">
        <div className="mb-4 text-5xl">🏠</div>
        <h1 className="text-4xl font-bold tracking-tight">QR Codes for Real Estate</h1>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Yard signs that work after dark — drive-bys self-serve listings any time.
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
        <h2 className="text-2xl font-bold">Turn every sign into a lead machine</h2>
        <p className="text-muted-foreground">Free for your first 3 dynamic QR codes.</p>
        <Link href="/signup"><Button size="lg">Create your listing QR →</Button></Link>
      </div>
    </div>
  )
}
