# QR-Shift — Agent Context

> **CRITICAL:** This file MUST be read by any AI agent before making any changes to this codebase. It contains the full project context, active constraints, known gotchas, and the Phase 1 implementation plan. Do not skip it.

*Last updated: 2026-06-05 — Initial agent context for Phase 1 foundation & auth*

---

## Project Overview

QR-Shift is an open-source, full-stack SaaS replicating [QRLagoon](https://qrlagoon.com). It lets users create dynamic QR codes, edit their destination after printing, and track scans by day, device, country, and campaign. The project is being built in public and shared on X.

**Monorepo structure**: `frontend/` (Next.js on Cloudflare Workers via OpenNext) + `backend/` (Hono v4, separate Cloudflare Worker — scaffolded but empty, Phase 2).

---

## Repo Structure

```
qr-shift/
├── frontend/                    ← Next.js 16 app (primary workspace)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css      ← Tailwind v4 theme + all CSS vars (DO NOT hardcode colors)
│   │   │   ├── layout.tsx       ← Root layout (⚠️ currently has Geist/Figtree — must be fixed)
│   │   │   └── page.tsx         ← Placeholder home (will move to (marketing)/page.tsx)
│   │   ├── components/
│   │   │   └── ui/
│   │   │       └── button.tsx   ← First shadcn component installed
│   │   └── lib/
│   │       └── utils.ts         ← cn() helper (clsx + tailwind-merge)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── _headers             ← Cloudflare static asset headers
│   ├── components.json          ← shadcn config: style=base-maia, icons=hugeicons
│   ├── wrangler.jsonc           ← CF Worker config (⚠️ DB binding not yet added)
│   ├── cloudflare-env.d.ts      ← Auto-generated CF bindings types (⚠️ DB missing)
│   ├── open-next.config.ts      ← OpenNext Cloudflare config
│   ├── next.config.ts           ← Next.js config + initOpenNextCloudflareForDev()
│   ├── tsconfig.json            ← paths: @/* → src/*
│   ├── drizzle.config.ts        ← (to be created in Phase 1)
│   ├── .dev.vars                ← Wrangler local secrets (currently: NEXTJS_ENV=development)
│   └── package.json
│
├── backend/                     ← Hono Worker (Phase 2 — skeleton only)
│   ├── src/index.ts             ← "Hello Hono" stub
│   ├── wrangler.jsonc           ← CF Worker config (no D1 binding yet)
│   └── package.json             ← hono@^4.12.23
│
├── Plan.png                     ← Exported tldraw visual build plan
└── README.md                    ← Project overview + phase summary
```

---

## Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend framework | Next.js 16.2.6, React 19, App Router | Exact version locked |
| Styling | Tailwind v4 (CSS-first, no `tailwind.config.js`) | `@import "tailwindcss"` in globals.css |
| UI components | shadcn `base-maia` style on `@base-ui/react` | **NOT Radix UI** — do not install `@radix-ui/*` |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` | **NOT lucide-react** — never install it |
| Font | Outfit (via `next/font/google`) | Single font — Geist and Figtree must be removed |
| Dark mode | `next-themes`, class-based | `attribute="class"`, toggle via `.dark` class on `<html>` |
| Auth | Better Auth + Drizzle adapter (`provider: "sqlite"`) + `jwt()` plugin | See auth notes below |
| ORM | Drizzle ORM (`drizzle-orm/d1`) | |
| Database | Cloudflare D1 (SQLite at edge) | Shared between frontend and backend workers |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` | `bun run deploy` |
| Backend API | Hono v4 (separate Cloudflare Worker in `backend/`) | Phase 2 — currently a stub |
| Billing | Stripe | Phase 6 — not started |
| Package manager | Bun | Use `bun`/`bunx` for all installs and script runs |

---

## Critical Styling Rules

> **These rules are absolute. Violations will break the design system.**

1. **Never hardcode color values.** All colors MUST use CSS variables from `globals.css`.
2. **Every new custom color** MUST have both `:root` (light) AND `.dark` equivalents in `oklch()` format.
3. **In CSS**: use `var(--variable-name)` syntax.
4. **In Tailwind classes**: use semantic tokens like `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, etc. These are mapped via `@theme inline` in `globals.css`.
5. **Font**: `--font-sans: Outfit, ui-sans-serif, sans-serif, system-ui` — already set in `globals.css`. Apply with `font-sans` class or `font-[family-name:var(--font-sans)]`.
6. **Base radius**: `--radius: 1.4rem`. Use the computed scale (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`).
7. **Shadows**: Use the predefined shadow scale (`shadow-2xs` through `shadow-2xl`) — already mapped via `@theme inline`.

