export const PERMISSIONS = [
  'create_request',
  'approve_request_initial',
  'approve_request_final',
  'process_canvass',
  'approve_canvass',
  'generate_po',
  'receive_goods',
  'manage_users',
  'manage_roles_permissions',
  'manage_departments',
  'override_approvals',
  'view_all_records',
  'system_configuration',
] as const;

export type PermissionName = (typeof PERMISSIONS)[number];
