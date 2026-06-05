import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { eq, gt } from 'drizzle-orm'
import { getDb } from '../lib/db'
import { sessions } from '../lib/schema'
import type { HonoEnv } from '../types'

/**
 * Validates the Better Auth session cookie against the shared D1 sessions table.
 * Sets c.var.userId on success, returns 401 on failure.
 * No JWT / JWKS needed — both Workers share the same D1 database.
 */
export const requireAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const token = getCookie(c, 'better-auth.session_token')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = getDb(c.env)
  const now = new Date()

  const session = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(eq(sessions.token, token))
    .get()

  if (!session || session.userId === undefined) {
    return c.json({ error: 'Session not found' }, 401)
  }

  // Verify expiry in JS — avoids D1 date comparison quirks
  const raw = await db
    .select({ expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.token, token))
    .get()

  if (!raw || raw.expiresAt < now) {
    return c.json({ error: 'Session expired' }, 401)
  }

  c.set('userId', session.userId)
  await next()
})