### Tailwind v4 Differences (vs v3)

- **No `tailwind.config.js`** — configuration is CSS-first inside `globals.css`.
- Custom themes/tokens go inside `@theme { ... }` or `@theme inline { ... }` blocks.
- `@custom-variant dark (&:is(.dark *))` is already set — use `dark:` prefix as normal.
- Do NOT add `content: [...]` arrays — Tailwind v4 auto-scans.
- `tw-animate-css` is imported for animation utilities.

---

## shadcn Component Rules

- **Style**: `base-maia` — uses `@base-ui/react` primitives (NOT Radix UI)
- **Install command** (always from `frontend/`):
  ```bash
  npx shadcn@latest add <component>
  ```
- **Icon library**: `hugeicons` (configured in `components.json`)
- **Do NOT** install `@radix-ui/*` packages — they conflict with `@base-ui/react`
- **Do NOT** use `lucide-react` — import icons from `@hugeicons/react`

### Icon Usage Pattern

```tsx
// CORRECT
import { Sun01Icon, Moon02Icon } from '@hugeicons/react'

// WRONG — never do this
import { Sun, Moon } from 'lucide-react'
```

---

## Cloudflare / Edge Runtime Rules

> **These are the most common failure points. Read carefully.**

### 1 — Runtime Environment

The frontend runs on **Cloudflare Workers** (via `@opennextjs/cloudflare`), NOT standard Node.js. Enabled compatibility flags:
- `nodejs_compat` — allows Node.js APIs where available
- `global_fetch_strictly_public` — restricts fetch to public URLs only

### 2 — Drizzle DB Instance Scope

The Drizzle `db` instance MUST be created **inside the request handler**, NOT at module scope. D1 bindings are only available per-request.

```ts
// ✅ CORRECT — create inside handler
export async function GET() {
  const { env } = getCloudflareContext()
  const db = drizzle(env.DB)
  const users = await db.select().from(usersTable)
  return Response.json(users)
}

// ❌ WRONG — top-level instantiation crashes at module load time
const { env } = getCloudflareContext()
const db = drizzle(env.DB)
```

### 3 — Accessing Cloudflare Bindings

```ts
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Inside a Server Component, Route Handler, or Server Action:
const { env } = getCloudflareContext()
const db = drizzle(env.DB)
```

### 4 — Next.js Middleware

Middleware MUST use **edge runtime** implicitly (no explicit export needed; Next.js middleware is always edge in App Router). Do NOT add `export const runtime = 'nodejs'` to `src/middleware.ts` — it is not supported.

### 5 — Better Auth in Middleware

**Do NOT call `auth.api.getSession()`** inside `src/middleware.ts`. The session check requires a DB query, which is not available at the edge middleware layer. Use cookie presence detection only:

```ts
// ✅ CORRECT — cookie presence check only
const sessionCookie = request.cookies.get('better-auth.session_token')
if (!sessionCookie) { /* redirect to login */ }

// ❌ WRONG — requires DB, not available in middleware
const session = await auth.api.getSession({ headers: request.headers })
```

### 6 — Better Auth Migrations

