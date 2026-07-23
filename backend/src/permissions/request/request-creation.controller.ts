import {
  Body,
  Controller,
  Post,
  Req,
  Patch,
  UnauthorizedException,
  UseGuards,
  Param,
} from '@nestjs/common';
import type { AuthUser } from '../../user/types';
import { PermissionGuard } from '../../role/guards/permission.guard';
import { RequirePermission } from '../../role/decorators/require-permission.decorator';
import { CreatePurchaseRequestDto } from './request.dto';
import { PurchaseRequestsService } from './request-creation.service';

interface AuthRequest {
  user?: AuthUser;
}

@Controller('purchase-requests')
@UseGuards(PermissionGuard)
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
  ) {}

  @Post()
  @RequirePermission('create_request')
  create(@Body() dto: CreatePurchaseRequestDto, @Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.purchaseRequestsService.create(dto, userId);
  }


    // PATCH /purchase-requests/:id/submit
  @Patch(':id/submit')
  @RequirePermission('create_request')
  submit(@Param('id') requestId: string, @Req() req: any) {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.purchaseRequestsService.submit(requestId, userId);
  }

}
