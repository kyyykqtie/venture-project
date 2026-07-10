import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../database/database.connection';
import * as schema from '../auth/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class DepartmentService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db
      .select()
      .from(schema.department)
      .orderBy(schema.department.name);
  }

  async create(name: string, description?: string) {
    const [created] = await this.db
      .insert(schema.department)
      .values({ id: randomUUID(), name, description })
      .returning();
    return created;
  }

  async assignUserDepartment(userId: string, departmentId: string) {
    const [updated] = await this.db
      .update(schema.user)
      .set({ departmentId })
      .where(eq(schema.user.id, userId))
      .returning({ id: schema.user.id, departmentId: schema.user.departmentId });
    return updated;
  }
}
