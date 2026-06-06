import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Follow the QR-Shift build — every phase shipped, documented publicly.',
}

const POSTS = [
  {
    slug:  'phase-3-qr-ui',
    date:  '2026-06-05',
    title: 'Phase 3 shipped — QR Code UI',
    desc:  'Full QR code creation, live style editor (dot shapes, colours, logo), PNG/SVG/PDF download, and analytics stat cards.',
  },
  {
    slug:  'phase-2-hono-api',
    date:  '2026-06-05',
    title: 'Phase 2 shipped — Hono API',
    desc:  'Complete Hono v4 backend on Cloudflare Workers: QR CRUD, short-link redirect with async scan logging, analytics aggregation.',
  },
  {
    slug:  'phase-1-auth',
    date:  '2026-06-05',
    title: 'Phase 1 shipped — Foundation & Auth',
    desc:  'Next.js 16 on Cloudflare Workers, Better Auth with D1, Drizzle ORM, login/signup pages, sidebar dashboard shell.',
  },
]

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
        <p className="mt-2 text-muted-foreground">
          Building QR-Shift in public. Every phase documented.
        </p>
      </div>

      <div className="space-y-10">
        {POSTS.map((post) => (
          <article key={post.slug} className="group border-l-2 border-border pl-6 space-y-1 hover:border-primary transition-colors">
            <time className="text-xs text-muted-foreground">{post.date}</time>
            <h2 className="font-semibold group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{post.desc}</p>
            <Link
              href={`/changelog/${post.slug}`}
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
