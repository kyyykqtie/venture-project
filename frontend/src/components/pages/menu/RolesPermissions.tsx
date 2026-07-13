import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API_BASE = "http://localhost:3000"

type RoleMeta = {
  value: string
  label: string
  badge: string
  defaultPermission: string
}

const DEFAULT_ROLE_HIERARCHY: RoleMeta[] = [
  { value: "admin",   label: "Superadmin",          badge: "bg-red-100 text-red-700",    defaultPermission: "approve" },
  { value: "manager", label: "Procurement Manager", badge: "bg-blue-100 text-blue-700",   defaultPermission: "write" },
  { value: "Approver",label: "Requisition Approver",badge: "bg-purple-100 text-purple-700",defaultPermission: "approve" },
  { value: "user",    label: "Requestor",           badge: "bg-gray-100 text-gray-600",  defaultPermission: "read" },
]

type Permission = string

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string | null
  departmentName?: string | null
  permission?: string | null
}

function getRoleMeta(role?: string | null, roles: RoleMeta[] = DEFAULT_ROLE_HIERARCHY) {
  return (
    roles.find((r) => r.value === role) ??
    roles[roles.length - 1]
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function sortUsers(users: User[]): User[] {
  return [...users].sort((a, b) => {
    const aIdx = DEFAULT_ROLE_HIERARCHY.findIndex((r) => r.value === a.role)
    const bIdx = DEFAULT_ROLE_HIERARCHY.findIndex((r) => r.value === b.role)
    const aNorm = aIdx === -1 ? DEFAULT_ROLE_HIERARCHY.length : aIdx
    const bNorm = bIdx === -1 ? DEFAULT_ROLE_HIERARCHY.length : bIdx
    if (aNorm !== bNorm) return aNorm - bNorm
    return a.name.localeCompare(b.name)
  })
}

function groupByRole(users: User[], roles: RoleMeta[]) {
  return roles
    .map((roleMeta) => ({
      role: roleMeta,
      users: users.filter((u) => u.role === roleMeta.value),
    }))
    .filter((group) => group.users.length > 0)
}

export default function RolesPermissionsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleMeta[]>(DEFAULT_ROLE_HIERARCHY)
  const [permissions, setPermissions] = useState<string[]>([])
  const [newRoleName, setNewRoleName] = useState("")
  const [newRolePermission, setNewRolePermission] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchPermissions()
  }, [])

  async function fetchUsers() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/users`, { credentials: "include" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError((body as { message?: string }).message ?? "Failed to load users.")
        return
      }
      const data: User[] = await res.json()
      setUsers(sortUsers(data))
    } catch {
      setError("An unexpected error occurred while loading users.")
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchPermissions() {
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/permissions`, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? "Failed to load permissions.");
      }

      const data = await res.json();
      const list = Array.isArray(data.permissions)
        ? data.permissions
        : Array.isArray(data)
        ? data
        : [];

      setPermissions(list);
      if (!newRolePermission && list.length > 0) {
        setNewRolePermission(list[0]);
      }
    } catch (err) {
      setError((err as Error).message ?? "Failed to load permissions.");
    }
  }

  function handleAddRole() {
    const name = newRoleName.trim()
    if (!name) {
      setError("Enter a role name before creating a role.")
      return
    }

    if (!permissions.length) {
      setError("No permissions are available. Please add permissions first.")
      return
    }

    const value = name.toLowerCase().replace(/\s+/g, "_")
    if (roles.some((r) => r.value === value)) {
      setError("This role already exists.")
      return
    }

    setRoles((prev) => [
      ...prev,
      {
        value,
        label: name,
        badge: "bg-emerald-100 text-emerald-700",
        defaultPermission: newRolePermission || permissions[0],
      },
    ])
    setNewRoleName("")
    setNewRolePermission(permissions[0] ?? "")
    setError(null)
  }

  async function handleRoleChange(userId: string, role: string, permission?: string) {
    setUpdatingId(userId)
    try {
      const existingUser = users.find((u) => u.id === userId)
      const permissionToSave =
        permission ??
        existingUser?.permission ??
        getRoleMeta(role, roles).defaultPermission

      const result = await authClient.admin.setRole({
        userId,
        role,
        permission: permissionToSave,
      } as any)

      if (result.error) {
        setError(result.error.message ?? "Failed to update role.")
      } else {
        setUsers((prev) =>
          sortUsers(
            prev.map((u) =>
              u.id === userId
                ? { ...u, role, permission: permissionToSave }
                : u
            )
          )
        )
      }
    } catch {
      setError("An unexpected error occurred while updating the role.")
    } finally {
      setUpdatingId(null)
    }
  }

  const grouped = groupByRole(users, roles)

  return (
    <div className="flex w-full h-full flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles & Permissions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Assign roles and permissions to users. Only admins can change roles.
          </p>
        </div>
        <button
          onClick={() => {
            fetchUsers()
            fetchPermissions()
          }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              New role name
            </label>
            <input
              value={newRoleName}
              onChange={(event) => setNewRoleName(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              placeholder="e.g. procurement_editor"
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Default permission
            </label>
            <Select
              value={newRolePermission}
              onValueChange={(value) => setNewRolePermission(value)}
              disabled={!permissions.length}
            >
              <SelectTrigger className="h-10 w-full text-sm border-gray-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {permissions.map((permission) => (
                  <SelectItem key={permission} value={permission} className="text-sm">
                    {permission}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleAddRole}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Create role
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {roles.map((r, i) => (
          <span key={r.value} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.badge}`}>
              {r.label}
            </span>
            {i < roles.length - 1 && <span className="text-gray-300">›</span>}
          </span>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          No users found.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ role: roleMeta, users: groupUsers }) => (
            <div key={roleMeta.value} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleMeta.badge}`}>
                  {roleMeta.label}
                </span>
                <span className="text-xs text-gray-400">{groupUsers.length} user{groupUsers.length !== 1 ? "s" : ""}</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              <div className="flex flex-col gap-2">
                {groupUsers.map((user, i) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    index={i}
                    roles={roles}
                    permissions={permissions}
                    isUpdating={updatingId === user.id}
                    onSave={handleRoleChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UserRow({
  user,
  index,
  roles,
  permissions,
  isUpdating,
  onSave,
}: {
  user: User
  index: number
  roles: RoleMeta[]
  permissions: string[]
  isUpdating: boolean
  onSave: (userId: string, role: string, permission: string) => void
}) {
  const roleMeta = getRoleMeta(user.role, roles)
  const defaultPermission = permissions.includes(roleMeta.defaultPermission)
    ? roleMeta.defaultPermission
    : permissions[0] ?? "read"

  const [selectedRole, setSelectedRole] = useState(user.role ?? "user")
  const [selectedPermission, setSelectedPermission] = useState<string>(
    user.permission ?? defaultPermission
  )
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setSelectedRole(user.role ?? "user")

    const roleDefault = permissions.includes(getRoleMeta(user.role, roles).defaultPermission)
      ? getRoleMeta(user.role, roles).defaultPermission
      : permissions[0] ?? "read"
    setSelectedPermission(user.permission ?? roleDefault)
    setIsDirty(false)
  }, [user.role, user.permission, roles, permissions])

  useEffect(() => {
    if (user.permission == null) {
      const currentRoleDefault = permissions.includes(getRoleMeta(selectedRole, roles).defaultPermission)
        ? getRoleMeta(selectedRole, roles).defaultPermission
        : permissions[0] ?? "read"
      setSelectedPermission(currentRoleDefault)
    }
  }, [selectedRole, user.permission, roles, permissions])

  const handleSave = () => {
    onSave(user.id, selectedRole, selectedPermission)
    setIsDirty(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-9 shrink-0">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-900">{user.name}</div>
          <div className="truncate text-xs text-gray-500">{user.departmentName ?? "No Department"}</div>
          <div className="truncate text-xs text-gray-500">{user.email}</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-40">
          <label className="sr-only">Role</label>
          <Select
            value={selectedRole}
            onValueChange={(role) => {
              setSelectedRole(role)
              setIsDirty(true)
            }}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-10 text-xs border-gray-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[320px]">
          <div className="text-xs font-medium text-slate-600">Permission</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {permissions.map((permission) => (
              <label
                key={permission}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  selectedPermission === permission
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPermission === permission}
                  onChange={() => {
                    setSelectedPermission(permission)
                    setIsDirty(true)
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                {permission}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 w-full sm:w-36">
        <button
          type="button"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={!isDirty || isUpdating}
          onClick={handleSave}
        >
          {isUpdating ? "Saving…" : isDirty ? "Save" : "Saved"}
        </button>
      </div>
    </motion.div>
  )
}