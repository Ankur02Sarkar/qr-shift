import { Hono } from 'hono'
import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '../lib/db'
import { qrCodes, scans } from '../lib/schema'
import { requireAuth } from '../middleware/auth'
import type { HonoEnv } from '../types'

const analytics = new Hono<HonoEnv>()

analytics.use('*', requireAuth)

// GET /analytics/:qrId?from=<unix>&to=<unix>
// Both from/to are optional Unix timestamps (seconds).
// Omit for all-time data.
analytics.get('/:qrId', async (c) => {
  const db     = getDb(c.env)
  const userId = c.get('userId')
  const qrId   = c.req.param('qrId')

  // Verify ownership
  const code = await db
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.id, qrId), eq(qrCodes.userId, userId)))
    .get()

  if (!code) return c.json({ error: 'Not found' }, 404)

  // Parse optional date range (Unix seconds)
  const fromParam = c.req.query('from')
  const toParam   = c.req.query('to')
  const fromDate  = fromParam ? new Date(Number(fromParam) * 1000) : null
  const toDate    = toParam   ? new Date(Number(toParam)   * 1000) : null

  // Build base where condition
  function scanWhere() {
    const conditions = [eq(scans.qrCodeId, qrId)]
    if (fromDate) conditions.push(gte(scans.scannedAt, fromDate))
    if (toDate)   conditions.push(lte(scans.scannedAt, toDate))
    return and(...conditions)
  }

  // Total scans
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(scans)
    .where(scanWhere())
    .get()

  const total = totalResult?.count ?? 0

  // Scans by day
  const byDay = await db
    .select({
      date:  sql<string>`strftime('%Y-%m-%d', datetime(${scans.scannedAt}, 'unixepoch'))`,
      count: sql<number>`count(*)`,
    })
    .from(scans)
    .where(scanWhere())
    .groupBy(sql`strftime('%Y-%m-%d', datetime(${scans.scannedAt}, 'unixepoch'))`)
    .orderBy(sql`1 ASC`)
    .all()

  // Scans by country
  const byCountry = await db
    .select({
      country: scans.country,
      count:   sql<number>`count(*)`,
    })
    .from(scans)
    .where(scanWhere())
    .groupBy(scans.country)
    .orderBy(sql`count(*) DESC`)
    .all()

  // Scans by device
  const byDevice = await db
    .select({
      device: scans.device,
      count:  sql<number>`count(*)`,
    })
    .from(scans)
    .where(scanWhere())
    .groupBy(scans.device)
    .orderBy(sql`count(*) DESC`)
    .all()

  // Scans by OS
  const byOs = await db
    .select({
      os:    scans.os,
      count: sql<number>`count(*)`,
    })
    .from(scans)
    .where(scanWhere())
    .groupBy(scans.os)
    .orderBy(sql`count(*) DESC`)
    .all()

  // Scans by browser
  const byBrowser = await db
    .select({
      browser: scans.browser,
      count:   sql<number>`count(*)`,
    })
    .from(scans)
    .where(scanWhere())
    .groupBy(scans.browser)
    .orderBy(sql`count(*) DESC`)
    .all()

  return c.json({
    data: {
      qrCode: code,
      total,
      byDay,
      byCountry,
      byDevice,
      byOs,
      byBrowser,
    },
  })
})

export default analytics
