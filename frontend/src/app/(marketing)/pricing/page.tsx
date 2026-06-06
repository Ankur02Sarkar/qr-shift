import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'QR-Shift pricing: Free forever for static QR codes. Pro at $9/month for dynamic QRs with analytics. Agency at $49/month for teams.',
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Start small, no card',
    cta: 'Start free',
    ctaHref: '/signup',
    highlight: false,
    features: [
      'Unlimited static QR codes',
      '3 dynamic QR codes',
      '7-day analytics retention',
      'PNG / SVG / PDF poster export',
      'Custom colours & logo',
    ],
    missing: ['UTM builder', 'Priority support', 'Client folders', 'Team seats'],
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/ month',
    desc: 'For independent businesses',
    cta: 'Upgrade to Pro',
    ctaHref: '/signup',
    highlight: true,
    features: [
      '100 dynamic QR codes',
      '365-day analytics retention',
      'All poster templates',
      'UTM builder',
      'Priority email support',
      'CSV export',
    ],
    missing: ['Client folders', 'Team seats', 'Custom domains'],
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/ month',
    desc: 'For multi-client teams',
    cta: 'Upgrade to Agency',
    ctaHref: '/signup',
    highlight: false,
    features: [
      '500 dynamic QR codes',
      '365-day analytics retention',
      'All poster templates',
      'UTM builder',
      'Client folders / projects',
      'Team seats & invitations',
      'Custom domains',
      'Priority support',
    ],
    missing: [],
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when your campaigns scale.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={
              'flex flex-col rounded-2xl border p-8 ' +
              (plan.highlight
                ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20'
                : 'border-border bg-card shadow-xs')
            }
          >
            {plan.highlight && (
              <div className="mb-4 inline-block self-start rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                Most popular
              </div>
            )}
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <Link href={plan.ctaHref} className="mt-6">
              <Button
                className="w-full"
                variant={plan.highlight ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </Link>
            <ul className="mt-8 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-primary">✓</span>
                  {f}
                </li>
              ))}
              {plan.missing.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                  <span className="mt-0.5">✗</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        All plans include SSL, Cloudflare edge delivery, and uptime SLA.
        Questions?{' '}
        <a href="mailto:hello@qr-shift.dev" className="underline underline-offset-4 hover:text-foreground">
          Contact us
        </a>
      </p>
    </div>
  )
}
