import { Inject, Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../database/database.connection';
import * as schema from '../auth/schema';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { PERMISSIONS, PermissionName } from './permission.constants';

@Injectable()
export class RoleService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async listRoles() {
    const roles = await this.db.select().from(schema.role).orderBy(schema.role.name);
    const out = [] as any[];
    for (const r of roles) {
      const perms = await this.db
        .select({ name: schema.permission.name })
        .from(schema.rolePermission)
        .innerJoin(schema.permission, eq(schema.permission.id, schema.rolePermission.permissionId))
        .where(eq(schema.rolePermission.roleId, r.id));
      out.push({ id: r.id, name: r.name, description: r.description, isSystem: r.isSystem, permissions: perms.map((p) => p.name) });
    }
    return out;
  }

  async createRole(name: string, description?: string | null) {
    const trimmed = name?.trim();
    if (!trimmed || trimmed.length === 0 || trimmed.length > 100) throw new BadRequestException('Invalid name');

    const existing = await this.db.select({ id: schema.role.id, name: schema.role.name }).from(schema.role);
    if (existing.some((e) => e.name.toLowerCase() === trimmed.toLowerCase())) throw new ConflictException('Role name already exists');

    const id = randomUUID();
    await this.db.insert(schema.role).values({ id, name: trimmed, description: description ?? null, isSystem: false });
    return { id, name: trimmed, description: description ?? null, isSystem: false };
  }

  async updateRole(id: string, name?: string, description?: string | null) {
    const role = await this.db.select().from(schema.role).where(eq(schema.role.id, id)).limit(1);
    if (role.length === 0) throw new NotFoundException('Role not found');
    if (role[0].isSystem) throw new ForbiddenException('Cannot modify system role');

    if (name !== undefined) {
      const trimmed = name?.trim();
      if (!trimmed || trimmed.length === 0 || trimmed.length > 100) throw new BadRequestException('Invalid name');
      const all = await this.db.select({ id: schema.role.id, name: schema.role.name }).from(schema.role);
      if (all.some((e) => e.name.toLowerCase() === trimmed.toLowerCase() && e.id !== id)) throw new ConflictException('Role name already exists');
      await this.db.update(schema.role).set({ name: trimmed }).where(eq(schema.role.id, id));
    }

    if (description !== undefined) {
      await this.db.update(schema.role).set({ description: description ?? null }).where(eq(schema.role.id, id));
    }

    const updated = await this.db.select().from(schema.role).where(eq(schema.role.id, id)).limit(1);
    return updated[0];
  }

  async deleteRole(id: string) {
    const role = await this.db.select().from(schema.role).where(eq(schema.role.id, id)).limit(1);
    if (role.length === 0) throw new NotFoundException('Role not found');
    if (role[0].isSystem) throw new ForbiddenException('Cannot delete system role');
    await this.db.delete(schema.role).where(eq(schema.role.id, id));
    return { success: true };
  }

  async assignPermission(roleId: string, permissionName: string) {
    const role = await this.db.select().from(schema.role).where(eq(schema.role.id, roleId)).limit(1);
    if (role.length === 0) throw new NotFoundException('Role not found');
    if (role[0].isSystem) throw new ForbiddenException('Cannot modify system role permissions');

    if (!(PERMISSIONS as readonly string[]).includes(permissionName)) throw new BadRequestException('Invalid permission');

    const perm = await this.db.select().from(schema.permission).where(eq(schema.permission.name, permissionName)).limit(1);
    if (perm.length === 0) throw new NotFoundException('Permission not found');

    const exists = await this.db
      .select()
      .from(schema.rolePermission)
      .where(and(eq(schema.rolePermission.roleId, roleId), eq(schema.rolePermission.permissionId, perm[0].id)))
      .limit(1);
    if (exists.length > 0) return { success: true };

    await this.db.insert(schema.rolePermission).values({ roleId, permissionId: perm[0].id });
    return { success: true };
  }

  async revokePermission(roleId: string, permissionName: string) {
    const role = await this.db.select().from(schema.role).where(eq(schema.role.id, roleId)).limit(1);
    if (role.length === 0) throw new NotFoundException('Role not found');
    if (role[0].isSystem) throw new ForbiddenException('Cannot modify system role permissions');

    const perm = await this.db.select().from(schema.permission).where(eq(schema.permission.name, permissionName)).limit(1);
    if (perm.length === 0) throw new BadRequestException('Invalid permission');

    await this.db
      .delete(schema.rolePermission)
      .where(and(eq(schema.rolePermission.roleId, roleId), eq(schema.rolePermission.permissionId, perm[0].id)));
    return { success: true };
  }

  async assignUserRole(userId: string, roleId: string) {
    const user = await this.db.select().from(schema.user).where(eq(schema.user.id, userId)).limit(1);
    if (user.length === 0) throw new NotFoundException('User not found');
    if (user[0].role === 'admin') throw new ForbiddenException('Cannot modify admin user roles');

    const role = await this.db.select().from(schema.role).where(eq(schema.role.id, roleId)).limit(1);
    if (role.length === 0) throw new NotFoundException('Role not found');

    const exists = await this.db
      .select()
      .from(schema.userRole)
      .where(and(eq(schema.userRole.userId, userId), eq(schema.userRole.roleId, roleId)))
      .limit(1);
    if (exists.length > 0) return { success: true };

    await this.db.insert(schema.userRole).values({ userId, roleId });
    return { success: true };
  }

  async revokeUserRole(userId: string, roleId: string) {
    const user = await this.db.select().from(schema.user).where(eq(schema.user.id, userId)).limit(1);
    if (user.length === 0) throw new NotFoundException('User not found');
    if (user[0].role === 'admin') throw new ForbiddenException('Cannot modify admin user roles');

    const role = await this.db.select().from(schema.role).where(eq(schema.role.id, roleId)).limit(1);
    if (role.length === 0) throw new NotFoundException('Role not found');

    await this.db
      .delete(schema.userRole)
      .where(and(eq(schema.userRole.userId, userId), eq(schema.userRole.roleId, roleId)));
    return { success: true };
  }
}
