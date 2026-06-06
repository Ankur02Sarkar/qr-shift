import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'QR-Shift — Trackable QR Campaigns',
  description:
    'Create dynamic QR codes for menus, flyers, and business cards. Edit the link after printing. See scans by day, city, and device. Free to start.',
  openGraph: {
    title: 'QR-Shift — Trackable QR Campaigns',
    description: 'Create dynamic QR codes for menus, flyers, and business cards. Edit the link after printing.',
  },
}

const FEATURES = [
  {
    icon: '✏️',
    title: 'Edit links after printing',
    body: 'Dynamic QR codes redirect through your short link. Change the destination anytime — the printed QR keeps working.',
  },
  {
    icon: '📊',
    title: 'Real scan analytics',
    body: 'See scans by day, country, city, device, and browser. Export to CSV. Privacy-friendly.',
  },
  {
    icon: '🎨',
    title: 'Branded QR codes',
    body: 'Custom colours, dot styles, corner shapes, and logo. Download as PNG, SVG, or PDF poster.',
  },
]

const STEPS = [
  { step: '01', title: 'Create', body: 'Give your QR code a name and paste the destination URL.' },
  { step: '02', title: 'Print', body: 'Download as PNG, SVG, or PDF and print at any size.' },
  { step: '03', title: 'Track', body: 'Watch scans roll in by day, country, and device — in real time.' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Open source · Built in public on X
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          QR campaigns<br />
          <span className="text-primary">that don&apos;t die</span> after printing
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Create dynamic QR codes for menus, flyers, posters and business cards.
          Edit the link after printing. See scans by day, city and device.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="px-8">Generate a QR code free</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="px-8">See pricing</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required. Static QR codes are free forever.
        </p>
      </section>

      {/* Features */}
      <section className="border-y border-border/60 bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Everything you need
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">How it works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {s.step}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-y border-border/60 bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">Simple pricing</h2>
          <p className="mb-10 text-muted-foreground">Start free. Upgrade when your campaigns scale.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: 'Free', price: '$0', desc: '3 dynamic QRs, 7-day analytics' },
              { name: 'Pro',  price: '$9/mo', desc: '100 dynamic QRs, 365-day analytics', highlight: true },
              { name: 'Agency', price: '$49/mo', desc: '500 QRs, client folders, team seats' },
            ].map((p) => (
              <div
                key={p.name}
                className={
                  'rounded-xl border p-6 text-center space-y-2 ' +
                  (p.highlight
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card shadow-xs')
                }
              >
                <p className="font-semibold">{p.name}</p>
                <p className="text-2xl font-bold">{p.price}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/pricing">
              <Button variant="outline">See full pricing →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          Start tracking in 60 seconds
        </h2>
        <p className="mt-4 text-muted-foreground">
          Free forever for static QRs. No credit card required.
        </p>
        <div className="mt-8">
          <Link href="/signup">
            <Button size="lg" className="px-10">Create your first QR code</Button>
          </Link>
        </div>
      </section>
    </>
  )
}
