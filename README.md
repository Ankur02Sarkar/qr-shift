# QR-Shift

**Dynamic QR codes with scan analytics, campaign tracking, and editable destinations — built for the edge.**

A full-stack, open-source alternative to QRLagoon. Create dynamic QR codes, edit the destination after printing, and track scans by day, device, country, and campaign.

<picture><img alt="Plan Overview" src="Plan.png" width="800"></picture>

## Architecture

```
qr-shift/
├── frontend/     ← Next.js 16 UI (App Router, Better Auth, Tailwind v4)
├── backend/      ← Hono + D1 API (separate Cloudflare Worker) — coming soon
└── Plan.png      ← visual roadmap
```

| Layer | Stack | Deployment |
|---|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind v4, Better Auth, Drizzle ORM | Cloudflare Workers (via OpenNext) |
| **Backend** | Hono v4, Drizzle ORM | Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite at edge) | Durable across both workers |
| **Auth** | Better Auth (email/password + JWT) | Shared D1 + JWT tokens |
| **Billing** | Stripe (Phase 6) | Webhooks → D1 |

## Build Plan

The project ships in 6 phases. See the [tldraw plan](/Users/ankur/Documents/QRShift%20Build%20Plan.tldr) for the full visual roadmap.

### Phase 1 — Foundation & Auth
- Drizzle schema (users, sessions, accounts, verifications)
- Better Auth with D1 adapter + JWT plugin
- Auth pages (login, signup, forgot-password)
- Route middleware (protect `/dashboard`)
- Dashboard shell

### Phase 2 — Hono API (separate repo)
- Hono Worker scaffold with D1
- JWT middleware for request auth
- QR codes CRUD routes
- Short code redirect (`/r/:code`) with scan logging
- Analytics read routes (group by day, device, country)

### Phase 3 — QR Code UI
- QR code list, create, and edit pages
- Client-side QR generation (`qr-code-styling`)
- Style customization (colors, logo, frames)
- PDF poster export
- Typed API client (`src/lib/api.ts`)

### Phase 4 — Analytics Dashboard
- Scans-over-time chart
- Breakdowns by country, city, device, OS, browser
- Campaign grouping and UTM builder
- CSV export

### Phase 5 — Marketing Site
- Landing page, pricing page
- Free public QR generator (drives signups)
- SEO pages (industry-specific solutions)
- OG tags for X sharing

### Phase 6 — Billing & Launch
- Stripe checkout + customer portal + webhooks
- Plan limits enforcement (Free: 3 dynamic QRs / Pro: 100 / Agency: 500)
- Cloudflare deploy with custom domain
- Monitoring and error tracking

## Tech Stack

| Tool | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [Hono v4](https://hono.dev/) | Edge API framework |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | SQLite at the edge |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe database access |
| [Better Auth](https://www.better-auth.com/) | Authentication + JWT |
| [Tailwind v4](https://tailwindcss.com/) | Utility-first CSS |
| [Stripe](https://stripe.com/) | Payment processing |
| [OpenNext](https://opennext.js.org/) | Next.js on Cloudflare Workers |

## Getting Started

```bash
# Frontend
cd frontend
bun install
bun run dev

# Backend (when ready)
cd backend
# TODO: scaffold Hono Worker
```

## License

MIT — build, fork, ship.