**Do NOT use `npx auth migrate`** — the CLI does not work on Workers/D1. Use one of:
- **Option A (recommended)**: `getMigrations` programmatic API from `better-auth/db`
- **Option B**: `bunx drizzle-kit generate` → `npx wrangler d1 migrations apply qr-shift-db --local`

### 7 — Local Development

```bash
# Start local dev server (uses .dev.vars for secrets)
cd frontend
bun run dev

# .dev.vars is the correct file for Wrangler secrets (NOT .env.local for CF bindings)
# .env.local is for NEXT_PUBLIC_* vars only
```

---

## Path Aliases

| Alias | Resolves to | Example |
|---|---|---|
| `@/*` | `frontend/src/*` | `import { cn } from '@/lib/utils'` |

Defined in `frontend/tsconfig.json`. There is only **one** alias. Do not add others.

---

## Key File Locations (`frontend/`)

| File | Purpose |
|---|---|
| `src/app/globals.css` | Tailwind v4 theme, ALL CSS vars, dark mode vars — single source of truth for colors |
| `src/app/layout.tsx` | Root layout — ⚠️ currently broken (has Geist/Figtree fonts, must switch to Outfit only) |
| `src/app/page.tsx` | Placeholder home — will be moved to `(marketing)/page.tsx` |
| `src/components/ui/` | shadcn components live here |
| `src/components/providers/` | App-level providers (ThemeProvider, etc.) — to be created |
| `src/lib/auth.ts` | Better Auth server instance — to be created |
| `src/lib/auth-client.ts` | Better Auth browser client — to be created |
| `src/lib/db/schema.ts` | Drizzle schema (all tables) — to be created |
| `src/lib/db/index.ts` | `getDb()` factory using `getCloudflareContext()` — to be created |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) — already exists |
| `src/middleware.ts` | Next.js edge middleware for route protection — to be created |
| `drizzle.config.ts` | Drizzle Kit config (at `frontend/` root) — to be created |
| `wrangler.jsonc` | Cloudflare Worker config — ⚠️ DB binding not yet added |
| `cloudflare-env.d.ts` | Auto-generated CF bindings types — ⚠️ needs regeneration after D1 added |
| `.dev.vars` | Wrangler local dev secrets (NOT `.env.local` for CF bindings) |
| `components.json` | shadcn config (`style: "base-maia"`, `iconLibrary: "hugeicons"`) |

---

## Environment Variables

| Variable | File | Purpose |
|---|---|---|
| `BETTER_AUTH_SECRET` | `.dev.vars` | Random secret for Better Auth (min 32 chars) |
| `NEXTJS_ENV` | `.dev.vars` | Already present (`development`) |
| `NEXT_PUBLIC_APP_URL` | `.env.local` | Base URL e.g. `http://localhost:3000` |

> **Rule**: Cloudflare binding secrets go in `.dev.vars`. Next.js public env vars go in `.env.local`. Never put `DB` or `BETTER_AUTH_SECRET` in `.env.local`.

---

## Current `wrangler.jsonc` Bindings (frontend)

| Binding | Type | Status |
|---|---|---|
| `ASSETS` | `Fetcher` | ✅ Active (static assets) |
| `IMAGES` | `ImagesBinding` | ✅ Active (CF image optimization) |
| `WORKER_SELF_REFERENCE` | `Fetcher` | ✅ Active (self-ref for ISR caching) |
| `DB` | `D1Database` | ❌ **Not yet added** — Phase 1 task |

After adding `DB`, run `bun run cf-typegen` to regenerate `cloudflare-env.d.ts`.

---

## Route Structure (App Router)

```
src/app/
├── (marketing)/                  ← Public pages (no auth required)
│   └── page.tsx                  ← Landing page (move current page.tsx here)
│
├── (auth)/                       ← Auth pages (redirect to /dashboard if session present)
│   ├── layout.tsx                ← Centered card layout
│   ├── login/
│   │   └── page.tsx              ← Login form
│   └── signup/
│       └── page.tsx              ← Signup form
│
├── (dashboard)/                  ← Protected (middleware redirects if no session cookie)
│   ├── layout.tsx                ← Sidebar + topbar shell
│   └── dashboard/
│       └── page.tsx              ← Dashboard home (welcome + stats skeleton)
│
└── api/
    └── auth/
        └── [...all]/
            └── route.ts          ← Better Auth Next.js handler
```

