import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt } from 'better-auth/plugins'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/lib/db/schema'

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  database: (options) => {
    const { env } = getCloudflareContext()
    return drizzleAdapter(drizzle(env.DB), {
      provider: 'sqlite',
      schema,
      usePlural: true,    // our tables are plural: users, sessions, accounts, verifications
      transaction: false, // D1 does not support db.transaction()
    })(options)
  },
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
  plugins: [jwt()],
})
