# QR-Shift — Agent Context

> **CRITICAL:** Read this file completely before making any changes. It is the authoritative context for the entire codebase.

*Last updated: 2026-06-05 — Phase 2 (Hono API) complete*

---

## Project Overview

QR-Shift is an open-source, full-stack SaaS replicating [QRLagoon](https://qrlagoon.com). Built in public, shared on X. Users create dynamic QR codes, edit destinations after printing, and track scans by day, device, country, and campaign.

**Two separate Cloudflare Workers, one shared D1 database.**

---

## Repo Structure

```
qr-shift/
├── frontend/                         ← Next.js 16 (primary workspace) — deploys to qr-shift
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css           ← Tailwind v4 + all CSS vars (single source of truth)
│   │   │   ├── layout.tsx            ← Root layout (Outfit font, ThemeProvider, TooltipProvider)
│   │   │   ├── (marketing)/page.tsx  ← Landing page
│   │   │   ├── (auth)/               ← login/, signup/ — centered card layout
│   │   │   ├── (dashboard)/          ← sidebar layout, protected by proxy.ts
│   │   │   │   └── dashboard/page.tsx
│   │   │   └── api/auth/[...all]/route.ts  ← Better Auth handler
│   │   ├── components/
│   │   │   ├── ui/                   ← shadcn components + icons.tsx (inline SVGs)
│   │   │   └── providers/theme-provider.tsx
│   │   └── lib/
│   │       ├── auth.ts               ← getAuth() lazy singleton (Better Auth server)
│   │       ├── auth-client.ts        ← authClient (Better Auth browser)
│   │       ├── api.ts                ← typed fetch client → Hono backend
│   │       └── db/
│   │           ├── schema.ts         ← ALL tables (source of truth for migrations)
│   │           └── index.ts          ← getDb() factory
│   ├── src/proxy.ts                  ← Next.js 16 proxy (was middleware.ts)
│   ├── drizzle/                      ← Generated migration SQL files
│   ├── drizzle.config.ts
│   ├── wrangler.jsonc                ← CF Worker config (has DB binding)
│   ├── next.config.ts                ← initOpenNextCloudflareForDev()
│   ├── .dev.vars                     ← Wrangler secrets (never commit)
│   └── .env.local                    ← NEXT_PUBLIC_* vars only
│
├── backend/                          ← Hono v4 Worker — deploys to qr-shift-api
│   ├── src/
│   │   ├── index.ts                  ← App root, CORS, /health, /r/:code redirect
│   │   ├── types.ts                  ← HonoEnv (Bindings + Variables)
│   │   ├── lib/
│   │   │   ├── db.ts                 ← getDb(env) factory
│   │   │   ├── schema.ts             ← Type-inference copy (NO migrations from here)
│   │   │   └── ua.ts                 ← Lightweight UA parser (device/OS/browser)
│   │   ├── middleware/auth.ts        ← requireAuth: session cookie → D1 lookup
│   │   └── routes/
│   │       ├── qr.ts                 ← QR CRUD routes
│   │       └── analytics.ts          ← Analytics aggregation routes
│   ├── wrangler.jsonc                ← name=qr-shift-api, nodejs_compat, D1 binding
│   ├── .dev.vars                     ← Wrangler secrets (never commit)
│   └── package.json                  ← dev script uses --persist-to ../frontend/.wrangler/state
│
├── Plan.png
└── README.md
```

---

## Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | Next.js 16.2.6, React 19, App Router | |
| Styling | Tailwind v4 (CSS-first) | No tailwind.config.js |
| UI | shadcn `base-maia` on `@base-ui/react` | NOT Radix UI |
| Icons | Inline SVGs in `src/components/ui/icons.tsx` | @hugeicons/react only exports `HugeiconsIcon` component — named icon exports come from `@hugeicons/core-free-icons` as ESM data arrays, incompatible with our usage. We use inline SVGs instead. |
| Font | Outfit (next/font/google) | Single font, no Geist/Figtree |
| Dark mode | next-themes, class-based | attribute="class" on `<html>` |
| Auth | Better Auth, drizzle adapter, session cookies | No JWT in Phase 1/2 |
| ORM | Drizzle ORM (drizzle-orm/d1) | |
| DB | Cloudflare D1 (SQLite at edge) | Shared: both Workers, one DB |
| Frontend deploy | Cloudflare Workers via @opennextjs/cloudflare | `cd frontend && bun run deploy` |
| Backend deploy | Cloudflare Workers (Hono v4) | `cd backend && bun run deploy` |
| Short codes | nanoid(8) | QR redirect short codes |
| Billing | Stripe | Phase 6 only |

---

## Critical Styling Rules

1. **Never hardcode color values** — use CSS vars from `globals.css`
2. Every new color must have both `:root` (light) and `.dark` equivalents in `oklch()`
3. In CSS: `var(--variable-name)`; in Tailwind: `bg-background`, `text-foreground`, etc.
4. Font: `font-sans` class (maps to `--font-sans: Outfit, ...`)
5. Base radius: `--radius: 1.4rem`. Use scale: `--radius-sm` → `--radius-4xl`
6. Shadows: `shadow-2xs` through `shadow-2xl`

### Tailwind v4 Differences
- No `tailwind.config.js` — config in `globals.css`
- `@custom-variant dark (&:is(.dark *))` already set
- No `content: [...]` arrays needed
- `tw-animate-css` imported for animations

---

## shadcn Rules

- Style: `base-maia` — `@base-ui/react` primitives (NOT Radix)
- Install: `npx shadcn@latest add <component>` from `frontend/`
- Do NOT install `@radix-ui/*` — conflicts with `@base-ui/react`
- Do NOT use `lucide-react`

### @base-ui/react Differences from Radix

- No `asChild` prop — use `render` prop instead:
  ```tsx
  // base-ui pattern
  <SidebarMenuButton render={<Link href="/dashboard" />}>...</SidebarMenuButton>
  ```
- `DropdownMenuTrigger` renders as `<button>` — never put a `<Button>` inside it (nested buttons). Use a `<div>` styled to look like a button instead.
- `Button` component does not support `asChild` — use `<Link><Button>text</Button></Link>` pattern.

---

## Cloudflare / Edge Runtime Rules

### 1 — Never instantiate at module scope

```ts
// ✅ CORRECT — inside handler
export function GET() {
  const { env } = getCloudflareContext()
  const db = drizzle(env.DB)
  ...
}

// ❌ WRONG — crashes at module load time
const db = drizzle(getCloudflareContext().env.DB)
```

### 2 — Better Auth lazy singleton

`betterAuth()` must NOT be called at module scope because it calls `getCloudflareContext()` internally. Use a lazy singleton:

```ts
let _auth: any
export function getAuth() {
  if (_auth) return _auth
  const { env } = getCloudflareContext()
  _auth = betterAuth({ ... })
  return _auth
}
```

Route handler must use per-method exports (not `toNextJsHandler` at module scope):
```ts
export function GET(req: NextRequest) { return getAuth().handler(req) }
export function POST(req: NextRequest) { return getAuth().handler(req) }
```

### 3 — Better Auth drizzle adapter options

D1 requires two non-default options:
```ts
drizzleAdapter(drizzle(env.DB), {
  provider: 'sqlite',
  schema,
  usePlural: true,    // our tables are plural: users, sessions, etc.
  transaction: false, // D1 does not support db.transaction()
})
```

The `database` option in `betterAuth` must be a **synchronous** factory `(options) => adapter(options)`. An async factory returns a Promise which Better Auth uses directly, causing `adapter.transaction is not a function`.

### 4 — proxy.ts not middleware.ts

Next.js 16 renamed middleware to "proxy". The file is `src/proxy.ts` and exports `proxy` (not `middleware`).

### 5 — Do not call auth in proxy

Cookie presence check only — no DB calls in `proxy.ts`:
```ts
const sessionCookie = request.cookies.get('better-auth.session_token')
```

### 6 — kysely must be pinned to 0.28.x

`better-auth` depends on `@better-auth/kysely-adapter` which is incompatible with kysely 0.29+ (exports were moved to `kysely/migration`). Pin in frontend:
```
"kysely": "0.28.2"
```

### 7 — Migrations always run from frontend/

The backend `schema.ts` is for type inference only. Never run `drizzle-kit` from `backend/`.

### 8 — Session token parsing in backend

Better Auth stores the raw token in D1 but the cookie value is `{token}.{hmac-signature}` (URL-encoded). Backend must strip the signature:
```ts
const token = decodeURIComponent(cookieValue).split('.')[0]
```

### 9 — Local dev: shared D1 state

In local dev, the backend must read the same SQLite file as the frontend. The backend's `dev` script uses:
```
wrangler dev --port 8787 --persist-to ../frontend/.wrangler/state
```

This points the backend at the frontend's local wrangler state, so session tokens created by the frontend auth are visible to the backend.

### 10 — waitUntil for non-blocking scan logging

```ts
// In /r/:code redirect handler:
c.executionCtx.waitUntil(logScan(db, qr.id, c.req.raw))
return c.redirect(qr.destUrl, 302)  // fires immediately
```

### 11 — Better Auth migrations

Do NOT use `npx auth migrate` — not supported on Workers. Use:
```bash
bunx drizzle-kit generate
npx wrangler d1 execute qr-shift-db --local --file=./drizzle/<file>.sql
```

### 12 — proxy.ts vs middleware.ts for OpenNext deploy

Next.js 16 renamed `middleware.ts` → `proxy.ts` and `middleware` export → `proxy`. However `@opennextjs/cloudflare` build detects `proxy.ts` as a Node.js middleware and **rejects it**. Keep the file as `middleware.ts` with the `middleware` export — OpenNext recognises it as an edge middleware and bundles it correctly. Next.js shows a deprecation warning in dev but it works.

### 13 — Cross-origin cookies: workers.dev is a public suffix

`qr-shift.workers.dev` and `qr-shift-api.workers.dev` are **different sites** because `workers.dev` is in the Public Suffix List. Browsers (and curl) will NOT send cookies cross-origin even with `SameSite=None; Secure`.

Solution: frontend API client extracts the raw token from the cookie and sends it as `Authorization: Bearer <token>`. Backend auth middleware accepts EITHER:
1. `Authorization: Bearer <token>` header (production cross-origin path)
2. `better-auth.session_token` cookie (local dev same-origin path)

```ts
// api.ts — read token from cookie, send as Bearer header
function getSessionToken() {
  const match = document.cookie.split('; ').find(c => c.startsWith('better-auth.session_token='))
  return decodeURIComponent(match.split('=')[1]).split('.')[0] // strip .{signature}
}
```

If you add a custom domain later where both frontend and backend share the same eTLD+1 (e.g. `app.qr-shift.com` + `api.qr-shift.com`), cookies will flow naturally and the Bearer header fallback can be removed.

### 14 — Better Auth __Secure- cookie prefix in production

Better Auth automatically prepends `__Secure-` to cookie names when running on HTTPS (production). The cookie becomes `__Secure-better-auth.session_token` instead of `better-auth.session_token`. Any code that reads this cookie **must check both names**:

```ts
// middleware.ts
const sessionCookie =
  request.cookies.get('__Secure-better-auth.session_token') ?? // prod (HTTPS)
  request.cookies.get('better-auth.session_token')             // dev (HTTP)

// backend auth middleware
const cookieValue =
  getCookie(c, '__Secure-better-auth.session_token') ??
  getCookie(c, 'better-auth.session_token')

// api.ts getSessionToken()
const match =
  cookies.find((c) => c.startsWith('__Secure-better-auth.session_token=')) ??
  cookies.find((c) => c.startsWith('better-auth.session_token='))
```

Failing to check both names causes an infinite redirect loop on login in production (middleware never sees the cookie → always redirects to /login).

### 15 — .env.production for Next.js build-time vars

`NEXT_PUBLIC_*` vars are baked into the JS bundle at **build time**, not runtime. Create `frontend/.env.production` with production values. This file is read automatically by Next.js during `bun run deploy` (which calls `next build`).

---

## Environment Variables

### frontend/.env.local (public, safe for browser)
| Variable | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Better Auth base URL |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8787` | Hono API base URL |

### frontend/.dev.vars (Cloudflare Worker secrets, never commit)
| Variable | Purpose |
|---|---|
| `NEXTJS_ENV` | `development` |
| `BETTER_AUTH_SECRET` | Random 32-char hex secret |
| `BETTER_AUTH_URL` | `http://localhost:3000` |

### backend/.dev.vars (Cloudflare Worker secrets, never commit)
| Variable | Purpose |
|---|---|
| `ENVIRONMENT` | `development` |

---

## D1 Database

**Database name**: `qr-shift-db`
**Database ID**: `59de58f9-11f2-4313-ba78-09d64cc405b1`
**Region**: APAC

### Wrangler bindings

Both Workers bind to the same database:
```jsonc
"d1_databases": [{
  "binding": "DB",
  "database_name": "qr-shift-db",
  "database_id": "59de58f9-11f2-4313-ba78-09d64cc405b1"
}]
```

### Schema tables (all defined in frontend/src/lib/db/schema.ts)

| Table | Owner | Purpose |
|---|---|---|
| `users` | Better Auth | User accounts + custom `plan` field |
| `sessions` | Better Auth | Session tokens (read by backend auth middleware) |
| `accounts` | Better Auth | OAuth accounts (email/password for now) |
| `verifications` | Better Auth | Email verification tokens |
| `qr_codes` | Backend domain | QR codes with short codes and destination URLs |
| `scans` | Backend domain | Per-scan records with geo + device data |

### Running migrations

Always from `frontend/`:
```bash
cd frontend
bunx drizzle-kit generate
npx wrangler d1 execute qr-shift-db --local --file=./drizzle/<filename>.sql   # local
npx wrangler d1 execute qr-shift-db --remote --file=./drizzle/<filename>.sql  # production
```

---

## Route Structure (App Router)

```
src/app/
├── (marketing)/page.tsx              ← /  (public landing)
├── (auth)/
│   ├── layout.tsx                    ← centered card, no sidebar
│   ├── login/page.tsx                ← /login
│   └── signup/page.tsx               ← /signup
├── (dashboard)/
│   ├── layout.tsx                    ← sidebar + topbar (client component)
│   └── dashboard/page.tsx            ← /dashboard (welcome + stat skeletons)
└── api/auth/[...all]/route.ts        ← /api/auth/* (Better Auth)
```

**proxy.ts** matcher: `/((?!api|_next/static|_next/image|favicon).*)`
- `/dashboard/**` → redirect to `/login` if no session cookie
- `/login`, `/signup` → redirect to `/dashboard` if session cookie present

---

## Backend API Routes

Base: `http://localhost:8787` (dev) / `https://qr-shift-api.workers.dev` (prod)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | — | `{ ok: true }` |
| GET | `/qr` | ✅ | List user's QR codes |
| POST | `/qr` | ✅ | Create `{ name, destUrl }` → returns QrCode |
| GET | `/qr/:id` | ✅ | Get single QR code |
| PATCH | `/qr/:id` | ✅ | Update `name?`, `destUrl?`, `isActive?` |
| DELETE | `/qr/:id` | ✅ | Delete (cascades scans) |
| GET | `/r/:code` | — | 302 redirect + async scan log |
| GET | `/analytics/:qrId` | ✅ | `{ total, byDay, byCountry, byDevice, byOs, byBrowser }` |

Auth: reads `better-auth.session_token` cookie → strips `.signature` suffix → D1 lookup on `sessions` table.

---

## Frontend API Client

`frontend/src/lib/api.ts` — typed fetch wrapper:

```ts
import { api } from '@/lib/api'

// All methods forward session cookie automatically (credentials: 'include')
const { data: codes } = await api.qr.list()
const { data: code }  = await api.qr.create({ name: 'My QR', destUrl: 'https://...' })
const { data: stats } = await api.analytics.get(qrId)
```

---

## Build & Run Commands

```bash
# Frontend (from frontend/)
bun install
bun run dev          # next dev on :3000
bun run build        # Next.js build
bun run deploy       # build + deploy to CF Workers
bun run cf-typegen   # regenerate cloudflare-env.d.ts after wrangler.jsonc changes
bunx drizzle-kit generate  # generate migration SQL from schema

# Backend (from backend/)
bun install
bun run dev          # wrangler dev on :8787, shared D1 state with frontend
bun run deploy       # deploy to CF Workers

# D1 (from frontend/)
npx wrangler d1 execute qr-shift-db --local --command "SELECT * FROM users"
npx wrangler d1 execute qr-shift-db --local --file=./drizzle/<file>.sql
```

---

## Code Style

- **TypeScript strict** — no `any` unless unavoidable (document why)
- **Type-only imports**: `import type { X } from '...'`
- **Absolute imports**: `@/lib/...` not `../../lib/...`
- **Server components by default** — add `'use client'` only when needed
- **kebab-case** files, **PascalCase** components, **camelCase** functions
- **No TODO** comments without a phase reference

---

## Phase Status

| Phase | Focus | Status |
|---|---|---|
| 1 | Foundation & Auth | ✅ Complete |
| 2 | Hono API backend | ✅ Complete |
| 3 | QR Code UI | ⏳ Not started |
| 4 | Analytics Dashboard | ⏳ Not started |
| 5 | Marketing Site | ⏳ Not started |
| 6 | Billing & Launch | ⏳ Not started |

---

## Agent Responsibilities

### Before making changes
1. Read this file
2. Read `frontend/src/app/globals.css` before any styling work
3. Read `frontend/src/lib/db/schema.ts` before any DB query
4. Check `package.json` before installing — verify it doesn't already exist

### After making changes
| Change | Update |
|---|---|
| New route/page | Update Route Structure above |
| New env var | Update Environment Variables above |
| New wrangler binding | Update wrangler binding tables + run `cf-typegen` |
| New DB table | Update Schema tables above + run migration |
| New gotcha discovered | Add to Critical Rules above |
| Phase completed | Update Phase Status above |

### When uncertain
- **Better Auth API**: https://www.better-auth.com/docs
- **Drizzle API**: https://orm.drizzle.team/docs/overview
- **Cloudflare Workers**: https://developers.cloudflare.com/workers
- **OpenNext**: https://opennext.js.org/cloudflare
- **Hono**: https://hono.dev/docs
