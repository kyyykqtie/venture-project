import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { UserService } from './user.service';
import { Request } from 'express';
import { PermissionService } from '../role/permission.service';

interface AuthenticatedRequest extends Request {
  user?: { id: string; role?: string };
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
  ) {}

  /** Returns the logged-in user with their department name */
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const base = await this.userService.findMeWithDepartment(userId);
    if (!base) throw new UnauthorizedException();

    // Admin fast-path: if the better-auth text role is 'admin', return all perms
    const perms = req.user?.role === 'admin'
      ? await this.permissionService.resolveAllPermissions()
      : Array.from(await this.permissionService.resolvePermissions(userId));

    return { ...base, permissions: perms };
  }

  /** Returns all users with their department names — for admin views */
  @Get()
  findAll() {
    return this.userService.findAllWithDepartments();
  }

  @Get('public')
  @Public()
  getPublic() {
    return true;
  }
}
