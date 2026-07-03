import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';

export const auth = betterAuth({
  trustedOrigins: ['http://localhost:3001'],
  plugins: [admin()],
  database: drizzleAdapter(
    {},
    {
      provider: 'pg',
    },
  ),
});
