import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../permission.constants';

// CHANGED: removed a locally hand-typed `Permission` union that duplicated
// PermissionName (which is already derived from PERMISSIONS in
// permission.constants.ts — the actual single source of truth). Having two
// separate lists of the same 13 permission strings meant they could silently
// drift out of sync; MultipleRequirePermission below now just uses
// PermissionName directly.

export const PERMISSION_KEY = 'requiredPermission';
export const MULTIPLE_PERMISSION_KEY = 'permissions'; // CHANGED: this was previously an inline string literal passed directly to SetMetadata below, duplicated nowhere else — now exported so permission.guard.ts can import the exact same constant instead of re-typing the string a second time.

export const RequirePermission = (permission: PermissionName) =>
  SetMetadata(PERMISSION_KEY, permission);

export function MultipleRequirePermission(
  permissionOrPermissions: PermissionName | PermissionName[], // CHANGED: was the local duplicate `Permission` type
) {
  const permissions = Array.isArray(permissionOrPermissions)
    ? permissionOrPermissions
    : [permissionOrPermissions];

  return SetMetadata(MULTIPLE_PERMISSION_KEY, permissions); // CHANGED: was SetMetadata('permissions', permissions) — now references the constant above
}