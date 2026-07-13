import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionService } from '../permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly permissionService: PermissionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<string | undefined>(PERMISSION_KEY, context.getHandler());
    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as { id?: string; role?: string } | undefined;
    if (!user || !user.id) throw new UnauthorizedException();

    if (user.role === 'admin') return true;

    const perms = await this.permissionService.resolvePermissions(user.id);
    if (perms.has(required as any)) return true;
    throw new ForbiddenException();
  }
}
