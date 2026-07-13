import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CirclePlus, Pencil, Trash2 } from "lucide-react"

const API_BASE = "http://localhost:3000"

type RoleBadgeVariant = "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "outline" | "superadmin" | "admin" | "manager" | "staff" | "HR" | "Finance" | "SalesMarketing" | "Operations"

type RoleRecord = {
  id: string
  name: string
  description?: string | null
  isSystem: boolean
  permissions: string[]
  badgeVariant?: RoleBadgeVariant
}

type UserRecord = {
  id: string
  name: string
  email: string
  role: string
  departmentName?: string | null
  permissions?: string[]
}

type PermissionDefinition = {
  name: string
  label: string
  description: string
  category: "read" | "write" | "delete" | "admin"
}

const permissionDefinitions: PermissionDefinition[] = [
  { name: "create_request", label: "Create Requests", description: "Create new requests", category: "write" },
  { name: "approve_request_initial", label: "Approve Initial", description: "Approve requests in the initial stage", category: "write" },
  { name: "approve_request_final", label: "Approve Final", description: "Approve requests in the final stage", category: "write" },
  { name: "process_canvass", label: "Process Canvass", description: "Work with canvass sheets", category: "write" },
  { name: "approve_canvass", label: "Approve Canvass", description: "Approve canvass outcomes", category: "write" },
  { name: "generate_po", label: "Generate PO", description: "Create purchase orders", category: "write" },
  { name: "receive_goods", label: "Receive Goods", description: "Confirm goods receipt", category: "write" },
  { name: "manage_users", label: "Manage Users", description: "Provision and manage users", category: "admin" },
  { name: "manage_roles_permissions", label: "Manage Roles", description: "Create and edit roles and permissions", category: "admin" },
  { name: "manage_departments", label: "Manage Departments", description: "Create and manage departments", category: "delete" },
  { name: "override_approvals", label: "Override Approvals", description: "Override completed approval steps", category: "admin" },
  { name: "view_all_records", label: "View All Records", description: "View records across the organization", category: "read" },
  { name: "system_configuration", label: "System Configuration", description: "Edit system configuration", category: "admin" },
]

const permissionMetaMap = Object.fromEntries(permissionDefinitions.map((item) => [item.name, item]))

const roleBadgePalette: RoleBadgeVariant[] = ["default", "secondary", "success", "warning", "info", "destructive", "outline", "superadmin", "admin", "manager", "staff", "HR", "Finance", "SalesMarketing", "Operations"]

function pickRandomRoleBadgeVariant() {
  const index = Math.floor(Math.random() * roleBadgePalette.length)
  return roleBadgePalette[index] ?? "default"
}

const badgeVariantForCategory: Record<PermissionDefinition["category"], "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "outline"> = {
  read: "info",
  write: "success",
  delete: "destructive",
  admin: "warning",
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? "Request failed")
  }
  return res
}

