/**
 * ProtectedRoute — two modes:
 *
 * 1. `<ProtectedRoute adminOnly />` (default, no permission prop)
 *    Blocks non-admin users with a countdown screen (original behaviour).
 *
 * 2. `<ProtectedRoute requiredPermission="manage_users" />`
 *    Blocks users who do not have the named permission.
 *    Shows an "Access Denied" screen instead of redirecting.
 */
import { useEffect, useState } from "react"
import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { authClient } from "@/lib/auth-client"
import { useAuth, type PermissionName } from "@/context/AuthContext"

// ── Shared access-denied screen ──────────────────────────────────────────────

function AccessDeniedScreen({ message }: { message?: string }) {
  const [countdown, setCountdown] = useState(15)
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown === 0) {
      navigate("/", { replace: true })
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, navigate])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background text-center px-4">
      <div className="rounded-full bg-red-100 p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="text-base text-muted-foreground max-w-sm">
        {message ?? "You don't have permission to view this page."}
      </p>
      <p className="text-sm text-muted-foreground">
        Redirecting in{" "}
        <span className="font-semibold text-red-500">{countdown}</span>{" "}
        second{countdown !== 1 ? "s" : ""}…
      </p>
      <button
        onClick={() => navigate("/dashboard", { replace: true })}
        className="mt-2 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  )
}

// ── ProtectedRoute ────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  /**
   * When set, the route is only accessible to users who have this permission.
   * Admins always pass regardless of this value.
   */
  requiredPermission?: PermissionName
}

export function ProtectedRoute({ requiredPermission }: ProtectedRouteProps = {}) {
  const { data: session, isPending } = authClient.useSession()
  const { user, isLoading, hasPermission } = useAuth()

  // Wait for both session and /users/me to resolve
  if (isPending || isLoading) return null

  // Not logged in at all
  if (!session) {
    return <Navigate to="/" replace />
  }

  const isAdmin = session.user.role === "admin"

  // No specific permission required — just need to be logged in (and admin for
  // the legacy admin-only pages).
  if (!requiredPermission) {
    if (!isAdmin) {
      return (
        <AccessDeniedScreen message="SuperAdmin Session Needed for Authorization" />
      )
    }
    return <Outlet />
  }

  // Permission-gated route: admins always pass, others need the permission.
  if (isAdmin) return <Outlet />
  if (user && hasPermission(requiredPermission)) return <Outlet />

  return <AccessDeniedScreen />
}
