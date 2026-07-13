import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { RequirePermission } from './decorators/require-permission.decorator';
import { PermissionGuard } from './guards/permission.guard';

@Controller()
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('roles')
  @RequirePermission('manage_roles_permissions')
  listRoles() {
    return this.roleService.listRoles();
  }

  @Post('roles')
  @RequirePermission('manage_roles_permissions')
  createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto.name, dto.description);
  }

  @Put('roles/:id')
  @RequirePermission('manage_roles_permissions')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(id, dto.name, dto.description);
  }

  @Delete('roles/:id')
  @RequirePermission('manage_roles_permissions')
  deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @Post('roles/:id/permissions')
  @RequirePermission('manage_roles_permissions')
  assignPermission(@Param('id') id: string, @Body() dto: AssignPermissionDto) {
    return this.roleService.assignPermission(id, dto.permission as string);
  }

  @Delete('roles/:id/permissions/:name')
  @RequirePermission('manage_roles_permissions')
  revokePermission(@Param('id') id: string, @Param('name') name: string) {
    return this.roleService.revokePermission(id, name);
  }

  @Post('users/:userId/roles')
  @RequirePermission('manage_roles_permissions')
  assignUserRole(@Param('userId') userId: string, @Body() dto: AssignUserRoleDto) {
    return this.roleService.assignUserRole(userId, dto.roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  @RequirePermission('manage_roles_permissions')
  revokeUserRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.roleService.revokeUserRole(userId, roleId);
  }
}
