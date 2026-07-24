import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RoleModule } from '../../role/role.module';
import { PermissionGuard } from '../../role/guards/permission.guard';
import { Reflector } from '@nestjs/core';
import { PurchaseRequestsController } from './request-creation.controller';
import { PurchaseRequestsService } from './request-creation.service';
import { PdfCacheService } from '../../infrastructure/pdf-cache.service';
import { ApprovalsModule } from '../approvals/approvals.module';

@Module({
  imports: [
    DatabaseModule,
    RoleModule,
    ApprovalsModule,
  ],
  controllers: [PurchaseRequestsController],
  providers: [
    PurchaseRequestsService,
    PermissionGuard,
    Reflector,
    PdfCacheService,
  ],
})
export class PurchaseRequestsModule {}




