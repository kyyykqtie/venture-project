import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RoleModule } from '../role/role.module';
import { PermissionGuard } from '../role/guards/permission.guard';
import { Reflector } from '@nestjs/core';
import { PurchaseRequestsController } from './request.controller';
import { PurchaseRequestsService } from './request.service';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [PurchaseRequestsController],
  providers: [PurchaseRequestsService, PermissionGuard, Reflector],
})
export class PurchaseRequestsModule {}
