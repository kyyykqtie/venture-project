# Requirements Document

## Introduction

This feature replaces the flat `role: text` column on the `user` table with a full, permission-based roles and permissions system for the Venture procurement backend (NestJS + Drizzle ORM / PostgreSQL). Roles are purely permission-based — no hierarchy. Permissions are static and predefined. The `admin` role is a protected system role seeded at startup with all permissions. Admins can create custom roles, assign permissions to those roles, and assign roles to non-admin users. All endpoint access is enforced through NestJS guards and a custom permission decorator.

## Glossary

- **System**: The Venture procurement backend NestJS application.
- **Role_Service**: The NestJS service responsible for role CRUD operations and permission assignment.
- **Permission_Service**: The NestJS service responsible for resolving a user's effective permissions.
- **Role_Guard**: The NestJS guard that enforces permission requirements on protected endpoints.
- **Admin_Role**: The single protected system role named `admin`, seeded at startup, which cannot be modified or deleted.
- **Custom_Role**: Any role created by an admin user that is not the Admin_Role.
- **Permission**: A static, predefined capability string that grants access to a specific system action. There are exactly 13 permissions.
- **User_Role**: The join between a user record and a role record, representing that the user has been assigned that role.
- **Role_Permission**: The join between a role record and a permission record, representing that the role grants that permission.
- **Seed_Script**: The `src/seed.ts` startup script that provisions required database records.
- **Auth_Plugin**: The `better-auth` admin plugin that manages the `role` text field on the `user` table.

---

## Requirements

### Requirement 1: Static Permission Definitions

**User Story:** As a system architect, I want all permissions to be statically defined and seeded, so that permission names are consistent and cannot be invented at runtime.

#### Acceptance Criteria

1. THE System SHALL define exactly 13 static permissions with the following names: `create_request`, `approve_request_initial`, `approve_request_final`, `process_canvass`, `approve_canvass`, `generate_po`, `receive_goods`, `manage_users`, `manage_roles_permissions`, `manage_departments`, `override_approvals`, `view_all_records`, `system_configuration`. No other permission names are valid system values.
2. WHEN the Seed_Script runs, THE System SHALL insert all 13 static permissions into the `permission` table if they do not already exist, using the exact permission name strings from criterion 1.
3. WHEN the Seed_Script runs and a permission record with a matching `name` already exists, THE System SHALL skip insertion for that permission without error or modification to the existing record.
4. THE System SHALL store each permission as a record with a unique `name` (the permission string), a non-null human-readable `description`, a unique `id`, and `createdAt`/`updatedAt` timestamps.
5. IF a runtime process attempts to evaluate a permission string that is not one of the 13 defined names, THEN THE System SHALL treat it as a failed authorization check and deny access.

---

### Requirement 2: Admin Role Seeding and Protection

**User Story:** As a system administrator, I want the admin role to be seeded automatically and protected from modification, so that administrative access is always available and cannot be accidentally broken.

#### Acceptance Criteria

1. WHEN the Seed_Script runs and no role record named `admin` exists, THE System SHALL create a role record named `admin` with `isSystem` set to `true`.
2. WHEN the Seed_Script runs and an `admin` role record already exists but its `isSystem` flag is not `true`, THE System SHALL update the flag to `true` without modifying any other field.
3. WHEN the Seed_Script runs, THE System SHALL assign all 13 static permissions to the `admin` role if they are not already assigned, leaving existing assignments unchanged.
4. WHEN a request is made to update any field of the Admin_Role, THE Role_Service SHALL leave the Admin_Role record unchanged and reject the request with a 403 Forbidden response.
5. WHEN a request is made to delete the Admin_Role, THE Role_Service SHALL reject the request with a 403 Forbidden response and leave the role record intact.
6. WHEN a request is made to remove a permission from the Admin_Role, THE Role_Service SHALL reject the request with a 403 Forbidden response.

---

### Requirement 3: Database Schema — New Tables

**User Story:** As a backend developer, I want new normalized database tables for roles, permissions, and their join relationships, so that role and permission data is stored relationally and not as plain strings.

#### Acceptance Criteria

