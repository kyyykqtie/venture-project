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
import { RequirePermission } from './decorators/require-permission.decorator';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionGuard } from './guards/permission.guard';
import { RoleService } from './role.service';

@Controller('roles')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermission('manage_roles_permissions')
  async listRoles() {
    return { roles: await this.roleService.listRoles() };
  }

  @Post()
  @RequirePermission('manage_roles_permissions')
  async createRole(@Body() dto: CreateRoleDto) {
    return { role: await this.roleService.createRole(dto.name, dto.description) };
  }

  @Put(':id')
  @RequirePermission('manage_roles_permissions')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(id, dto.name, dto.description);
  }

  @Delete(':id')
  @RequirePermission('manage_roles_permissions')
  deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @Post(':id/permissions')
  @RequirePermission('manage_roles_permissions')
  assignPermission(@Param('id') id: string, @Body() dto: AssignPermissionDto) {
    return this.roleService.assignPermission(id, dto.permission as string);
  }

  @Delete(':id/permissions/:name')
  @RequirePermission('manage_roles_permissions')
  revokePermission(@Param('id') id: string, @Param('name') name: string) {
    return this.roleService.revokePermission(id, name);
  }
}
