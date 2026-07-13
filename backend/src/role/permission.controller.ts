import { Controller, Get } from '@nestjs/common';
import { PermissionService } from './permission.service';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('permissions')
  async getPermissions() {
    return {
      permissions: await this.permissionService.resolveAllPermissions(),
    };
  }
}