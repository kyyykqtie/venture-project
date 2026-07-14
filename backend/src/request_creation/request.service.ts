import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../auth/schema';
import { user, purchaseRequest } from '../auth/schema';
import { DATABASE_CONNECTION } from '../database/database.connection';
import { CreatePurchaseRequestDto } from './request-creation.dto';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(dto: CreatePurchaseRequestDto, requestedByUserId: string) {
    const [requester] = await this.db
      .select({ id: user.id, departmentId: user.departmentId })
      .from(user)
      .where(eq(user.id, requestedByUserId));

    if (!requester) throw new NotFoundException('User not found');
    if (!requester.departmentId) {
      throw new BadRequestException('User has no department assigned');
    }

    const {
      requestNumber,
      title,
      budget,
      requestDate,
      dateNeeded,
      phoneNumber,
      address,
      shippingTerms,
      shippingMethod,
      delivery,
      remarks,
      items,
    } = dto;

    const [row] = await this.db
      .insert(purchaseRequest)
      .values({
        id: randomUUID(),
        requestNumber,
        title,
        budget: budget?.toString() ?? '0',
        departmentId: requester.departmentId, // derived, not trusted from client
        requestedByUserId,
        requestDate: new Date(requestDate),
        dateNeeded: dateNeeded ? new Date(dateNeeded) : null,
        status: 'draft',
        draft: {
          phoneNumber,
          address,
          shippingTerms,
          shippingMethod,
          delivery,
          remarks,
          items,
        },
      })
      .returning();

    return row;
  }
}
