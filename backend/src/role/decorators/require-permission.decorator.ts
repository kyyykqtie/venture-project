import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../permission.constants';

export const PERMISSION_KEY = 'requiredPermission';
export const RequirePermission = (permission: PermissionName) =>
  SetMetadata(PERMISSION_KEY, permission);
