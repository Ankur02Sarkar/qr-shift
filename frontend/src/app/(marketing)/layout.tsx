import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-base font-semibold tracking-tight">
              QR-Shift
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <Link href="/qr-generator" className="hover:text-foreground transition-colors">Generator</Link>
              <Link href="/pricing"      className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/changelog"    className="hover:text-foreground transition-colors">Changelog</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-3">
              <p className="font-semibold">QR-Shift</p>
              <p className="text-sm text-muted-foreground">
                Dynamic QR codes with scan analytics. Open source.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/qr-generator" className="hover:text-foreground">Generator</Link></li>
                <li><Link href="/pricing"      className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/login"        className="hover:text-foreground">Sign in</Link></li>
                <li><Link href="/signup"       className="hover:text-foreground">Get started</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Solutions</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/for/restaurants" className="hover:text-foreground">Restaurants</Link></li>
                <li><Link href="/for/real-estate" className="hover:text-foreground">Real Estate</Link></li>
                <li><Link href="/for/salons"      className="hover:text-foreground">Salons</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Project</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/changelog" className="hover:text-foreground">Changelog</Link></li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} QR-Shift. Open source — MIT licence.
          </div>
        </div>
      </footer>
    </div>
  )
}