**Route group folders `(marketing)`, `(auth)`, `(dashboard)` do NOT appear in the URL.** They are organizational only.

---

## Middleware Strategy

**File**: `src/middleware.ts`

```ts
// Behaviour:
// - /dashboard and all sub-routes → redirect to /login if NO session cookie
// - /login, /signup → redirect to /dashboard if session cookie IS present
// - All other routes → pass through

// Method: cookie presence check ONLY (no DB call)
// Cookie name: 'better-auth.session_token'

// Matcher:
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon).*)'],
}
```

The middleware must NOT import `src/lib/auth.ts` or call any Better Auth server functions. Cookie name may vary based on Better Auth config — verify with actual cookie set during sign-in.

---

## Better Auth Configuration

### Server (`src/lib/auth.ts`)

```ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt } from 'better-auth/plugins'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/lib/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(
    drizzle(getCloudflareContext().env.DB),  // ⚠️ This pattern is only safe inside auth handler — see note below
    { provider: 'sqlite', schema }
  ),
  emailAndPassword: { enabled: true },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,  // 5 min — enables stateless middleware cookie check
    },
  },
  plugins: [jwt()],
})
```

> **Note on DB in auth.ts**: Better Auth instantiates lazily when `auth.handler` is called (i.e., per-request). This is safe. However, if TypeScript complains about `getCloudflareContext()` at module scope, wrap the drizzle call in a factory function and pass it per-request instead.

### Key Endpoints Added by `jwt()` Plugin

| Endpoint | Purpose |
|---|---|
| `GET /api/auth/token` | Returns a JWT for the current session |
| `GET /api/auth/jwks` | Returns the JWKS public key set |

### JWT Algorithm

EdDSA (Ed25519) by default. The Hono backend (Phase 2) will verify tokens via `jose` + `createRemoteJWKSet` pointing at `/api/auth/jwks`.

### Browser Client (`src/lib/auth-client.ts`)

```ts
import { createAuthClient } from 'better-auth/react'
import { jwtClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [jwtClient()],
})
```

### Better Auth Route Handler (`src/app/api/auth/[...all]/route.ts`)

```ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

---

## Drizzle Configuration

### Schema (`src/lib/db/schema.ts`)

Four tables required by Better Auth + custom `plan` field on users:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// 1. users — custom 'plan' field added via Better Auth additionalFields
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  plan: text('plan', { enum: ['free', 'pro', 'agency'] }).notNull().default('free'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// 2. sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// 3. accounts
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// 4. verifications
export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
```

> **Important**: The `plan` field is a custom addition — Better Auth does not have it by default. Register it via `user.additionalFields` in `auth.ts`:
> ```ts
> user: {
>   additionalFields: {
>     plan: { type: 'string', defaultValue: 'free' }
>   }
> }
> ```

### DB Client Factory (`src/lib/db/index.ts`)

```ts
import { drizzle } from 'drizzle-orm/d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import * as schema from './schema'

export function getDb() {
  const { env } = getCloudflareContext()
  return drizzle(env.DB, { schema })
}
```

### Drizzle Kit Config (`drizzle.config.ts` — at `frontend/` root)

```ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config
```

> For local migration generation only — credentials not needed for `drizzle-kit generate`, only for remote push.

---

## Phase 1 — Implementation Checklist

> **Current status**: Foundation scaffolded (Next.js + shadcn + Tailwind v4). Auth, DB, and route structure not yet implemented.

Work through these tasks in order. Each depends on the previous.

### Step 1 — Dependencies

```bash
cd frontend
bun add better-auth drizzle-orm next-themes
bun add -D drizzle-kit
```

