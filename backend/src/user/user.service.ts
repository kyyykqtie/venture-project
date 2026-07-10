import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../database/database.connection';
import * as schema from '../auth/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findMeWithDepartment(userId: string) {
    const result = await this.db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        role: schema.user.role,
        departmentId: schema.user.departmentId,
        departmentName: schema.department.name,
      })
      .from(schema.user)
      .leftJoin(
        schema.department,
        eq(schema.user.departmentId, schema.department.id),
      )
      .where(eq(schema.user.id, userId))
      .limit(1);

    return result[0] ?? null;
  }
}