function RoleForm({
  mode,
  initialName = "",
  initialDescription = "",
  initialPermissions = [],
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  initialName?: string
  initialDescription?: string
  initialPermissions?: string[]
  onSubmit: (payload: { name: string; description: string; permissions: string[] }) => void | Promise<void>
  onCancel: () => void
  submitting: boolean
}) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions)

  useEffect(() => {
    setName(initialName)
    setDescription(initialDescription)
    setSelectedPermissions(initialPermissions)
  }, [initialName, initialDescription, initialPermissions])

  function togglePermission(permission: string) {
    setSelectedPermissions((current) =>
      current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission],
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="role-name">Role name</Label>
        <Input id="role-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. procurement_editor" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role-description">Description</Label>
        <Input id="role-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Used for procurement review workflows" />
      </div>
      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {permissionDefinitions.map((permission) => {
              const checked = selectedPermissions.includes(permission.name)
              return (
                <label
                  key={permission.name}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition ${checked ? "border-primary bg-primary/10 shadow-sm" : "border-border/70 bg-background hover:border-primary/40"}`}
                >
                  <Checkbox checked={checked} onCheckedChange={() => togglePermission(permission.name)} />
                  <div className="min-w-0 space-y-1">
                    <span className="font-medium text-foreground">{permission.label}</span>
                    <p className="text-xs leading-5 text-muted-foreground">{permission.description}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button onClick={() => void onSubmit({ name: name.trim(), description: description.trim(), permissions: selectedPermissions })} disabled={submitting || !name.trim()}>
          {submitting ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create role" : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [roleBadgeVariantMap, setRoleBadgeVariantMap] = useState<Record<string, RoleBadgeVariant>>({})

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true)
    try {
      const response = await api("/roles")
      const payload = (await response.json()) as { roles?: RoleRecord[] }
      const nextRoles = Array.isArray(payload.roles)
        ? payload.roles.map((role) => ({
          ...role,
          badgeVariant: roleBadgeVariantMap[role.id] ?? role.badgeVariant ?? (role.isSystem ? "secondary" : "default"),
        }))
        : []
      setRoles(nextRoles)
    } catch (exception) {
      setError((exception as Error).message)
    } finally {
      setLoadingRoles(false)
    }
  }, [roleBadgeVariantMap])

  const fetchPermissions = useCallback(async () => {
    setLoadingPermissions(true)
    try {
      const response = await api("/permissions")
      const payload = (await response.json()) as { permissions?: string[] }
      const normalizedPermissions = Array.isArray(payload.permissions)
        ? payload.permissions.map((permissionName) => {
          const meta = permissionMetaMap[permissionName] ?? { label: permissionName, description: "", category: "admin" as const }
          return { name: permissionName, label: meta.label, description: meta.description, category: meta.category }
        })
        : permissionDefinitions
      void normalizedPermissions
    } catch (exception) {
      setError((exception as Error).message)
    } finally {
      setLoadingPermissions(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const response = await api("/users")
      const payload = (await response.json()) as UserRecord[]
      setUsers(Array.isArray(payload) ? payload : [])
    } catch (exception) {
      setError((exception as Error).message)
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setError(null)
    await Promise.all([fetchRoles(), fetchUsers(), fetchPermissions()])
  }, [fetchPermissions, fetchRoles, fetchUsers])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const usersByRoleName = useMemo(() => {
    return roles.reduce<Record<string, number>>((accumulator, role) => {
      accumulator[role.name] = users.filter((user) => user.role === role.name).length
      return accumulator
    }, {})
  }, [roles, users])

  async function handleCreateOrUpdate(payload: { name: string; description: string; permissions: string[] }) {
    setSubmitting(true)
    setError(null)
    try {
      if (editingRole) {
        await api(`/roles/${editingRole.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: payload.name, description: payload.description || null }),
        })
        for (const permission of editingRole.permissions) {
          if (!payload.permissions.includes(permission)) {
            await api(`/roles/${editingRole.id}/permissions/${permission}`, { method: "DELETE" })
          }
        }
        for (const permission of payload.permissions) {
          if (!editingRole.permissions.includes(permission)) {
            await api(`/roles/${editingRole.id}/permissions`, { method: "POST", body: JSON.stringify({ permission }) })
          }
        }
      } else {
        const response = await api("/roles", { method: "POST", body: JSON.stringify({ name: payload.name, description: payload.description || null }) })
        const created = (await response.json()) as { role?: RoleRecord }
        const newRole = created.role
        if (newRole) {
          const randomVariant = pickRandomRoleBadgeVariant()
          setRoleBadgeVariantMap((current) => ({ ...current, [newRole.id]: randomVariant }))
          for (const permission of payload.permissions) {
            await api(`/roles/${newRole.id}/permissions`, { method: "POST", body: JSON.stringify({ permission }) })
          }
        }
      }
      setDialogOpen(false)
      setEditingRole(null)
      await refresh()
    } catch (exception) {
      setError((exception as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteRole(role: RoleRecord) {
    try {
      await api(`/roles/${role.id}`, { method: "DELETE" })
      await refresh()
    } catch (exception) {
      setError((exception as Error).message)
    }
  }

  return (
    <div className="flex w-full flex-col gap-5 rounded-xl border border-border/60 bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Roles & Permissions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, and remove roles while assigning their runtime permissions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">View All Permissions</Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[80vh] ">
              <DialogHeader>
                <DialogTitle>Roles & permissions reference</DialogTitle>
                <DialogDescription>Review the permission catalog and the permissions attached to each role.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="rounded-xl border border-border/60  p-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Permissions</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {permissionDefinitions.map((permission) => {
                      const badgeVariant = badgeVariantForCategory[permission.category] ?? "default"

                      return (
                        <div
                          key={permission.name}
                          className="rounded-sm border border-border/60 bg-background p-3 "
                        >
                          <div className="flex flex-wrap items-start gap-2">
                            <Badge variant={badgeVariant}>{permission.label}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
          
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setEditingRole(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <CirclePlus className="size-4" /> Add role
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>{editingRole ? "Edit role" : "Create role"}</DialogTitle>
                <DialogDescription>Define the role name, summary, and permissions it should inherit.</DialogDescription>
              </DialogHeader>
              <div className="mt-2 max-h-[calc(80vh-8rem)] overflow-y-auto px-2">
                <RoleForm
                  mode={editingRole ? "edit" : "create"}
                  initialName={editingRole?.name ?? ""}
                  initialDescription={editingRole?.description ?? ""}
                  initialPermissions={editingRole?.permissions ?? []}
                  submitting={submitting}
                  onCancel={() => {
                    setEditingRole(null)
                    setDialogOpen(false)
                  }}
                  onSubmit={async (payload) => {
                    await handleCreateOrUpdate(payload)
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

      {loadingRoles || loadingUsers || loadingPermissions ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">Loading roles and permissions…</div>
      ) : roles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground">No roles have been created yet.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{role.name}</span>
                      {role.isSystem ? <Badge variant="secondary">system</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>{role.description ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.length > 0 ? role.permissions.map((permission) => {
                        const definition = permissionMetaMap[permission] ?? { label: permission, category: "admin" as const }
                        return (
                          <Badge key={permission} variant={badgeVariantForCategory[definition.category]}>
                            {definition.label}
                          </Badge>
                        )
                      }) : <span className="text-sm text-muted-foreground">No permissions</span>}
                    </div>
                  </TableCell>
                  <TableCell>{usersByRoleName[role.name] ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                        setEditingRole(role)
                        setDialogOpen(true)
                      }} disabled={role.isSystem}>
                        <Pencil className="size-4" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-2" disabled={role.isSystem}>
                            <Trash2 className="size-4" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete role?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {role.name} from the system. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleDeleteRole(role)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
