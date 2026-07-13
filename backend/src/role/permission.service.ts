import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../database/database.connection';
import * as schema from '../auth/schema';
import { eq } from 'drizzle-orm';
import { PERMISSIONS, PermissionName } from './permission.constants';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async resolvePermissions(userId: string): Promise<Set<PermissionName>> {
    const rows = await this.db
      .select({ name: schema.permission.name })
      .from(schema.userRole)
      .innerJoin(schema.rolePermission, eq(schema.rolePermission.roleId, schema.userRole.roleId))
      .innerJoin(schema.permission, eq(schema.permission.id, schema.rolePermission.permissionId))
      .where(eq(schema.userRole.userId, userId));

    const set = new Set<PermissionName>();
    for (const r of rows) {
      const name = r.name as PermissionName;
      if ((PERMISSIONS as readonly string[]).includes(name)) set.add(name);
    }
    return set;
  }

  async resolveAllPermissions(): Promise<PermissionName[]> {
    const rows = await this.db
      .select({ name: schema.permission.name })
      .from(schema.permission);

    return rows.map((row) => row.name as PermissionName);
  }
}
