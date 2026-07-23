import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
  Get, // CHANGED: added — needed for the three new GET routes below
} from '@nestjs/common';
import type { AuthUser } from '../../user/types';
import { PermissionGuard } from '../../role/guards/permission.guard';
import { MultipleRequirePermission } from '../../role/decorators/require-permission.decorator'; // CHANGED: swapped from single-permission RequirePermission — some of these routes need an OR of several permissions
import { ApprovalActionDto } from './approve.dto';
import { ApprovalsService } from './approvals.service';

interface AuthRequest {
  user?: AuthUser;
}

@Controller('purchase-requests')
@UseGuards(PermissionGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  // PATCH /purchase-requests/:id/approve/initial
  // UNCHANGED in behavior.
  @Patch(':id/approve/initial')
  @MultipleRequirePermission('approve_request_initial')
  initialApproval(
    @Param('id') requestId: string,
    @Body() dto: ApprovalActionDto,
    @Req() req: any,
  ) {
    const approverId = (req as AuthRequest).user?.id;
    if (!approverId) throw new UnauthorizedException();
    return this.approvalsService.initialApproval(requestId, dto, approverId);
  }

  // PATCH /purchase-requests/:id/approve/final
  // UNCHANGED in behavior.
  @Patch(':id/approve/final')
  @MultipleRequirePermission('approve_request_final')
  finalApproval(
    @Param('id') requestId: string,
    @Body() dto: ApprovalActionDto,
    @Req() req: any,
  ) {
    const approverId = (req as AuthRequest).user?.id;
    if (!approverId) throw new UnauthorizedException();
    return this.approvalsService.finalApproval(requestId, dto, approverId);
  }

  // GET /purchase-requests  ("Requests" page — role-scoped queue)
  // CHANGED: entire route is new.
  // Any approver of either stage, or anyone with view_all_records, may call
  // this — but each caller gets a DIFFERENT result set. The permission check
  // here only gates entry to the route; the actual per-user filtering happens
  // inside ApprovalsService.findQueueForUser().
  @Get()
  @MultipleRequirePermission([
    'approve_request_initial',
    'approve_request_final',
    'view_all_records',
  ])
  findQueue(@Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.approvalsService.findQueueForUser(userId);
  }

  // GET /purchase-requests/mine  ("My Requests" page)
  // CHANGED: entire route is new.
  // MUST be declared before @Get(':id') below — Nest matches routes
  // top-to-bottom within a controller, and ':id' will otherwise swallow
  // this path with id="mine". (This bit us twice during development —
  // if you ever add another literal GET route here, keep it above ':id'.)
  //
  // No permission decorator: this route is already scoped to
  // requestedByUserId = caller inside the service, so a permission gate
  // adds no security, only risk of accidentally excluding a legitimate user.
  @Get('mine')
  findMine(@Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.approvalsService.findMine(userId);
  }

  // GET /purchase-requests/:id  (single request detail)
  // CHANGED: entire route is new.
  // MUST stay LAST among the GET routes in this controller — see note above.
  //
  // The decorator here is intentionally broad (covers nearly every real
  // user, since create_request is the base permission almost everyone has).
  // It is only the outer gate ("is this a legitimate app user at all").
  // The actual "can THIS user see THIS specific request" check happens
  // inside ApprovalsService.findOne() — owner OR approver OR view_all_records,
  // enforced against the row's actual requestedByUserId, not just role/permission.
  @Get(':id')
  @MultipleRequirePermission([
    'create_request',
    'approve_request_initial',
    'approve_request_final',
    'view_all_records',
  ])
  findOne(@Param('id') requestId: string, @Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.approvalsService.findOne(requestId, userId);
  }
}


