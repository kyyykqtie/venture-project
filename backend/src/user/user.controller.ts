import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PermissionService } from '../role/permission.service';
import { RoleService } from '../role/role.service';
import type { AuthUser } from './types';
import { UserService } from './user.service';

// Local intersection kept in-file to satisfy isolatedModules + emitDecoratorMetadata constraints
interface AuthRequest {
  user?: AuthUser;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly roleService: RoleService,
  ) {}

  private isAdmin(req: AuthRequest): boolean {
    return (
      req.user?.role === 'admin' ||
      req.user?.admin === true ||
      req.user?.isAdmin === true
    );
  }

  @Get('me')
  async getMe(@Req() req: any) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) throw new UnauthorizedException();

    const base = await this.userService.findMeWithDepartment(userId);
    if (!base) throw new UnauthorizedException();

    const permissions = this.isAdmin(authReq)
      ? await this.permissionService.resolveAllPermissions()
      : Array.from(await this.permissionService.resolvePermissions(userId));

    return { ...base, permissions };
  }

  @Get()
  findAll() {
    return this.userService.findAllWithDepartments();
  }

  @Put(':id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() body: { role: string; permissions: string[] },
    @Req() req: any,
  ) {
    if (!this.isAdmin(req as AuthRequest)) {
      throw new ForbiddenException('Only admin users can update user roles and permissions');
    }
    return this.roleService.setUserRoleAndPermissions(
      userId,
      body.role,
      body.permissions ?? [],
    );
  }
}
