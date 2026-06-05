import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '../lib/db'
import { qrCodes } from '../lib/schema'
import { requireAuth } from '../middleware/auth'
import type { HonoEnv } from '../types'

const qr = new Hono<HonoEnv>()

qr.use('*', requireAuth)

// GET /qr — list all QR codes for the authenticated user
qr.get('/', async (c) => {
  const db = getDb(c.env)
  const userId = c.get('userId')

  const codes = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId))
    .all()

  return c.json({ data: codes })
})

// POST /qr — create a new QR code
qr.post('/', async (c) => {
  const body = await c.req.json<{ name: string; destUrl: string }>()

  if (!body.name?.trim() || !body.destUrl?.trim()) {
    return c.json({ error: 'name and destUrl are required' }, 400)
  }

  // Basic URL validation
  try {
    new URL(body.destUrl)
  } catch {
    return c.json({ error: 'destUrl must be a valid URL' }, 400)
  }

  const db = getDb(c.env)
  const userId = c.get('userId')
  const now = new Date()

  const newCode = {
    id:        nanoid(),
    userId,
    name:      body.name.trim(),
    shortCode: nanoid(8),
    destUrl:   body.destUrl.trim(),
    isActive:  true,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(qrCodes).values(newCode)

  return c.json({ data: newCode }, 201)
})

// GET /qr/:id — get a single QR code (must belong to user)
qr.get('/:id', async (c) => {
  const db = getDb(c.env)
  const userId = c.get('userId')

  const code = await db
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.id, c.req.param('id')), eq(qrCodes.userId, userId)))
    .get()

  if (!code) return c.json({ error: 'Not found' }, 404)

  return c.json({ data: code })
})

// PATCH /qr/:id — update name or destUrl
qr.patch('/:id', async (c) => {
  const body = await c.req.json<{ name?: string; destUrl?: string; isActive?: boolean }>()
  const db = getDb(c.env)
  const userId = c.get('userId')

  const existing = await db
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.id, c.req.param('id')), eq(qrCodes.userId, userId)))
    .get()

  if (!existing) return c.json({ error: 'Not found' }, 404)

  if (body.destUrl !== undefined) {
    try {
      new URL(body.destUrl)
    } catch {
      return c.json({ error: 'destUrl must be a valid URL' }, 400)
    }
  }

  const updates: Partial<typeof existing> = { updatedAt: new Date() }
  if (body.name !== undefined)     updates.name     = body.name.trim()
  if (body.destUrl !== undefined)  updates.destUrl  = body.destUrl.trim()
  if (body.isActive !== undefined) updates.isActive = body.isActive

  await db
    .update(qrCodes)
    .set(updates)
    .where(eq(qrCodes.id, existing.id))

  return c.json({ data: { ...existing, ...updates } })
})

// DELETE /qr/:id
qr.delete('/:id', async (c) => {
  const db = getDb(c.env)
  const userId = c.get('userId')

  const existing = await db
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.id, c.req.param('id')), eq(qrCodes.userId, userId)))
    .get()

  if (!existing) return c.json({ error: 'Not found' }, 404)

  await db.delete(qrCodes).where(eq(qrCodes.id, existing.id))

  return c.json({ success: true })
})

export default qr