### Step 2 — Create D1 Database

```bash
# From frontend/ directory
npx wrangler d1 create qr-shift-db
# Note the database_id from the output — needed for wrangler.jsonc
```

### Step 3 — Add D1 Binding to `wrangler.jsonc`

Add inside the JSON object (before the closing `}`):
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "qr-shift-db",
    "database_id": "<paste-id-from-step-2>"
  }
]
```

### Step 4 — Regenerate CF Types

```bash
cd frontend
bun run cf-typegen
# This updates cloudflare-env.d.ts to include DB: D1Database
```

### Step 5 — Add Secrets to `.dev.vars`

```
BETTER_AUTH_SECRET=<generate-with: openssl rand -hex 32>
```

Add to `.env.local`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6 — Create DB Schema and Client

- [ ] Create `src/lib/db/schema.ts` (4 Better Auth tables + `plan` field — see schema above)
- [ ] Create `src/lib/db/index.ts` (`getDb()` factory — see pattern above)
- [ ] Create `drizzle.config.ts` at `frontend/` root

### Step 7 — Create Auth Files

- [ ] Create `src/lib/auth.ts` (Better Auth server — drizzleAdapter + emailAndPassword + jwt plugin + cookieCache)
- [ ] Create `src/lib/auth-client.ts` (createAuthClient + jwtClient plugin)
- [ ] Create `src/app/api/auth/[...all]/route.ts` (toNextJsHandler)

### Step 8 — Create Middleware

- [ ] Create `src/middleware.ts`
  - Protects `/dashboard/**` → redirect to `/login` if no session cookie
  - Redirects `/login`, `/signup` → to `/dashboard` if session cookie present
  - Cookie name to check: `better-auth.session_token`
  - Uses matcher: `['/((?!api|_next/static|_next/image|favicon).*)']`

### Step 9 — Fix Root Layout

- [ ] Update `src/app/layout.tsx`:
  - Remove `Geist`, `Geist_Mono`, and `Figtree` font imports (currently present — this is a bug)
  - Import only `Outfit` from `next/font/google`
  - Wrap children with `ThemeProvider` (from `src/components/providers/theme-provider.tsx`)
  - Update metadata: `title: "QR-Shift"`, `description: "Dynamic QR codes with analytics"`
  - Apply `suppressHydrationWarning` to `<html>` for next-themes

```tsx
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

// In JSX:
<html lang="en" className={outfit.variable} suppressHydrationWarning>
```

### Step 10 — Create Providers

- [ ] Create `src/components/providers/theme-provider.tsx`

```tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

Usage in `layout.tsx`:
```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>
```

### Step 11 — Create App Shell Components

- [ ] Create `src/components/ui/theme-toggle.tsx` (uses `Sun01Icon`/`Moon02Icon` from `@hugeicons/react`)
- [ ] Install shadcn components:
  ```bash
  cd frontend
  npx shadcn@latest add input label card sidebar dropdown-menu avatar separator badge
  ```

### Step 12 — Create Route Groups and Pages

- [ ] Create `src/app/(marketing)/page.tsx` (move current placeholder home here, clean up Next.js template cruft)
- [ ] Delete old `src/app/page.tsx` (or repurpose as redirect to `/(marketing)/page.tsx`)
- [ ] Create `src/app/(auth)/layout.tsx` (centered card, full-screen, single column)
- [ ] Create `src/app/(auth)/login/page.tsx` (email + password form, calls `authClient.signIn.email()`)
- [ ] Create `src/app/(auth)/signup/page.tsx` (name + email + password form, calls `authClient.signUp.email()`)
- [ ] Create `src/app/(dashboard)/layout.tsx` (sidebar + topbar shell using shadcn `<Sidebar>`)
- [ ] Create `src/app/(dashboard)/dashboard/page.tsx` (welcome heading + stats card skeletons)

### Step 13 — Run Migrations

```bash
cd frontend

# Generate migration SQL files
bunx drizzle-kit generate

# Apply to local D1
npx wrangler d1 migrations apply qr-shift-db --local

# Verify tables exist
npx wrangler d1 execute qr-shift-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### Step 14 — Verify End-to-End

- [ ] `bun run dev` starts without TypeScript errors
- [ ] `/signup` renders, form submits, user created in local D1
- [ ] `/login` renders, credentials accepted, session cookie set
- [ ] Navigating to `/dashboard` while logged in works
- [ ] Navigating to `/dashboard` while logged out redirects to `/login`
- [ ] Navigating to `/login` while logged in redirects to `/dashboard`
- [ ] Dark mode toggle switches theme, persists on reload
- [ ] No `@radix-ui/*` packages in `node_modules`
- [ ] No Geist or Figtree font requests in browser network tab

---

## Phase 2 Preview — Hono Backend (`backend/`)

> **Not started. Do not implement until Phase 1 is complete.**

The `backend/` folder has a minimal Hono scaffold (`src/index.ts` returns "Hello Hono"). Phase 2 work:

- Add `nodejs_compat` to `backend/wrangler.jsonc`
- Add D1 binding (same `qr-shift-db` database)
- Install: `bun add drizzle-orm jose` + `bun add -D drizzle-kit`
- Add JWT middleware: verify tokens from `NEXT_PUBLIC_APP_URL/api/auth/jwks` using `jose`
- Routes:
  - `GET /qr` — list QR codes for authed user
  - `POST /qr` — create QR code
  - `PATCH /qr/:id` — update destination URL
  - `DELETE /qr/:id` — delete QR code
  - `GET /r/:code` — redirect + log scan (public, no auth)
  - `GET /analytics/:qrId` — scan breakdown by day/device/country

---

## Build Phases Summary

| Phase | Focus | Status |
|---|---|---|
| 1 | Foundation & Auth (DB schema, Better Auth, auth pages, middleware, dashboard shell) | 🚧 In Progress |
| 2 | Hono API backend (JWT auth, QR CRUD, redirect, scan logging, analytics) | ⏳ Not started |
| 3 | QR Code UI (create/edit/style/export, `qr-code-styling`, typed API client) | ⏳ Not started |
| 4 | Analytics Dashboard (charts, CSV export, campaign grouping) | ⏳ Not started |
| 5 | Marketing Site (landing, pricing, free generator, SEO, OG tags) | ⏳ Not started |
| 6 | Billing & Launch (Stripe, plan limits, domain, monitoring) | ⏳ Not started |

---

## Build & Run Commands

All commands run from `frontend/` unless noted.

```bash
# Install dependencies
bun install

# Local development (uses .dev.vars + Cloudflare Worker runtime)
bun run dev

# Build for Cloudflare
bun run build        # Next.js build only
bun run preview      # Build + preview locally with Wrangler
bun run deploy       # Build + deploy to Cloudflare Workers
bun run upload       # Build + upload (no deploy trigger)

# Regenerate Cloudflare bindings types
bun run cf-typegen

# Drizzle Kit
bunx drizzle-kit generate           # Generate migration SQL
bunx drizzle-kit studio             # Open Drizzle Studio (remote)

# Wrangler D1 (local)
npx wrangler d1 migrations apply qr-shift-db --local
npx wrangler d1 execute qr-shift-db --local --command "<SQL>"

# Lint
bun run lint

# Backend (from backend/)
bun run dev          # Wrangler dev for Hono Worker
bun run deploy       # Deploy backend Worker
```

---

## Code Style & Conventions

### TypeScript

- **Strict mode** is on (`"strict": true` in tsconfig).
- Use `type` imports for type-only imports: `import type { Metadata } from 'next'`
- Prefer `interface` over `type` for object shapes (unless union types needed).
- No `any` — use `unknown` if truly unknown.
- Use `satisfies` for config objects: `export default { ... } satisfies Config`

### React / Next.js

- App Router only — no `pages/` directory.
- Server Components by default — add `'use client'` only when needed (event handlers, browser APIs, React hooks).
- Route Handlers (in `app/api/`) use `export async function GET() {}` etc.
- No `.jsx` files — use `.tsx` for all React files.

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Files (components) | `kebab-case.tsx` | `theme-toggle.tsx` |
| Files (utilities) | `kebab-case.ts` | `auth-client.ts` |
| React components | `PascalCase` | `ThemeToggle` |
| Functions/variables | `camelCase` | `getDb()`, `authClient` |
| Constants | `SCREAMING_SNAKE_CASE` | `PLAN_LIMITS` |
| CSS variables | `--kebab-case` | `--sidebar-accent` |
| DB tables | `snake_case` | `users`, `qr_codes` |
| DB columns | `snake_case` | `created_at`, `user_id` |

### Comments

- Comment **why**, not **what** — code should be self-documenting.
- Use JSDoc (`/** */`) for exported functions and types.
- No TODO comments without a linked issue or phase reference (e.g., `// TODO(Phase 3): add QR styling options`).

