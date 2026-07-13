import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID } from 'crypto';
import * as schema from '../auth/schema';
import { DATABASE_CONNECTION } from '../database/database.connection';
import { PERMISSIONS } from './permission.constants';

@Injectable()
export class RoleService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async findRoleOrThrow(id: string) {
    const [role] = await this.db
      .select()
      .from(schema.role)
      .where(eq(schema.role.id, id))
      .limit(1);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  private guardSystemRole(role: { isSystem: boolean }, action = 'modify') {
    if (role.isSystem) throw new ForbiddenException(`Cannot ${action} system role`);
  }

  // ── Public methods ───────────────────────────────────────────────────────────

  async listRoles() {
    const rows = await this.db
      .select({
        roleId: schema.role.id,
        roleName: schema.role.name,
        roleDescription: schema.role.description,
        roleIsSystem: schema.role.isSystem,
        permissionName: schema.permission.name,
      })
      .from(schema.role)
      .leftJoin(schema.rolePermission, eq(schema.rolePermission.roleId, schema.role.id))
      .leftJoin(schema.permission, eq(schema.permission.id, schema.rolePermission.permissionId));

    const map = new Map<string, { id: string; name: string; description: string | null; isSystem: boolean; permissions: string[] }>();
    for (const r of rows) {
      const id = r.roleId as string;
      const perm = (r.permissionName as string) ?? null;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: r.roleName as string,
          description: (r.roleDescription as string | null) ?? null,
          isSystem: r.roleIsSystem as boolean,
          permissions: [],
        });
      }
      if (perm) map.get(id)!.permissions.push(perm);
    }

    return Array.from(map.values()).map((r) => ({
      ...r,
      permissions: Array.from(new Set(r.permissions)),
    }));
  }

  async createRole(name: string, description?: string | null) {
    const trimmed = name?.trim();
    if (!trimmed || trimmed.length > 100) throw new BadRequestException('Invalid name');

    const existing = await this.db.select({ name: schema.role.name }).from(schema.role);
    if (existing.some((e) => e.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new ConflictException('Role name already exists');
    }

    const id = randomUUID();
    await this.db.insert(schema.role).values({ id, name: trimmed, description: description ?? null, isSystem: false });
    return { id, name: trimmed, description: description ?? null, isSystem: false };
  }

  async updateRole(id: string, name?: string, description?: string | null) {
    const role = await this.findRoleOrThrow(id);
    this.guardSystemRole(role);

    if (name !== undefined) {
      const trimmed = name?.trim();
      if (!trimmed || trimmed.length > 100) throw new BadRequestException('Invalid name');
      const all = await this.db.select({ id: schema.role.id, name: schema.role.name }).from(schema.role);
      if (all.some((e) => e.name.toLowerCase() === trimmed.toLowerCase() && e.id !== id)) {
        throw new ConflictException('Role name already exists');
      }
      await this.db.update(schema.role).set({ name: trimmed }).where(eq(schema.role.id, id));
    }

    if (description !== undefined) {
      await this.db.update(schema.role).set({ description: description ?? null }).where(eq(schema.role.id, id));
    }

    const [updated] = await this.db.select().from(schema.role).where(eq(schema.role.id, id)).limit(1);
    return updated;
  }

  async deleteRole(id: string) {
    const role = await this.findRoleOrThrow(id);
    this.guardSystemRole(role, 'delete');
    await this.db.delete(schema.role).where(eq(schema.role.id, id));
    return { success: true };
  }

  async assignPermission(roleId: string, permissionName: string) {
    const role = await this.findRoleOrThrow(roleId);
    this.guardSystemRole(role);

    if (!(PERMISSIONS as readonly string[]).includes(permissionName)) {
      throw new BadRequestException('Invalid permission');
    }

    const [perm] = await this.db
      .select()
      .from(schema.permission)
      .where(eq(schema.permission.name, permissionName))
      .limit(1);
    if (!perm) throw new NotFoundException('Permission not found');

    const [exists] = await this.db
      .select()
      .from(schema.rolePermission)
      .where(and(eq(schema.rolePermission.roleId, roleId), eq(schema.rolePermission.permissionId, perm.id)))
      .limit(1);
    if (exists) return { success: true };

    await this.db.insert(schema.rolePermission).values({ roleId, permissionId: perm.id });
    return { success: true };
  }

  async revokePermission(roleId: string, permissionName: string) {
    const role = await this.findRoleOrThrow(roleId);
    this.guardSystemRole(role);

    const [perm] = await this.db
      .select()
      .from(schema.permission)
      .where(eq(schema.permission.name, permissionName))
      .limit(1);
    if (!perm) throw new BadRequestException('Invalid permission');

    await this.db
      .delete(schema.rolePermission)
      .where(and(eq(schema.rolePermission.roleId, roleId), eq(schema.rolePermission.permissionId, perm.id)));
    return { success: true };
  }

  async setUserRoleAndPermissions(targetUserId: string, roleName: string, permissionNames: string[]) {
    if (roleName === 'admin') throw new ForbiddenException('Cannot promote a user to admin on this endpoint');

    const [targetUser] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, targetUserId))
      .limit(1);
    if (!targetUser) throw new NotFoundException('Target user not found');
    if (targetUser.role === 'admin') throw new ForbiddenException('Admin user cannot be modified through this endpoint');

    if (roleName !== 'user') {
      const [roleRow] = await this.db.select().from(schema.role).where(eq(schema.role.name, roleName)).limit(1);
      if (!roleRow) throw new NotFoundException('Role not found');
    }

    const permissionRows = permissionNames.length
      ? await this.db
          .select({ id: schema.permission.id, name: schema.permission.name })
          .from(schema.permission)
          .where(inArray(schema.permission.name, permissionNames))
      : [];

    const invalid = permissionNames.filter((p) => !permissionRows.some((r) => r.name === p));
    if (invalid.length > 0) throw new BadRequestException(`Invalid permissions: ${invalid.join(', ')}`);

    await this.db.transaction(async (tx) => {
      await tx.update(schema.user).set({ role: roleName }).where(eq(schema.user.id, targetUserId));
      await tx.delete(schema.userPermission).where(eq(schema.userPermission.userId, targetUserId));
      if (permissionRows.length > 0) {
        await tx.insert(schema.userPermission).values(
          permissionRows.map((p) => ({ userId: targetUserId, permissionId: p.id })),
        );
      }
    });

    return { success: true };
  }
}
