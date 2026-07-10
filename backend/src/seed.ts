/**
 * Seed script — creates the superadmin user and default departments if they don't exist.
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
import { randomUUID } from 'crypto';

const DEFAULT_DEPARTMENTS = [
  { name: 'Engineering',  description: 'Software and infrastructure engineering' },
  { name: 'Sales',        description: 'Sales and business development' },
  { name: 'Marketing',    description: 'Marketing and brand management' },
  { name: 'HR',           description: 'Human resources and recruitment' },
  { name: 'Finance',      description: 'Finance and accounting' },
  { name: 'Support',      description: 'Customer and technical support' },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool, { schema: { ...authSchema } });

  const authInstance = betterAuth({
    plugins: [admin()],
    database: drizzleAdapter(db, { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    trustedOrigins: ['http://localhost:5173'],
  });

  // ── Seed departments ────────────────────────────────────────────────────────
  console.log('\n📦 Seeding departments...');
  for (const dept of DEFAULT_DEPARTMENTS) {
    const existing = await db
      .select()
      .from(authSchema.department)
      .where(eq(authSchema.department.name, dept.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`   ⏭  ${dept.name} already exists — skipping.`);
      continue;
    }

    await db.insert(authSchema.department).values({
      id: randomUUID(),
      name: dept.name,
      description: dept.description,
    });
    console.log(`   ✅ Created department: ${dept.name}`);
  }

  // ── Seed superadmin ─────────────────────────────────────────────────────────
  const SUPERADMIN_EMAIL = 'admin@superadmin.ai';
  const SUPERADMIN_PASSWORD = 'superadmin';
  const SUPERADMIN_NAME = 'Super Admin';

  console.log('\n👤 Seeding superadmin...');

  const existing = await db
    .select()
    .from(authSchema.user)
    .where(eq(authSchema.user.email, SUPERADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log('   ⏭  Superadmin already exists — skipping creation.');
    await db
      .update(authSchema.user)
      .set({ role: 'admin' })
      .where(eq(authSchema.user.email, SUPERADMIN_EMAIL));
    console.log('   ✅ Role confirmed as admin.');
    await pool.end();
    return;
  }

  const result = await authInstance.api.signUpEmail({
    body: {
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      name: SUPERADMIN_NAME,
    },
  });

  if (!result || !result.user) {
    console.error('   ❌ Failed to create superadmin user.');
    await pool.end();
    process.exit(1);
  }

  await db
    .update(authSchema.user)
    .set({ role: 'admin' })
    .where(eq(authSchema.user.email, SUPERADMIN_EMAIL));

  console.log('   ✅ Superadmin created successfully.');
  console.log(`      Email   : ${SUPERADMIN_EMAIL}`);
  console.log(`      Password: ${SUPERADMIN_PASSWORD}`);
  console.log(`      Role    : admin`);

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
