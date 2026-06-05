import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt } from 'better-auth/plugins'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/lib/db/schema'

export const auth = betterAuth({
  database: async () => {
    const { env } = await getCloudflareContext({ async: true })
    return drizzleAdapter(drizzle(env.DB), { provider: 'sqlite', schema })
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