1. THE System SHALL introduce a `role` table with columns: `id` (text, PK), `name` (text, unique, not null), `description` (text, nullable), `isSystem` (boolean, default false, not null), `createdAt` (timestamp, defaultNow, not null), `updatedAt` (timestamp, defaultNow, not null).
2. THE System SHALL introduce a `permission` table with columns: `id` (text, PK), `name` (text, unique, not null), `description` (text, nullable), `createdAt` (timestamp, defaultNow, not null), `updatedAt` (timestamp, defaultNow, not null).
3. THE System SHALL introduce a `role_permission` join table with columns: `roleId` (FK → role.id, cascade delete, not null), `permissionId` (FK → permission.id, cascade delete, not null), and a composite primary key of `(roleId, permissionId)`.
4. THE System SHALL introduce a `user_role` join table with columns: `userId` (FK → user.id, cascade delete, not null), `roleId` (FK → role.id, cascade delete, not null), and a composite primary key of `(userId, roleId)`.
5. THE System SHALL retain the existing `role: text` column on the `user` table to preserve compatibility with the Auth_Plugin.
6. WHEN the Drizzle migration for all new tables is applied, THE System SHALL have all four new tables (`role`, `permission`, `role_permission`, `user_role`) queryable in the target database without error.

---

### Requirement 4: Role CRUD (Admin Only)

**User Story:** As an admin, I want to create, read, update, and delete custom roles, so that I can define the permission sets available for assignment to users.

#### Acceptance Criteria

1. WHEN an authenticated user with the `manage_roles_permissions` permission sends a POST request to create a role with a non-empty name (1–100 characters) and optional description, THE Role_Service SHALL create a new Custom_Role with the provided values and return the created record.
2. IF a role creation or rename request provides a name that already exists (case-insensitive), THEN THE Role_Service SHALL reject the request with a 409 Conflict response without creating or modifying any record.
3. WHEN an authenticated user with the `manage_roles_permissions` permission sends a GET request to list roles, THE Role_Service SHALL return all roles (including the Admin_Role) with each role's `id`, `name`, `description`, `isSystem` flag, and the list of associated permission names.
4. WHEN an authenticated user with the `manage_roles_permissions` permission sends a PUT request to update a Custom_Role, THE Role_Service SHALL update the role's name or description as specified. IF the new name is empty or exceeds 100 characters, THEN THE Role_Service SHALL reject the request with a 400 Bad Request response.
5. WHEN an authenticated user with the `manage_roles_permissions` permission sends a DELETE request to delete a Custom_Role, THE Role_Service SHALL delete the role and all related `user_role` and `role_permission` records for that role.
6. IF a request to create, update, or delete a role is made by a user without the `manage_roles_permissions` permission, THEN THE Role_Guard SHALL reject the request with a 403 Forbidden response.

---

### Requirement 5: Permission Assignment to Roles (Admin Only)

**User Story:** As an admin, I want to assign and revoke permissions on custom roles, so that I can precisely control what users with those roles are allowed to do.

#### Acceptance Criteria

1. WHEN an authenticated user with the `manage_roles_permissions` permission sends a request to assign a valid permission to a Custom_Role, THE Role_Service SHALL create the association between that role and permission and return a success response.
2. WHEN an authenticated user with the `manage_roles_permissions` permission sends a request to revoke a permission from a Custom_Role, THE Role_Service SHALL remove the association and return a success response.
3. WHEN a valid permission is assigned to a role that already has that permission, THE Role_Service SHALL return a success response without creating a duplicate record.
4. WHEN a request is made to revoke a permission that is not currently assigned to the target Custom_Role, THE Role_Service SHALL return a success response without modifying any record.
5. WHEN a request is made to assign or revoke a permission on the Admin_Role, THE Role_Service SHALL reject the request with a 403 Forbidden response.
6. IF a request to assign or revoke a permission is made by a user without the `manage_roles_permissions` permission, THEN THE Role_Guard SHALL reject the request with a 403 Forbidden response.
7. IF a request references a role `id` that does not exist, THEN THE Role_Service SHALL reject the request with a 404 Not Found response.
8. IF a request references a permission name that is not one of the 13 valid static permissions, THEN THE Role_Service SHALL reject the request with a 400 Bad Request response.

---

### Requirement 6: Role Assignment to Users (Admin Only)

**User Story:** As an admin, I want to assign a role to any non-admin user, so that I can grant them the appropriate set of permissions for their job function.

#### Acceptance Criteria

1. WHEN an authenticated user with the `manage_roles_permissions` permission sends a request to assign a role to a non-admin target user, THE Role_Service SHALL record that the user holds the role and return a success response.
2. WHEN an authenticated user with the `manage_roles_permissions` permission sends a request to revoke a role from a non-admin target user, THE Role_Service SHALL remove the user-role association and return a success response.
3. WHEN a request assigns a role that the target user already holds, THE Role_Service SHALL return a success response without creating a duplicate record.
4. WHEN a request revokes a role that the target user does not currently hold, THE Role_Service SHALL return a success response without modifying any record.
5. IF a request is made to assign or revoke a role on a user whose `user.role` field equals `admin`, THEN THE Role_Service SHALL reject the request with a 403 Forbidden response.
6. IF a request to assign or revoke a user role is made by a user without the `manage_roles_permissions` permission, THEN THE Role_Guard SHALL reject the request with a 403 Forbidden response.
7. IF the target user `id` in the request does not correspond to an existing user record, THEN THE Role_Service SHALL reject the request with a 404 Not Found response.
8. IF the role `id` in the request does not correspond to an existing role record, THEN THE Role_Service SHALL reject the request with a 404 Not Found response.

