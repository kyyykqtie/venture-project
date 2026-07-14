import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../user/types';
import { PermissionGuard } from '../role/guards/permission.guard';
import { RequirePermission } from '../role/decorators/require-permission.decorator';
import { CreatePurchaseRequestDto } from './request-creation.dto';
import { PurchaseRequestsService } from './request.service';

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
}
