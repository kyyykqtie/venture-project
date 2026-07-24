import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { eq, desc, sql, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../auth/schema';
import { user, purchaseRequest } from '../../auth/schema';
import { DATABASE_CONNECTION } from '../../database/database.connection';
import { CreatePurchaseRequestDto } from './request.dto';
import { PermissionService } from '../../role/permission.service';
import { getRequestByIdOrNumber } from './request.utils';

@Injectable()
export class PurchaseRequestsService implements OnModuleInit {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly permissionService: PermissionService,
  ) { }


  async onModuleInit() {
    // Ensure the Postgres sequence exists
    await this.db.execute(sql`CREATE SEQUENCE IF NOT EXISTS purchase_request_seq START WITH 1;`);
    // Sync the sequence with the maximum existing numeric request number to avoid duplicate key errors
    await this.db.execute(sql`
      SELECT setval('purchase_request_seq', 
        COALESCE(
          (SELECT MAX(CAST(SUBSTRING(request_number FROM '^REQ-(\d+)$') AS INTEGER)) FROM purchase_request),
          1
        ),
        (SELECT MAX(CAST(SUBSTRING(request_number FROM '^REQ-(\d+)$') AS INTEGER)) FROM purchase_request) IS NOT NULL
      );
    `);
  }

  private async nextRequestNumber(): Promise<string> {
    const res = await this.db.execute<{ nextval: string }>(
      sql`SELECT nextval('purchase_request_seq')`
    );
    const val = res.rows[0]?.nextval;
    const seq = val ? parseInt(val, 10) : 1;
    return `REQ-${String(seq).padStart(4, '0')}`;
  }

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

    for (let attempt = 0; attempt < 3; attempt++) {
      const requestNumber = await this.nextRequestNumber();
      try {
        const [row] = await this.db
          .insert(purchaseRequest)
          .values({
            id: randomUUID(),
            requestNumber,
            title,
            budget: budget?.toString() ?? '0',
            departmentId: requester.departmentId,
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
      } catch (err: any) {
        if (err?.code === '23505') {
          continue;
        }
        throw err;
      }
    }

    throw new BadRequestException(
      'Could not generate a unique request number, please try again.',
    );
  }


  // ── Submit: moves a draft into the approval queue ───────────────────────
  // Only the request's own owner may submit it. Only valid from `draft`.
  async submit(requestId: string, userId: string) {
    const [request] = await this.db
      .select()
      .from(purchaseRequest)
      .where(eq(purchaseRequest.id, requestId));

    if (!request) throw new NotFoundException('Purchase request not found.');

    if (request.requestedByUserId !== userId) {
      throw new UnauthorizedException('You do not own this request.');
    }

    if (request.status !== 'draft') {
      throw new BadRequestException(
        `Cannot submit a request with status "${request.status}". It must be in "draft" first.`,
      );
    }

    const [updated] = await this.db
      .update(purchaseRequest)
      .set({ status: 'submitted' })
      .where(eq(purchaseRequest.id, requestId))
      .returning();

    return updated;
  }

  async findOneForPdf(requestId: string, userId: string) {
    const [request] = await this.db
      .select()
      .from(purchaseRequest)
      .where(getRequestByIdOrNumber(requestId));

    if (!request) throw new NotFoundException('Purchase request not found.');

    await this.permissionService.checkRequestAccess(userId, request.requestedByUserId);

    return request;
  }
}











