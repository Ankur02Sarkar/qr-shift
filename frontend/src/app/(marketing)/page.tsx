import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">QR-Shift</h1>
      <p className="max-w-md text-muted-foreground">
        Dynamic QR codes with scan analytics, campaign tracking, and editable destinations.
      </p>
      <div className="flex gap-4">
        <Link href="/signup">
          <Button>Get started free</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Sign in</Button>
        </Link>
      </div>
    </div>
  )
}
