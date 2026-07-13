import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { DatabaseModule } from '../database/database.module';
import { PermissionGuard } from './guards/permission.guard';
import { Reflector } from '@nestjs/core';
import { PermissionController } from './permission.controller';

@Module({
  imports: [DatabaseModule],
  providers: [PermissionService, RoleService, PermissionGuard, Reflector],
  controllers: [RoleController, PermissionController],
  exports: [PermissionService, RoleService],
})
export class RoleModule {}
