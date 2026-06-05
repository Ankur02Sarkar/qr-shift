/**
 * Backend schema — TYPE INFERENCE ONLY.
 *
 * This file is a deliberate, minimal copy of the tables this Worker queries.
 * It NEVER drives migrations — all schema changes and migrations are managed
 * from frontend/ using drizzle-kit generate + wrangler d1 execute.
 *
 * Tables owned by frontend (auth): users, sessions
 * Tables owned by backend (QR domain): qr_codes, scans
 *
 * If you add a column to the shared D1 database, update BOTH this file
 * AND frontend/src/lib/db/schema.ts, then run the migration from frontend/.
 */
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

// Minimal users def — only columns the backend queries
export const users = sqliteTable('users', {
  id:    text('id').primaryKey(),
  email: text('email').notNull(),
  name:  text('name').notNull(),
  plan:  text('plan', { enum: ['free', 'pro', 'agency'] }).notNull().default('free'),
})

// Sessions — needed for auth middleware: token → userId lookup
export const sessions = sqliteTable('sessions', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull(),
  token:     text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

// QR codes — owned by this Worker's domain
export const qrCodes = sqliteTable('qr_codes', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull(),
  name:      text('name').notNull(),
  shortCode: text('short_code').notNull().unique(),
  destUrl:   text('dest_url').notNull(),
  isActive:  integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
  index('qr_codes_user_id_idx').on(t.userId),
  index('qr_codes_short_code_idx').on(t.shortCode),
])

// Scans — owned by this Worker's domain
export const scans = sqliteTable('scans', {
  id:        text('id').primaryKey(),
  qrCodeId:  text('qr_code_id').notNull(),
  scannedAt: integer('scanned_at', { mode: 'timestamp' }).notNull(),
  country:   text('country'),
  city:      text('city'),
  device:    text('device'),
  os:        text('os'),
  browser:   text('browser'),
}, (t) => [
  index('scans_qr_code_id_idx').on(t.qrCodeId),
  index('scans_scanned_at_idx').on(t.scannedAt),
])
