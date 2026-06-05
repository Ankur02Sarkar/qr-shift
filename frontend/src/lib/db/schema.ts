import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

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

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Phase 2: QR code domain tables
// Migrations always run from frontend/ — backend schema.ts is type-inference only

export const qrCodes = sqliteTable('qr_codes', {
  id:        text('id').primaryKey(),                                               // nanoid()
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  shortCode: text('short_code').notNull().unique(),                                 // nanoid(8) — used in /r/:code
  destUrl:   text('dest_url').notNull(),
  isActive:  integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
  index('qr_codes_user_id_idx').on(t.userId),
  index('qr_codes_short_code_idx').on(t.shortCode),
])

export const scans = sqliteTable('scans', {
  id:        text('id').primaryKey(),                                               // nanoid()
  qrCodeId:  text('qr_code_id').notNull().references(() => qrCodes.id, { onDelete: 'cascade' }),
  scannedAt: integer('scanned_at', { mode: 'timestamp' }).notNull(),
  country:   text('country'),   // from CF-IPCountry header  e.g. 'IN', 'US'
  city:      text('city'),      // from CF-IPCity header
  device:    text('device'),    // 'mobile' | 'tablet' | 'desktop'
  os:        text('os'),        // 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other'
  browser:   text('browser'),   // 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other'
}, (t) => [
  index('scans_qr_code_id_idx').on(t.qrCodeId),
  index('scans_scanned_at_idx').on(t.scannedAt),
])
