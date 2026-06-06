import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'QR Codes for Salons & Barbershops',
  description:
    'Create dynamic QR codes for your salon. Mirror stickers that book the next appointment. Track which services drive the most scans.',
}

const FEATURES = [
  { icon: '✂️', title: 'Mirror stickers that convert', body: 'Put a QR code on every mirror. Clients scan while in the chair and book their next appointment.' },
  { icon: '🔗', title: 'Update your booking link anytime', body: 'Switched booking platforms? Update the URL — the sticker QR keeps working.' },
  { icon: '📅', title: 'Track appointment intent', body: 'See how many clients scan, when they\'re most engaged, and which services they&apos;re looking at.' },
]

export default function SalonsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-16 text-center">
        <div className="mb-4 text-5xl">✂️</div>
        <h1 className="text-4xl font-bold tracking-tight">QR Codes for Salons & Barbershops</h1>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Mirror stickers that book the next appointment — automatically.
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
        <h2 className="text-2xl font-bold">Keep chairs full, automatically</h2>
        <p className="text-muted-foreground">Free for your first 3 dynamic QR codes.</p>
        <Link href="/signup"><Button size="lg">Create your salon QR →</Button></Link>
      </div>
    </div>
  )
}