### Imports

- Use absolute imports with `@/` alias, not relative `../../`.
- Group imports: external → internal → types. Separated by blank lines.

```ts
import { betterAuth } from 'better-auth'
import { drizzle } from 'drizzle-orm/d1'

import { getDb } from '@/lib/db'
import * as schema from '@/lib/db/schema'

import type { User } from '@/lib/db/schema'
```

---

## Agent Responsibilities

### Before Making Changes

1. **Read this file** (`AGENTS.md`) — you are doing this now ✓
2. **Read `frontend/src/app/globals.css`** before touching any styling
3. **Read `frontend/wrangler.jsonc`** before touching any CF bindings or config
4. **Read `frontend/src/lib/db/schema.ts`** (once created) before writing any DB query
5. **Read the relevant existing files** in the area you are modifying
6. **Check `frontend/package.json`** before installing any package — verify it doesn't already exist

### After Making Changes

| Change Type | Update These |
|---|---|
| New route/page added | Update Route Structure section in this file |
| New environment variable | Update Environment Variables table in this file |
| New wrangler.jsonc binding | Update Current Bindings table in this file + run `cf-typegen` |
| New DB table | Update Drizzle Schema section in this file |
| New shadcn component installed | Note in Phase 1 checklist (mark done) |
| New package installed | No file update needed, but verify it's CF Worker compatible |
| Phase 1 task completed | Check it off in the Phase 1 checklist |
| New file/directory created | Update Repo Structure section in this file |
| Phase completed | Update Build Phases Summary table status |

