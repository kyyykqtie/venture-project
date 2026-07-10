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

// Role hierarchy — order matters: admin is always at the top
const ROLE_HIERARCHY = [
  { value: "admin",    label: "Admin",    badge: "bg-red-100 text-red-700" },
  { value: "manager",  label: "Manager",  badge: "bg-blue-100 text-blue-700" },
  { value: "Approver", label: "Approver", badge: "bg-purple-100 text-purple-700" },
  { value: "user",     label: "User",     badge: "bg-gray-100 text-gray-600" },
] as const

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string | null
}

function getRoleMeta(role?: string | null) {
  return (
    ROLE_HIERARCHY.find((r) => r.value === role) ??
    ROLE_HIERARCHY[ROLE_HIERARCHY.length - 1]
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

// Sort users by role hierarchy index, then alphabetically by name
function sortUsers(users: User[]): User[] {
  return [...users].sort((a, b) => {
    const aIdx = ROLE_HIERARCHY.findIndex((r) => r.value === a.role)
    const bIdx = ROLE_HIERARCHY.findIndex((r) => r.value === b.role)
    const aNorm = aIdx === -1 ? ROLE_HIERARCHY.length : aIdx
    const bNorm = bIdx === -1 ? ROLE_HIERARCHY.length : bIdx
    if (aNorm !== bNorm) return aNorm - bNorm
    return a.name.localeCompare(b.name)
  })
}

// Group users by role for sectioned rendering
function groupByRole(users: User[]): { role: typeof ROLE_HIERARCHY[number]; users: User[] }[] {
  return ROLE_HIERARCHY.map((roleMeta) => ({
    role: roleMeta,
    users: users.filter((u) => u.role === roleMeta.value),
  })).filter((group) => group.users.length > 0)
}

export default function RolesPermissionsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await authClient.admin.listUsers({ query: { limit: 100 } })
      if (result.error) {
        setError(result.error.message ?? "Failed to load users.")
      } else {
        setUsers(sortUsers((result.data?.users as User[]) ?? []))
      }
    } catch {
      setError("An unexpected error occurred while loading users.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setUpdatingId(userId)
    try {
      const result = await authClient.admin.setRole({ userId, role })
      if (result.error) {
        setError(result.error.message ?? "Failed to update role.")
      } else {
        setUsers((prev) =>
          sortUsers(prev.map((u) => (u.id === userId ? { ...u, role } : u)))
        )
      }
    } catch {
      setError("An unexpected error occurred while updating the role.")
    } finally {
      setUpdatingId(null)
    }
  }

  const grouped = groupByRole(users)

  return (
    <div className="flex w-full h-full flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles & Permissions</h2>
          <p className="mt-1 text-sm text-gray-600">
            Assign roles to users. Only admins can change roles.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Refresh
        </button>
      </div>

      {/* Role hierarchy legend */}
      <div className="flex flex-wrap gap-2">
        {ROLE_HIERARCHY.map((r, i) => (
          <span key={r.value} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.badge}`}>
              {r.label}
            </span>
            {i < ROLE_HIERARCHY.length - 1 && (
              <span className="text-gray-300">›</span>
            )}
          </span>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
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

              {/* Section header */}
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleMeta.badge}`}>
                  {roleMeta.label}
                </span>
                <span className="text-xs text-gray-400">{groupUsers.length} user{groupUsers.length !== 1 ? "s" : ""}</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              {/* Users in this role */}
              <div className="flex flex-col gap-2">
                {groupUsers.map((user, i) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    index={i}
                    isUpdating={updatingId === user.id}
                    onRoleChange={handleRoleChange}
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

// Extracted row component for cleanliness
function UserRow({
  user,
  index,
  isUpdating,
  onRoleChange,
}: {
  user: User
  index: number
  isUpdating: boolean
  onRoleChange: (userId: string, role: string) => void
}) {
  const roleMeta = getRoleMeta(user.role)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
    >
      <Avatar className="size-9 shrink-0">
        {user.image && <AvatarImage src={user.image} alt={user.name} />}
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
        <span className="truncate text-xs text-gray-500">{user.email}</span>
      </div>

      <span className={`hidden sm:inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleMeta.badge}`}>
        {roleMeta.label}
      </span>

      <div className="shrink-0 w-36">
        <Select
          value={user.role ?? "user"}
          onValueChange={(role) => onRoleChange(user.id, role)}
          disabled={isUpdating}
        >
          <SelectTrigger className="h-8 text-xs border-gray-200 bg-white">
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border border-blue-500 border-t-transparent" />
                Saving...
              </span>
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            {ROLE_HIERARCHY.map((r) => (
              <SelectItem key={r.value} value={r.value} className="text-xs">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  )
}
