import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Plus, Trash2, RefreshCw } from "lucide-react"

const API = "http://localhost:3000"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Role {
  id: string
  name: string
  description?: string | null
  isSystem: boolean
  permissions: string[]
}

interface UserRecord {
  id: string
  name: string
  email: string
  image?: string | null
  role: string
  departmentName?: string | null
  roles: { id: string; name: string }[]
  permissions: string[]
}

// ── Permissions ───────────────────────────────────────────────────────────────

const ALL_PERMISSIONS = [
  "create_request", "approve_request_initial", "approve_request_final",
  "process_canvass", "approve_canvass", "generate_po", "receive_goods",
  "manage_users", "manage_roles_permissions", "manage_departments",
  "override_approvals", "view_all_records", "system_configuration",
] as const

const PERM_LABEL: Record<string, string> = {
  create_request: "Create Request",
  approve_request_initial: "Approve Request (Initial)",
  approve_request_final: "Approve Request (Final)",
  process_canvass: "Process Canvass",
  approve_canvass: "Approve Canvass",
  generate_po: "Generate PO",
  receive_goods: "Receive Goods",
  manage_users: "Manage Users",
  manage_roles_permissions: "Manage Roles & Permissions",
  manage_departments: "Manage Departments",
  override_approvals: "Override Approvals",
  view_all_records: "View All Records",
  system_configuration: "System Configuration",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("")
}

async function api(path: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `Request failed (${res.status})`)
  }
  return res
}

function Spinner() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  )
}