### When You Encounter Uncertainty

- **Unknown Better Auth API**: Check [better-auth.com/docs](https://www.better-auth.com/docs) — do NOT guess API shape.
- **Unknown Drizzle API**: Check [orm.drizzle.team/docs](https://orm.drizzle.team/docs/overview) — especially D1-specific docs.
- **Unknown Cloudflare Workers API**: Check [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/).
- **Unknown OpenNext behavior**: Check [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare).
- **shadcn component props**: Run `npx shadcn@latest add <component>` and read the generated source.
- **If a package conflicts with CF Workers**: Search for "cloudflare workers" in the package's GitHub issues.

---

## Self-Update Clause

This `AGENTS.md` is the **authoritative context file** for QR-Shift. Any agent that:

1. Completes a Phase 1 checklist item — **must check it off**
2. Creates a new file or directory — **must update the Repo Structure section**
3. Adds an environment variable — **must update the Environment Variables table**
4. Adds a wrangler.jsonc binding — **must update the Current Bindings table**
5. Adds a DB table to the schema — **must update the Drizzle Schema section**
6. Discovers a new gotcha or edge case — **must add it to the relevant Critical Rules section**
7. Starts a new phase — **must update the Build Phases Summary table**

When updating this file, also update the `*Last updated*` line at the top with the date and reason.
