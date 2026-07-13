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
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const DEFAULT_DEPARTMENTS = [
  { 
    name: 'Operations',  
    description: 'Handles daily business operations, processes, and organizational efficiency' 
  },
  { 
    name: 'Sales & Marketing',        
    description: 'Manages sales activities, marketing strategies, and customer relationships' 
  },
  { 
    name: 'HR',           
    description: 'Manages employee relations, recruitment, and workforce development' 
  },
  { 
    name: 'Finance',      
    description: 'Handles budgeting, accounting, financial planning, and reporting' 
  },
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

  // ── Seed permissions + admin role ───────────────────────────────────────────
  console.log('\n🔐 Seeding permissions and admin role...');
  const PERMISSIONS = [
    'create_request',
    'approve_request_initial',
    'approve_request_final',
    'process_canvass',
    'approve_canvass',
    'generate_po',
    'receive_goods',
    'manage_users',
    'manage_roles_permissions',
    'manage_departments',
    'override_approvals',
    'view_all_records',
    'system_configuration',
  ];

  // ensure permissions
  for (const name of PERMISSIONS) {
    const existingPerm = await db
      .select()
      .from(authSchema.permission)
      .where(eq(authSchema.permission.name, name))
      .limit(1);

    if (existingPerm.length > 0) {
      console.log(`   ⏭  permission ${name} exists — skipping.`);
      continue;
    }

    await db.insert(authSchema.permission).values({
      id: randomUUID(),
      name,
      description: null,
    });
    console.log(`   ✅ Created permission: ${name}`);
  }

  // ensure admin role
  let adminRole = await db
    .select()
    .from(authSchema.role)
    .where(eq(authSchema.role.name, 'admin'))
    .limit(1);

  if (adminRole.length > 0) {
    console.log('   ⏭  admin role exists — ensuring isSystem=true');
    await db
      .update(authSchema.role)
      .set({ isSystem: true })
      .where(eq(authSchema.role.name, 'admin'));
    adminRole = await db
      .select()
      .from(authSchema.role)
      .where(eq(authSchema.role.name, 'admin'))
      .limit(1);
  } else {
    const rid = randomUUID();
    await db.insert(authSchema.role).values({ id: rid, name: 'admin', description: null, isSystem: true });
    console.log('   ✅ Created admin role');
    adminRole = await db
      .select()
      .from(authSchema.role)
      .where(eq(authSchema.role.name, 'admin'))
      .limit(1);
  }

  const adminRoleId = adminRole[0]?.id;
  if (adminRoleId) {
    // assign all permissions to admin role
    for (const name of PERMISSIONS) {
      const perm = await db
        .select()
        .from(authSchema.permission)
        .where(eq(authSchema.permission.name, name))
        .limit(1);

      if (!perm || perm.length === 0) continue;

      const exists = await db
        .select()
        .from(authSchema.rolePermission)
        .where(
          and(
            eq(authSchema.rolePermission.roleId, adminRoleId),
            eq(authSchema.rolePermission.permissionId, perm[0].id),
          ),
        )
        .limit(1);

      if (exists.length > 0) {
        console.log(`   ⏭  admin -> ${name} already assigned`);
        continue;
      }

      await db.insert(authSchema.rolePermission).values({ roleId: adminRoleId, permissionId: perm[0].id });
      console.log(`   ✅ Assigned admin -> ${name}`);
    }
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
    // ensure user_role link exists
    const user = await db
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.email, SUPERADMIN_EMAIL))
      .limit(1);
    if (user.length > 0 && adminRoleId) {
      const link = await db
        .select()
        .from(authSchema.userRole)
        .where(
          and(
            eq(authSchema.userRole.userId, user[0].id),
            eq(authSchema.userRole.roleId, adminRoleId),
          ),
        )
        .limit(1);
      if (link.length === 0) {
        await db.insert(authSchema.userRole).values({ userId: user[0].id, roleId: adminRoleId });
        console.log('   ✅ Linked existing superadmin to admin role.');
      } else {
        console.log('   ⏭  superadmin already linked to admin role.');
      }
    }
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

  // link newly created user to admin role
  const createdUser = await db
    .select()
    .from(authSchema.user)
    .where(eq(authSchema.user.email, SUPERADMIN_EMAIL))
    .limit(1);
  if (createdUser.length > 0 && adminRoleId) {
    const link = await db
      .select()
      .from(authSchema.userRole)
      .where(
        and(
          eq(authSchema.userRole.userId, createdUser[0].id),
          eq(authSchema.userRole.roleId, adminRoleId),
        ),
      )
      .limit(1);
    if (link.length === 0) {
      await db.insert(authSchema.userRole).values({ userId: createdUser[0].id, roleId: adminRoleId });
      console.log('   ✅ Linked superadmin to admin role.');
    } else {
      console.log('   ⏭  superadmin already linked to admin role.');
    }
  }

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
