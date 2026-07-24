/**
 * AuthContext — fetches /users/me on mount and keeps the resolved user +
 * permissions in context for the whole app.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { authClient } from "@/lib/auth-client"

const API_BASE = import.meta.env.VITE_API_URL

export type PermissionName =
  | "create_request"
  | "approve_request_initial"
  | "approve_request_final"
  | "process_canvass"
  | "approve_canvass"
  | "generate_po"
  | "receive_goods"
  | "manage_users"
  | "manage_roles_permissions"
  | "manage_departments"
  | "override_approvals"
  | "view_all_records"
  | "system_configuration"

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
  departmentId?: string | null
  departmentName?: string | null
  permissions: PermissionName[]
}

interface AuthContextValue {
  user: CurrentUser | null
  /** true while the initial /users/me fetch is in-flight */
  isLoading: boolean
  /** re-fetch /users/me (e.g. after a role change) */
  refresh: () => Promise<void>
  hasPermission: (name: PermissionName) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users/me`, { credentials: "include" })
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = await res.json()
      setUser(data as CurrentUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Wait until better-auth has resolved the session
    if (isSessionPending) return

    if (!session) {
      setUser(null)
      setIsLoading(false)
      return
    }

    fetchMe()
  }, [session, isSessionPending, fetchMe])

  const hasPermission = useCallback(
    (name: PermissionName): boolean => {
      if (!user) return false
      return user.permissions.includes(name)
    },
    [user],
  )

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh: fetchMe, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook — access the full auth context */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

/** Hook — returns the current user (null while loading) */
export function useCurrentUser(): CurrentUser | null {
  return useAuth().user
}

/** Hook — returns a stable `hasPermission` function */
export function usePermissions() {
  const { hasPermission, user } = useAuth()
  return { hasPermission, permissions: user?.permissions ?? [] }
}
