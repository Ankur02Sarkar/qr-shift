import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from './lib/db'
import { qrCodes, scans } from './lib/schema'
import { parseUA } from './lib/ua'
import qrRoutes from './routes/qr'
import analyticsRoutes from './routes/analytics'
import type { HonoEnv } from './types'

const app = new Hono<HonoEnv>()

// CORS — credentials: true is required for session cookie to be forwarded cross-origin
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowed = [
        'http://localhost:3000',                                    // frontend dev
        'http://localhost:8787',                                    // backend self
        'https://qr-shift.ankur02sarkar.workers.dev',              // frontend prod
      ]
      return allowed.includes(origin) ? origin : null
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Health check — no auth
app.get('/health', (c) => c.json({ ok: true }))

// QR redirect — performance-critical, no auth
// Scan is logged asynchronously via waitUntil so the redirect fires immediately
app.get('/r/:code', async (c) => {
  const db = getDb(c.env)
  const code = c.req.param('code')

  const qr = await db
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.shortCode, code), eq(qrCodes.isActive, true)))
    .get()

  if (!qr) {
    return c.json({ error: 'QR code not found' }, 404)
  }

  // Non-blocking scan log — redirect fires immediately
  c.executionCtx.waitUntil(logScan(db, qr.id, c.req.raw))

  return c.redirect(qr.destUrl, 302)
})

// Mount routers
app.route('/qr', qrRoutes)
app.route('/analytics', analyticsRoutes)

export default app

// ─── Helpers ────────────────────────────────────────────────────────────────

async function logScan(
  db: ReturnType<typeof getDb>,
  qrCodeId: string,
  req: Request,
): Promise<void> {
  try {
    const ua = req.headers.get('user-agent') ?? ''
    // cf.device_type is available in production Cloudflare Workers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cfDeviceType = (req as any).cf?.device_type as string | undefined
    const { device, os, browser } = parseUA(ua, cfDeviceType)

    // Cloudflare sets these headers automatically in production
    const country = req.headers.get('cf-ipcountry') ?? null
    const city    = req.headers.get('cf-ipcity')    ?? null

    await db.insert(scans).values({
      id:        nanoid(),
      qrCodeId,
      scannedAt: new Date(),
      country,
      city,
      device,
      os,
      browser,
    })
  } catch {
    // Swallow — a failed scan log must never break the redirect
  }
}
