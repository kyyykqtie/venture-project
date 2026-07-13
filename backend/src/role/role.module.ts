import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionService } from './permission.service';
import { DatabaseModule } from '../database/database.module';
import { PermissionGuard } from './guards/permission.guard';
import { Reflector } from '@nestjs/core';
import { PermissionController } from './permission.controller';

@Module({
  imports: [DatabaseModule],
  providers: [RoleService, PermissionService, PermissionGuard, Reflector],
  controllers: [RoleController, PermissionController],
  exports: [RoleService, PermissionService],
})
export class RoleModule {}
