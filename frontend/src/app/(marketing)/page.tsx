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
        <Button asChild>
          <Link href="/signup">Get started free</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}