function PermBtn({
  active, disabled, onClick, children,
}: {
  active: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-slate-800 bg-slate-900 text-white"
          : disabled
          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-default"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RolesPermissionsPage() {
  const [tab, setTab] = useState<"roles" | "users">("roles")
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true)
    setError(null)
    try {
      const data = await (await api("/roles")).json()
      setRoles(Array.isArray(data.roles) ? data.roles : [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingRoles(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    setError(null)
    try {
      const data = await (await api("/users")).json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    async function init() { await fetchRoles(); await fetchUsers() }
    init()
  }, [fetchRoles, fetchUsers])

  const customRoles = roles.filter((r) => !r.isSystem)

  return (
    <div className="flex w-full h-full flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles &amp; Permissions</h2>
          <p className="mt-1 text-sm text-gray-600">Manage custom roles, assign permissions to roles, and assign roles to users.</p>
        </div>
        <button
          onClick={() => { fetchRoles(); fetchUsers() }}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {(["roles", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "roles" ? <Shield className="size-3.5" /> : <Users className="size-3.5" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {tab === "roles"
        ? <RolesTab roles={roles} isLoading={loadingRoles} onRefresh={fetchRoles} onError={setError} />
        : <UsersTab users={users} customRoles={customRoles} isLoading={loadingUsers} onRefresh={fetchUsers} onError={setError} />
      }
    </div>
  )
}

// ── Roles Tab ─────────────────────────────────────────────────────────────────

function RolesTab({ roles, isLoading, onRefresh, onError }: {
  roles: Role[]; isLoading: boolean; onRefresh: () => void; onError: (m: string) => void
}) {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) { onError("Role name is required."); return }
    setCreating(true)
    try {
      await api("/roles", { method: "POST", body: JSON.stringify({ name: trimmed, description: desc.trim() || null }) })
      setName(""); setDesc(""); onError(""); onRefresh()
    } catch (e) { onError((e as Error).message) }
    finally { setCreating(false) }
  }

  async function handleDelete(id: string) {
    try { await api(`/roles/${id}`, { method: "DELETE" }); onRefresh() }
    catch (e) { onError((e as Error).message) }
  }

  async function handleTogglePerm(role: Role, perm: string) {
    try {
      if (role.permissions.includes(perm)) {
        await api(`/roles/${role.id}/permissions/${perm}`, { method: "DELETE" })
      } else {
        await api(`/roles/${role.id}/permissions`, { method: "POST", body: JSON.stringify({ permission: perm }) })
      }
      onRefresh()
    } catch (e) { onError((e as Error).message) }
  }

  if (isLoading) return <Spinner />

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Create new role</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Role name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="e.g. procurement_editor" maxLength={100} />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Description (optional)</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Short description" />
          </div>
          <button onClick={handleCreate} disabled={creating || !name.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition">
            <Plus className="size-3.5" />{creating ? "Creating…" : "Create role"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <span className="font-medium">Admin</span> is a system role with all 13 permissions. It cannot be modified or deleted.
      </div>

      {roles.length === 0
        ? <p className="text-center text-sm text-gray-400 py-8">No roles found.</p>
        : <div className="flex flex-col gap-4">
            {roles.map((role, i) => (
              <motion.div key={role.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border-gray-200">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{role.name}</CardTitle>
                        {role.isSystem && <Badge variant="secondary" className="text-xs">system</Badge>}
                      </div>
                      {!role.isSystem && (
                        <button onClick={() => handleDelete(role.id)}
                          className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition">
                          <Trash2 className="size-3" /> Delete
                        </button>
                      )}
                    </div>
                    {role.description && <CardDescription>{role.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_PERMISSIONS.map((perm) => (
                        <PermBtn key={perm} active={role.permissions.includes(perm)} disabled={role.isSystem}
                          onClick={() => !role.isSystem && handleTogglePerm(role, perm)}>
                          {PERM_LABEL[perm] ?? perm}
                        </PermBtn>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
      }
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab({ users, customRoles, isLoading, onRefresh, onError }: {
  users: UserRecord[]; customRoles: Role[]; isLoading: boolean; onRefresh: () => void; onError: (m: string) => void
}) {
  if (isLoading) return <Spinner />
  if (users.length === 0) return <p className="text-center text-sm text-gray-400 py-8">No users found.</p>

  const admins = users.filter((u) => u.role === "admin")
  const nonAdmins = users.filter((u) => u.role !== "admin")

  return (
    <div className="flex flex-col gap-4">
      {admins.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Administrators</p>
          {admins.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <Avatar className="size-8 shrink-0"><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
                {user.departmentName && <p className="truncate text-xs text-gray-400">{user.departmentName}</p>}
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">admin</span>
            </motion.div>
          ))}
        </div>
      )}

      {nonAdmins.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Users</p>
          {nonAdmins.map((user, i) => (
            <UserRow key={user.id} user={user} customRoles={customRoles} index={i} onRefresh={onRefresh} onError={onError} />
          ))}
        </div>
      )}

      {nonAdmins.length === 0 && admins.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-4">No non-admin users found.</p>
      )}
    </div>
  )
}

// ── User Row ──────────────────────────────────────────────────────────────────

function UserRow({ user, customRoles, index, onRefresh, onError }: {
  user: UserRecord; customRoles: Role[]; index: number; onRefresh: () => void; onError: (m: string) => void
}) {
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [selectedPerms, setSelectedPerms] = useState<string[]>(user.permissions ?? [])
  const [dirty, setDirty] = useState(false)

  const stableRole = user.role
  const stablePerms = JSON.stringify(user.permissions ?? [])
  useEffect(() => {
    async function reset() {
      setSelectedRole(stableRole)
      setSelectedPerms(JSON.parse(stablePerms))
      setDirty(false)
    }
    reset()
  }, [stableRole, stablePerms])

  function togglePerm(perm: string) {
    setSelectedPerms((prev) => prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm])
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    try {
      await api(`/users/${user.id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: selectedRole, permissions: selectedPerms }),
      })
      setDirty(false)
      onRefresh()
    } catch (e) { onError((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
      className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 min-w-0 sm:w-56 sm:shrink-0">
          <Avatar className="size-9 shrink-0"><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
            {user.departmentName && <p className="truncate text-xs text-gray-400">{user.departmentName}</p>}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Role</label>
          <select value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setDirty(true) }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-800">
            <option value="user">user (default)</option>
            {customRoles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
        </div>

        <div className="sm:shrink-0 sm:self-end">
          <button onClick={save} disabled={!dirty || saving}
            className="w-full sm:w-auto rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40 transition">
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Direct permissions</p>
        <div className="flex flex-wrap gap-2">
          {ALL_PERMISSIONS.map((perm) => (
            <PermBtn key={perm} active={selectedPerms.includes(perm)} onClick={() => togglePerm(perm)}>
              {PERM_LABEL[perm] ?? perm}
            </PermBtn>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
