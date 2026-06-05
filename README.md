# QR-Shift

**Dynamic QR codes with scan analytics, campaign tracking, and editable destinations — built for the edge.**

A full-stack, open-source alternative to QRLagoon. Create dynamic QR codes, edit the destination after printing, and track scans by day, device, country, and campaign.

<picture><img alt="Plan Overview" src="Plan.png" width="800"></picture>

## Architecture

```
qr-shift/
├── frontend/     ← Next.js 16 UI (App Router, Better Auth, Tailwind v4)
├── backend/      ← Hono v4 API (separate Cloudflare Worker)
└── Plan.png      ← visual roadmap
```

Two separate Cloudflare Workers, one shared D1 database.

| Layer | Stack | Deployment |
|---|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind v4, Better Auth, Drizzle ORM | https://qr-shift.ankur02sarkar.workers.dev |
| **Backend API** | Hono v4, Drizzle ORM, nanoid | https://qr-shift-api.ankur02sarkar.workers.dev |
| **Database** | Cloudflare D1 (SQLite at edge) — `qr-shift-db` | Shared by both Workers |
| **Auth** | Better Auth (email/password, session cookie + Bearer token) | Sessions stored in D1 |
| **Billing** | Stripe (Phase 6) | Webhooks → D1 |

## Build Plan

| Phase | Focus | Status |
|---|---|---|
| 1 | Foundation & Auth (DB schema, Better Auth, auth pages, proxy, dashboard shell) | ✅ Complete |
| 2 | Hono API (QR CRUD, redirect + scan logging, analytics) | ✅ Complete |
| 3 | QR Code UI (create/style/export, qr-code-styling, API client) | ⏳ Not started |
| 4 | Analytics Dashboard (charts, CSV export, campaign grouping) | ⏳ Not started |
| 5 | Marketing Site (landing, pricing, free generator, SEO, OG) | ⏳ Not started |
| 6 | Billing & Launch (Stripe, plan limits, deploy, monitoring) | ⏳ Not started |

### Phase 1 — Foundation & Auth ✅
- Cloudflare D1 database with Better Auth schema (users, sessions, accounts, verifications)
- Better Auth with D1 adapter, email/password, session cookie cache
- Auth pages: `/login`, `/signup` with dark/light mode
- Next.js proxy (`proxy.ts`) protecting `/dashboard`
- Dashboard shell with sidebar + theme toggle

### Phase 2 — Hono API ✅
- `GET/POST/PATCH/DELETE /qr` — QR code CRUD (auth via session cookie → D1 lookup)
- `GET /r/:code` — redirect with async scan logging (`waitUntil`)
- `GET /analytics/:qrId` — scans by day, country, device, OS, browser
- Lightweight UA parser (device/OS/browser, pure regex, no deps)
- Shared D1 — no JWT needed, session token validated directly against DB

### Phase 3 — QR Code UI _(next)_
- QR code list, create, edit pages in dashboard
- Client-side QR generation (`qr-code-styling`)
- Color/logo/frame customization
- PDF poster export

### Phase 4 — Analytics Dashboard
- Scans-over-time chart, country/device breakdowns
- Campaign grouping, UTM builder, CSV export

### Phase 5 — Marketing Site
- Landing page, pricing, free public QR generator, SEO pages

### Phase 6 — Billing & Launch
- Stripe checkout, plan limits, Cloudflare deploy, monitoring

## Tech Stack

| Tool | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [Hono v4](https://hono.dev/) | Edge API framework |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | SQLite at the edge |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe database access |
| [Better Auth](https://www.better-auth.com/) | Authentication (email/password + sessions) |
| [Tailwind v4](https://tailwindcss.com/) | CSS-first utility styling |
| [shadcn/ui](https://ui.shadcn.com/) | `base-maia` style on `@base-ui/react` |
| [nanoid](https://github.com/ai/nanoid) | Short code generation for QR redirects |
| [Stripe](https://stripe.com/) | Payment processing (Phase 6) |
| [OpenNext](https://opennext.js.org/) | Next.js on Cloudflare Workers |

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) — package manager
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) — Cloudflare CLI (installed via devDeps)
- A Cloudflare account

### Frontend

```bash
cd frontend
bun install
bun run dev          # http://localhost:3000
```

### Backend API

```bash
cd backend
bun install
bun run dev          # http://localhost:8787
```

> **Local dev note:** The backend reads from the same local D1 as the frontend.
> Its `dev` script uses `--persist-to ../frontend/.wrangler/state` to share state.

### Environment Files

**`frontend/.env.local`** (public vars only):
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8787
```

**`frontend/.dev.vars`** (Cloudflare Worker secrets — never commit):
```
NEXTJS_ENV=development
BETTER_AUTH_SECRET=<generate: openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000
```

**`backend/.dev.vars`** (Cloudflare Worker secrets — never commit):
```
ENVIRONMENT=development
```

### Database

Migrations are always run from `frontend/`:

```bash
cd frontend
bunx drizzle-kit generate                                  # generate migration SQL
npx wrangler d1 execute qr-shift-db --local --file=./drizzle/<migration>.sql  # apply locally
npx wrangler d1 execute qr-shift-db --remote --file=./drizzle/<migration>.sql # apply to prod
```

### Deploy

```bash
# Deploy frontend
cd frontend
bun run deploy       # builds + deploys to Cloudflare Workers (qr-shift)

# Deploy backend
cd backend
bun run deploy       # deploys to Cloudflare Workers (qr-shift-api)
```

## API Reference

Base URL (local): `http://localhost:8787`
Base URL (prod): `https://qr-shift-api.ankur02sarkar.workers.dev`

All authenticated routes require the `better-auth.session_token` cookie.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `GET` | `/qr` | ✅ | List user's QR codes |
| `POST` | `/qr` | ✅ | Create QR code `{ name, destUrl }` |
| `GET` | `/qr/:id` | ✅ | Get single QR code |
| `PATCH` | `/qr/:id` | ✅ | Update `name`, `destUrl`, `isActive` |
| `DELETE` | `/qr/:id` | ✅ | Delete QR code (cascades scans) |
| `GET` | `/r/:code` | — | Redirect → destination URL (logs scan) |
| `GET` | `/analytics/:qrId` | ✅ | Scan aggregations by day/country/device/OS/browser |

## License

MIT — build, fork, ship.
