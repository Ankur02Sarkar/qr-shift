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
  const cookieValue = getCookie(c, 'better-auth.session_token')

  if (!cookieValue) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // Better Auth stores the raw token in the DB but the cookie value is
  // "{token}.{hmac-signature}" (URL-encoded). Extract just the token part.
  const token = decodeURIComponent(cookieValue).split('.')[0]

  const db = getDb(c.env)
  const now = new Date()

  const session = await db
    .select({ userId: sessions.userId, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.token, token))
    .get()

  if (!session) {
    return c.json({ error: 'Session not found' }, 401)
  }

  if (session.expiresAt < now) {
    return c.json({ error: 'Session expired' }, 401)
  }

  c.set('userId', session.userId)
  await next()
})
