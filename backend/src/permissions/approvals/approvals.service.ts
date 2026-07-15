import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../auth/schema';
import { purchaseRequest } from '../../auth/schema';
import { DATABASE_CONNECTION } from '../../database/database.connection';
import { ApprovalActionDto, ApprovalDecision } from './approve.dto';

// Status values that live on purchaseRequest.status
const STATUS = {
  submitted: 'submitted',
  pendingInitial: 'pending_initial_approval',
  pendingFinal: 'pending_final_approval',
  approved: 'approved',
  declined: 'declined',
} as const;

@Injectable()
export class ApprovalsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // ── Initial approval ───────────────────────────────────────────────────────
  // Required permission: approve_request_initial
  // Allowed from status:  submitted | pending_initial_approval
  // Transitions to:       pending_final_approval  (approve)
  //                       declined                (decline)
  async initialApproval(
    requestId: string,
    dto: ApprovalActionDto,
    approverId: string,
  ) {
    const request = await this.findOrThrow(requestId);

    if (
      request.status !== STATUS.submitted &&
      request.status !== STATUS.pendingInitial
    ) {
      throw new BadRequestException(
        `Cannot apply initial approval to a request with status "${request.status}".`,
      );
    }

    if (dto.decision === ApprovalDecision.Decline && !dto.remarks) {
      throw new BadRequestException(
        'A reason is required when declining a request.',
      );
    }

    const nextStatus =
      dto.decision === ApprovalDecision.Approve
        ? STATUS.pendingFinal
        : STATUS.declined;

    const [updated] = await this.db
      .update(purchaseRequest)
      .set({
        status: nextStatus,
        draft: this.mergeDraftNote(request.draft, {
          initialApproval: {
            decision: dto.decision,
            remarks: dto.remarks ?? null,
            approverId,
            decidedAt: new Date().toISOString(),
          },
        }),
      })
      .where(eq(purchaseRequest.id, requestId))
      .returning();

    return updated;
  }

  // ── Final approval ─────────────────────────────────────────────────────────
  // Required permission: approve_request_final
  // Allowed from status:  pending_final_approval
  // Transitions to:       approved   (approve)
  //                       declined   (decline)
  async finalApproval(
    requestId: string,
    dto: ApprovalActionDto,
    approverId: string,
  ) {
    const request = await this.findOrThrow(requestId);

    if (request.status !== STATUS.pendingFinal) {
      throw new BadRequestException(
        `Cannot apply final approval to a request with status "${request.status}". It must be in "${STATUS.pendingFinal}" first.`,
      );
    }

    if (dto.decision === ApprovalDecision.Decline && !dto.remarks) {
      throw new BadRequestException(
        'A reason is required when declining a request.',
      );
    }

    const nextStatus =
      dto.decision === ApprovalDecision.Approve
        ? STATUS.approved
        : STATUS.declined;

    const [updated] = await this.db
      .update(purchaseRequest)
      .set({
        status: nextStatus,
        draft: this.mergeDraftNote(request.draft, {
          finalApproval: {
            decision: dto.decision,
            remarks: dto.remarks ?? null,
            approverId,
            decidedAt: new Date().toISOString(),
          },
        }),
      })
      .where(eq(purchaseRequest.id, requestId))
      .returning();

    return updated;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async findOrThrow(requestId: string) {
    const [request] = await this.db
      .select()
      .from(purchaseRequest)
      .where(eq(purchaseRequest.id, requestId));

    if (!request) throw new NotFoundException('Purchase request not found.');
    return request;
  }

  /**
   * Merges approval metadata into the existing JSONB draft blob
   * so all approval history is co-located with the request data.
   */
  private mergeDraftNote(
    existing: unknown,
    patch: Record<string, unknown>,
  ): Record<string, unknown> {
    const base =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? (existing as Record<string, unknown>)
        : {};
    return { ...base, ...patch };
  }
}
