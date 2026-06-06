import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Phase 1 shipped — Foundation & Auth',
  description: 'Next.js 16 on Cloudflare Workers, Better Auth, Drizzle ORM, D1.',
}

export default function Phase1Post() {
  return (
    <article className="mx-auto max-w-2xl px-6 py-16 space-y-8">
      <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground">← Changelog</Link>

      <div className="space-y-2">
        <time className="text-sm text-muted-foreground">2026-06-05</time>
        <h1 className="text-3xl font-bold tracking-tight">Phase 1 shipped — Foundation & Auth</h1>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <p className="text-muted-foreground">The foundation is live. You can sign up, sign in, and reach a protected dashboard.</p>

        <h2 className="text-lg font-semibold mt-8">Stack</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li><strong>Next.js 16.2</strong> with App Router, deployed via <code className="bg-muted px-1 rounded">@opennextjs/cloudflare</code></li>
          <li><strong>Cloudflare Workers</strong> — edge runtime, global</li>
          <li><strong>Cloudflare D1</strong> — SQLite at the edge, shared between frontend and backend</li>
          <li><strong>Better Auth</strong> — email/password, session cookies, D1 adapter</li>
          <li><strong>Drizzle ORM</strong> — type-safe D1 queries</li>
          <li><strong>Tailwind v4</strong> + <strong>shadcn <code className="bg-muted px-1 rounded">base-maia</code></strong> — CSS-first design system</li>
          <li><strong>next-themes</strong> — dark/light mode</li>
        </ul>

        <h2 className="text-lg font-semibold mt-8">Auth flow</h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
          <li>User signs up → Better Auth writes to D1 <code className="bg-muted px-1 rounded">users</code> + <code className="bg-muted px-1 rounded">sessions</code> tables</li>
          <li>Session cookie set (<code className="bg-muted px-1 rounded">better-auth.session_token</code>, <code className="bg-muted px-1 rounded">SameSite=None; Secure</code> in production)</li>
          <li>Middleware checks cookie presence at the edge — no DB call</li>
          <li>Protected routes redirect to <code className="bg-muted px-1 rounded">/login</code> if no cookie</li>
        </ol>

        <h2 className="text-lg font-semibold mt-8">Gotchas discovered</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li><code className="bg-muted px-1 rounded">betterAuth()</code> cannot be called at module scope — must use a lazy singleton (<code className="bg-muted px-1 rounded">getAuth()</code>)</li>
          <li><code className="bg-muted px-1 rounded">middleware.ts</code> must keep the <code className="bg-muted px-1 rounded">middleware</code> export name for OpenNext Cloudflare builds</li>
          <li>Better Auth adds <code className="bg-muted px-1 rounded">__Secure-</code> prefix to cookie names in HTTPS — middleware must check both</li>
          <li><code className="bg-muted px-1 rounded">workers.dev</code> is a public suffix — cookies don&apos;t cross subdomains; use Bearer header instead</li>
        </ul>
      </div>
    </article>
  )
}
