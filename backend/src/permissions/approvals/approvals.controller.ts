import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../../user/types';
import { PermissionGuard } from '../../role/guards/permission.guard';
import { RequirePermission } from '../../role/decorators/require-permission.decorator';
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
  @Patch(':id/approve/initial')
  @RequirePermission('approve_request_initial')
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
  @Patch(':id/approve/final')
  @RequirePermission('approve_request_final')
  finalApproval(
    @Param('id') requestId: string,
    @Body() dto: ApprovalActionDto,
    @Req() req: any,
  ) {
    const approverId = (req as AuthRequest).user?.id;
    if (!approverId) throw new UnauthorizedException();
    return this.approvalsService.finalApproval(requestId, dto, approverId);
  }
}
