import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RoleModule } from '../../role/role.module';
import { PermissionGuard } from '../../role/guards/permission.guard';
import { Reflector } from '@nestjs/core';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, PermissionGuard, Reflector],
})
export class ApprovalsModule {}
