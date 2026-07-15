import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionService } from '../permission.service';
import { PERMISSIONS, PermissionName } from '../permission.constants';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<PermissionName | undefined>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true;

    // Guard against unknown permission strings at runtime
    if (!(PERMISSIONS as readonly string[]).includes(required)) {
      throw new ForbiddenException();
    }

    const req = context
      .switchToHttp()
      .getRequest<{ user?: { id?: string; role?: string } }>();
    const user = req.user;
    if (!user || !user.id) throw new UnauthorizedException();

    if (user.role === 'admin') return true;

    const perms = await this.permissionService.resolvePermissions(user.id);
    if (perms.has(required)) return true;
    throw new ForbiddenException();
  }
}
