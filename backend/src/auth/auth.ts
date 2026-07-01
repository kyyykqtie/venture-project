import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3001'],
  database: drizzleAdapter(
    {},
    {
      provider: 'pg',
    },
  ),
});