---

### Requirement 7: Permission-Based Guard and Decorator

**User Story:** As a backend developer, I want a reusable NestJS guard and decorator that checks a user's permissions, so that any endpoint can be protected by requiring a specific permission.

#### Acceptance Criteria

1. THE System SHALL provide a `@RequirePermission(permission: string)` decorator that attaches the required permission name to a route handler as metadata.
2. WHEN a request reaches an endpoint decorated with `@RequirePermission`, THE Role_Guard SHALL resolve the authenticated user's permissions as the union of all permissions granted by every role assigned to that user.
3. WHEN the resolved permission set contains the required permission, THE Role_Guard SHALL allow the request to proceed.
4. WHEN the resolved permission set does not contain the required permission, THE Role_Guard SHALL reject the request with a 403 Forbidden response.
5. WHEN the authenticated user's `user.role` field equals `admin`, THE Role_Guard SHALL allow the request to proceed without querying the database for permissions.
6. WHEN an endpoint has no `@RequirePermission` decorator, THE Role_Guard SHALL allow the request to proceed without performing a permission check.
7. WHEN a request reaches a `@RequirePermission`-decorated endpoint and no authenticated user identity is present on the request, THE Role_Guard SHALL reject the request with a 401 Unauthorized response.

---

### Requirement 8: Resolved Permissions in User Profile

**User Story:** As a frontend developer, I want the `/users/me` endpoint to return the user's resolved permission list, so that the UI can render only the features the user is permitted to use.

#### Acceptance Criteria

1. WHEN an authenticated user calls `GET /users/me`, THE System SHALL include a `permissions` array in the response containing the distinct set of permission name strings granted to that user through their assigned roles.
2. WHEN the authenticated user's `user.role` field equals `admin`, THE System SHALL include all 13 static permission names in the `permissions` array.
3. WHEN the authenticated user has no roles assigned, or has roles assigned that carry no permissions, THE System SHALL return an empty `permissions` array.
4. THE System SHALL include existing fields (`id`, `name`, `email`, `role`, `departmentId`, `departmentName`) alongside the new `permissions` field — no existing fields shall be removed.
5. IF a database error occurs while resolving permissions, THE System SHALL return a 500 Internal Server Error response rather than a partial or incorrect permissions array.

---

### Requirement 9: All-Users List Includes Assigned Roles

**User Story:** As an admin, I want the `GET /users` endpoint to include each user's assigned roles, so that I can see the current role assignment state for all users at a glance.

#### Acceptance Criteria

1. WHEN an authenticated user with the `manage_users` or `manage_roles_permissions` permission calls `GET /users`, THE System SHALL include a `roles` array on each user record containing the `id` and `name` of each Custom_Role assigned to that user.
2. WHEN a user has no assigned roles, THE System SHALL return an empty `roles` array for that user.
3. WHEN a user whose `user.role` field equals `admin` appears in the list, THE System SHALL return an empty `roles` array for that user, as the Admin_Role is not a Custom_Role assignable via `user_role`.
4. IF a request to `GET /users` is made by a user without the `manage_users` or `manage_roles_permissions` permission, THEN THE Role_Guard SHALL reject the request with a 403 Forbidden response.

---

### Requirement 10: Seed Script Updates

**User Story:** As a DevOps engineer, I want the seed script to be idempotent for all new records, so that re-running it at any time is safe and produces no duplicates.

#### Acceptance Criteria

1. WHEN the Seed_Script runs, THE System SHALL seed all 13 static permissions before seeding the `admin` role, ensuring permissions exist before role-permission associations are created.
2. WHEN the Seed_Script runs and any seed record (permission, role, role-permission link, or user-role link) already exists, THE System SHALL skip that record without error or state change to any other field.
3. WHEN the Seed_Script runs, THE System SHALL write a log line to stdout for each record that is created, and a separate log line for each record that is skipped, including the record type and identifier.
4. WHEN the superadmin user already exists, THE Seed_Script SHALL ensure the `user.role` text field is set to `admin` and that a `user_role` record linking the superadmin to the `admin` role exists, creating the link if absent.
5. WHEN a new superadmin user is created by the Seed_Script, THE Seed_Script SHALL also create a `user_role` record linking the new superadmin user to the `admin` role.
