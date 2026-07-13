import { useEffect, useMemo, useState } from "react"
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
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Pencil, ShieldCheck, Trash2 } from "lucide-react"

const API_BASE = "http://localhost:3000"

type RoleRecord = {
  id: string
  name: string
  description?: string | null
  isSystem: boolean
  permissions: string[]
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

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("")
}

function UserEditDialog({
  user,
  roles,
  onSave,
  onClose,
}: {
  user: UserRecord
  roles: RoleRecord[]
  onSave: (payload: { role: string; permissions: string[] }) => Promise<void>
  onClose: () => void
}) {
  const [role, setRole] = useState(user.role)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setRole(user.role)
    setSelectedPermissions(user.permissions ?? [])
  }, [user])

  function togglePermission(permission: string) {
    setSelectedPermissions((current) =>
      current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission],
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ role, permissions: selectedPermissions })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit user access</DialogTitle>
          <DialogDescription>Update the role and permission set for {user.name}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <select id="user-role" value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="user">user</option>
              {roles.map((roleRecord) => (
                <option key={roleRecord.id} value={roleRecord.name}>
                  {roleRecord.name}
                </option>
              ))}
            </select>
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
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function UserDirectoryPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [usersResponse, rolesResponse] = await Promise.all([api("/users"), api("/roles")])
        const usersPayload = (await usersResponse.json()) as UserRecord[]
        const rolesPayload = (await rolesResponse.json()) as { roles?: RoleRecord[] }
        setUsers(Array.isArray(usersPayload) ? usersPayload : [])
        setRoles(Array.isArray(rolesPayload.roles) ? rolesPayload.roles : [])
      } catch (exception) {
        setError((exception as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const rolePermissionMap = useMemo(() => {
    return roles.reduce<Record<string, string[]>>((accumulator, role) => {
      accumulator[role.name] = role.permissions
      return accumulator
    }, {})
  }, [roles])

  async function handleSaveUser(payload: { role: string; permissions: string[] }) {
    if (!editingUser) return
    try {
      await api(`/users/${editingUser.id}/role`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      setEditingUser(null)
      setComingSoonMessage(null)
      const usersResponse = await api("/users")
      const usersPayload = (await usersResponse.json()) as UserRecord[]
      setUsers(Array.isArray(usersPayload) ? usersPayload : [])
    } catch (exception) {
      setError((exception as Error).message)
    }
  }

  async function handleDeleteUser(user: UserRecord) {
    try {
      await api(`/users/${user.id}/role`, { method: "PUT", body: JSON.stringify({ role: user.role, permissions: [] }) })
      setComingSoonMessage("Account deletion is not wired on the backend yet, so the entry remains in place after the UI change.")
    } catch (exception) {
      setError((exception as Error).message)
    }
  }

  return (
    <div className="flex w-full flex-col gap-5 rounded-xl border border-border/60 bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">User directory</h2>
        <p className="text-sm text-muted-foreground">Review users, their role assignments, and the permissions attached via the active role.</p>
      </div>

      {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      {comingSoonMessage ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{comingSoonMessage}</div> : null}

      {loading ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground">No users were returned from the backend.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const derivedPermissions = user.permissions?.length ? user.permissions : rolePermissionMap[user.role] ?? []
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.departmentName ?? user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {derivedPermissions.length > 0 ? derivedPermissions.map((permission) => {
                          const definition = permissionMetaMap[permission] ?? { label: permission, category: "admin" as const }
                          return (
                            <Badge key={permission} variant={badgeVariantForCategory[definition.category]}>
                              {definition.label}
                            </Badge>
                          )
                        }) : <span className="text-sm text-muted-foreground">No explicit permissions</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Open actions for ${user.name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditingUser(user)} className="gap-2">
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled onSelect={() => setComingSoonMessage("Status changes are available soon.")} className="gap-2">
                            <ShieldCheck className="size-4" /> Deactivate (coming soon)
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="gap-2">
                                <Trash2 className="size-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {user.name} from the visible directory state. The backend does not expose a user deletion endpoint yet, so this action is currently a UI-only confirmation.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => void handleDeleteUser(user)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {editingUser ? (
        <UserEditDialog
          user={editingUser}
          roles={roles}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
        />
      ) : null}
    </div>
  )
}

export default UserDirectoryPage
