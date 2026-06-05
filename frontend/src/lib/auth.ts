import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/lib/db/schema'

// Lazy singleton — betterAuth must not be instantiated at module scope
// because getCloudflareContext() is only available inside a request handler.
// jwt() plugin is deferred to Phase 2 when the Hono backend is ready.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any

export function getAuth() {
  if (_auth) return _auth

  const { env } = getCloudflareContext()

  _auth = betterAuth({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: (options: BetterAuthOptions) =>
      drizzleAdapter(drizzle(env.DB), {
        provider: 'sqlite',
        schema,
        usePlural: true,    // tables are plural: users, sessions, accounts, verifications
        transaction: false, // D1 does not support db.transaction()
      })(options),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        plan: {
          type: 'string',
          defaultValue: 'free',
        },
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    // jwt() plugin added in Phase 2 when the Hono API backend is ready
  })

  return _auth
}
