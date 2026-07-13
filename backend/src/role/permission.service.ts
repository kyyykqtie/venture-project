import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../auth/schema';
import { DATABASE_CONNECTION } from '../database/database.connection';
import { PERMISSIONS, PermissionName } from './permission.constants';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async resolvePermissions(userId: string): Promise<Set<PermissionName>> {
    // Explicit per-user permissions take priority
    const explicit = await this.db
      .select({ name: schema.permission.name })
      .from(schema.userPermission)
      .innerJoin(schema.permission, eq(schema.permission.id, schema.userPermission.permissionId))
      .where(eq(schema.userPermission.userId, userId));

    if (explicit.length > 0) {
      return new Set(explicit.map((r) => r.name as PermissionName));
    }

    // Fall back to role-based permissions
    const roleBased = await this.db
      .select({ name: schema.permission.name })
      .from(schema.user)
      .innerJoin(schema.role, eq(schema.user.role, schema.role.name))
      .innerJoin(schema.rolePermission, eq(schema.rolePermission.roleId, schema.role.id))
      .innerJoin(schema.permission, eq(schema.permission.id, schema.rolePermission.permissionId))
      .where(eq(schema.user.id, userId));

    return new Set(roleBased.map((r) => r.name as PermissionName));
  }

  async resolveAllPermissions(): Promise<PermissionName[]> {
    return PERMISSIONS.slice();
  }
}
