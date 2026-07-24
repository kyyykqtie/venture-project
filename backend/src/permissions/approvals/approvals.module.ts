import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RoleModule } from '../../role/role.module';
import { PermissionGuard } from '../../role/guards/permission.guard';
import { Reflector } from '@nestjs/core';
import { ApprovalsService } from './approvals.service';

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [],
  providers: [ApprovalsService, PermissionGuard, Reflector],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}

