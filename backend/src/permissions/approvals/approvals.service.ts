import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq, inArray, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../auth/schema';
import { department, purchaseRequest, user } from '../../auth/schema';
import { DATABASE_CONNECTION } from '../../database/database.connection';
import { ApprovalActionDto, ApprovalDecision } from './approve.dto';

// CHANGED: new dependency — resolves a caller's permissions for queue filtering and access checks
import { PermissionService } from '../../role/permission.service';
import { getRequestByIdOrNumber } from '../request/request.utils';




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
    private readonly permissionService: PermissionService,

  ) { }

  // ── Initial approval ─────────────────────────────────────────────────────
  // UNCHANGED from original implementation.
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


  // ── Queue: role-scoped visibility ──────────────────────────────────────────
  // Approvers see only the stage they act on. Anyone without an approval
  // permission falls back to seeing their own submitted requests only.
  async findQueueForUser(userId: string) {
    const permissions = await this.permissionService.resolvePermissions(userId);

    const baseQuery = () =>
      this.db
        .select({
          id: purchaseRequest.id,
          requestNumber: purchaseRequest.requestNumber,
          title: purchaseRequest.title,
          departmentId: purchaseRequest.departmentId,
          departmentName: department.name,
          requestedByUserId: purchaseRequest.requestedByUserId,
          budget: purchaseRequest.budget,
          requestDate: purchaseRequest.requestDate,
          dateNeeded: purchaseRequest.dateNeeded,
          status: purchaseRequest.status,
          updatedAt: purchaseRequest.updatedAt,
        })
        .from(purchaseRequest)
        .leftJoin(department, eq(purchaseRequest.departmentId, department.id));


    if (permissions.has('view_all_records')) {
      return baseQuery();
    }

    const statuses: string[] = [];
    if (permissions.has('approve_request_initial')) {
      statuses.push(STATUS.submitted, STATUS.pendingInitial);
    }
    if (permissions.has('approve_request_final')) {
      statuses.push(STATUS.pendingFinal);
    }

    if (statuses.length > 0) {
      return baseQuery().where(inArray(purchaseRequest.status, statuses));
    }

    // Plain requestor: only what they created themselves
    return baseQuery().where(eq(purchaseRequest.requestedByUserId, userId));
  }

  // ── "My Requests": always the caller's own, regardless of role ─────────────
  async findMine(userId: string) {
    return this.db
      .select({
        id: purchaseRequest.id,
        requestNumber: purchaseRequest.requestNumber,
        title: purchaseRequest.title,
        departmentId: purchaseRequest.departmentId,
        departmentName: department.name,
        requestedByUserId: purchaseRequest.requestedByUserId,
        budget: purchaseRequest.budget,
        requestDate: purchaseRequest.requestDate,
        dateNeeded: purchaseRequest.dateNeeded,
        status: purchaseRequest.status,
        updatedAt: purchaseRequest.updatedAt,
      })
      .from(purchaseRequest)
      .leftJoin(department, eq(purchaseRequest.departmentId, department.id))
      .where(eq(purchaseRequest.requestedByUserId, userId));
  }



  // ── Single request detail (includes full draft blob for approval history) ──

  async findOne(requestId: string, userId: string) {
    const [request] = await this.db
      .select({
        id: purchaseRequest.id,
        requestNumber: purchaseRequest.requestNumber,
        title: purchaseRequest.title,
        departmentId: purchaseRequest.departmentId,
        departmentName: department.name,
        requestedByUserId: purchaseRequest.requestedByUserId,
        requestedByName: user.name,
        requestedByEmail: user.email,
        budget: purchaseRequest.budget,
        requestDate: purchaseRequest.requestDate,
        dateNeeded: purchaseRequest.dateNeeded,
        status: purchaseRequest.status,
        draft: purchaseRequest.draft,
        createdAt: purchaseRequest.createdAt,
        updatedAt: purchaseRequest.updatedAt,
      })
      .from(purchaseRequest)
      .leftJoin(department, eq(purchaseRequest.departmentId, department.id))
      .leftJoin(user, eq(purchaseRequest.requestedByUserId, user.id))
      .where(getRequestByIdOrNumber(requestId));

    if (!request) throw new NotFoundException('Purchase request not found.');

    await this.permissionService.checkRequestAccess(userId, request.requestedByUserId);

    const hydratedDraft = await this.hydrateApprovalMetadata(request.draft);

    return {
      ...request,
      draft: hydratedDraft,
    };
  }


  // ── Helpers ────────────────────────────────────────────────────────────────

  private async findOrThrow(requestId: string) {
    const [request] = await this.db
      .select()
      .from(purchaseRequest)
      .where(getRequestByIdOrNumber(requestId));

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

  private async hydrateApprovalMetadata(existing: unknown) {
    if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
      return null;
    }

    const draft = existing as Record<string, unknown>;
    const approvals = ['initialApproval', 'finalApproval'] as const;

    for (const key of approvals) {
      const approval = draft[key] as Record<string, unknown> | undefined;
      const approverId = approval?.approverId;

      if (typeof approverId !== 'string' || !approverId) {
        continue;
      }

      const [approver] = await this.db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, approverId));

      if (approver) {
        draft[key] = {
          ...approval,
          approverName: approver.name,
          approverEmail: approver.email,
        };
      }
    }

    return draft;
  }

}




