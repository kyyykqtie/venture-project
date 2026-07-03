/**
 * Seed script — creates the superadmin user if it doesn't already exist.
 * Run with: npx ts-node -r tsconfig-paths/register src/seed.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import * as authSchema from './auth/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool, { schema: { ...authSchema } });

  const authInstance = betterAuth({
    plugins: [admin()],
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    trustedOrigins: ['http://localhost:5173'],
  });

  const SUPERADMIN_EMAIL = 'admin@superadmin.ai';
  const SUPERADMIN_PASSWORD = 'superadmin';
  const SUPERADMIN_NAME = 'Super Admin';

  // Check if user already exists
  const existing = await db
    .select()
    .from(authSchema.user)
    .where(eq(authSchema.user.email, SUPERADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log('✅ Superadmin already exists — skipping creation.');

    // Ensure role is set to superadmin in case it was created without the role
    await db
      .update(authSchema.user)
      .set({ role: 'superadmin' })
      .where(eq(authSchema.user.email, SUPERADMIN_EMAIL));

    console.log('✅ Role confirmed as superadmin.');
    await pool.end();
    return;
  }

  // Create the superadmin account via better-auth so password is hashed correctly
  const result = await authInstance.api.signUpEmail({
    body: {
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      name: SUPERADMIN_NAME,
    },
  });

  if (!result || !result.user) {
    console.error('❌ Failed to create superadmin user.');
    await pool.end();
    process.exit(1);
  }

  // Set the role to superadmin
  await db
    .update(authSchema.user)
    .set({ role: 'superadmin' })
    .where(eq(authSchema.user.email, SUPERADMIN_EMAIL));

  console.log('✅ Superadmin created successfully.');
  console.log(`   Email   : ${SUPERADMIN_EMAIL}`);
  console.log(`   Password: ${SUPERADMIN_PASSWORD}`);
  console.log(`   Role    : superadmin`);

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
