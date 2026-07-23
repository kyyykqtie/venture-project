import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  MULTIPLE_PERMISSION_KEY, // CHANGED: added — see below
} from '../decorators/require-permission.decorator';
import { PermissionService } from '../permission.service';
import { PERMISSIONS, PermissionName } from '../permission.constants';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // CHANGED — BUG FIX (important, read this):
    // @RequirePermission(...) writes metadata under PERMISSION_KEY
    // ('requiredPermission'), but @MultipleRequirePermission(...) writes
    // under a DIFFERENT key ('permissions'). This guard used to only ever
    // read PERMISSION_KEY — meaning every route decorated with
    // @MultipleRequirePermission was silently returning `required = undefined`
    // and falling through to `if (!required) return true`, i.e. NO permission
    // check ran at all for any of those routes. Any authenticated user could
    // hit them regardless of what permission they actually held.
    //
    // Fix: read both metadata keys and merge them into one array.
    const single = this.reflector.get<PermissionName | undefined>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    const multiple = this.reflector.get<PermissionName[] | undefined>(
      MULTIPLE_PERMISSION_KEY,
      context.getHandler(),
    );

    const required = multiple ?? (single ? [single] : undefined);
    if (!required || required.length === 0) return true;

    // Guard against unknown permission strings at runtime
    // CHANGED: now checks every entry in the array, not just one string
    if (required.some((p) => !(PERMISSIONS as readonly string[]).includes(p))) {
      throw new ForbiddenException();
    }

    const req = context
      .switchToHttp()
      .getRequest<{ user?: { id?: string; role?: string } }>();
    const user = req.user;
    if (!user || !user.id) throw new UnauthorizedException();

    if (user.role === 'admin') return true; // UNCHANGED

    const perms = await this.permissionService.resolvePermissions(user.id);
    // CHANGED: was `perms.has(required)` (single value) — now checks if the
    // user holds ANY of the required permissions (OR semantics), matching
    // what @MultipleRequirePermission is meant to express.
    if (required.some((p) => perms.has(p))) return true;
    throw new ForbiddenException();
  }
}