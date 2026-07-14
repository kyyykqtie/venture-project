import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../auth/schema';
import { DATABASE_CONNECTION } from '../database/database.connection';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAllWithDepartments() {
    const rows = await this.db
      .select({
        userId: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        image: schema.user.image,
        role: schema.user.role,
        departmentName: schema.department.name,
        permissionName: schema.permission.name,
      })
      .from(schema.user)
      .leftJoin(
        schema.department,
        eq(schema.user.departmentId, schema.department.id),
      )
      .leftJoin(
        schema.userPermission,
        eq(schema.userPermission.userId, schema.user.id),
      )
      .leftJoin(
        schema.permission,
        eq(schema.permission.id, schema.userPermission.permissionId),
      )
      .execute();

    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        role: string;
        departmentName?: string | null;
        permissions: string[];
      }
    >();

    for (const row of rows) {
      const perm = row.permissionName ?? null;
      const existing = map.get(row.userId);
      if (!existing) {
        map.set(row.userId, {
          id: row.userId,
          name: row.name,
          email: row.email,
          image: row.image,
          role: row.role,
          departmentName: row.departmentName ?? null,
          permissions: perm ? [perm] : [],
        });
      } else if (perm && !existing.permissions.includes(perm)) {
        existing.permissions.push(perm);
      }
    }

    return Array.from(map.values());
  }

  async findMeWithDepartment(userId: string) {
    const [row] = await this.db
      .select({
        userId: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        image: schema.user.image,
        role: schema.user.role,
        departmentName: schema.department.name,
      })
      .from(schema.user)
      .leftJoin(
        schema.department,
        eq(schema.user.departmentId, schema.department.id),
      )
      .where(eq(schema.user.id, userId))
      .execute();

    if (!row) return null;

    return {
      id: row.userId,
      name: row.name,
      email: row.email,
      image: row.image,
      role: row.role,
      departmentName: row.departmentName ?? null,
    };
  }

  async findById(userId: string) {
    const [user] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .execute();
    return user;
  }
}
