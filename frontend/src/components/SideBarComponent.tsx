import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/layout/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import jacolbsLogo from "@/assets/JACOLBSV2.png"
import {
  Calendar,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Home,
  Inbox,
  FilePlus2,
  ClipboardList,
  Shield,
  Settings,
  Users,
  LogOut,
  Building2,
} from "lucide-react"

import { NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth, type PermissionName } from "@/context/AuthContext"
import { useEffect, useState } from "react"

const API_BASE = "http://localhost:3000"

interface NavItem {
  title: string
  url: string
  icon: React.ElementType
  /** If set, the item is only shown when the user has this permission (admins always see it). */
  requiredPermission?: PermissionName | PermissionName[]
}

const mainNavigation: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
]

const requestManagement: NavItem[] = [
  {
    title: "Requests",
    url: "/requests/all",
    icon: Inbox,
    requiredPermission: ["view_all_records", "approve_request_initial", "approve_request_final"],
  },
  {
    title: "My Requests",
    url: "/requests/my",
    icon: Calendar,
    requiredPermission: ["create_request"],

  },
  {
    title: "Create Request",
    url: "/requests/new",
    icon: FilePlus2,
    requiredPermission: "create_request",
  },
]


const administration: NavItem[] = [
  {
    title: "User Provisioning",
    url: "/user-provisioning",
    icon: Users,
    requiredPermission: "manage_users"
  },
  {
    title: "User Directory",
    url: "/user-directory",
    icon: Users,
    requiredPermission: ["manage_users", "manage_roles_permissions"]
  },
  {
    title: "Roles & Permissions",
    url: "/roles-permissions",
    icon: Shield,
    requiredPermission: "manage_roles_permissions",
  },
]

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/requests/all": "Requests",
  "/requests/my": "My Requests",
  "/requests/new": "Create Request",
  "/procurement/requests": "Procurement Requests",
  "/user-provisioning": "User Provisioning",
  "/roles-permissions": "Roles & Permissions",
  "/settings": "Settings",
}

function getPageTitle(pathname: string) {
  const exactTitle = routeTitles[pathname]
  if (exactTitle) return exactTitle

  if (pathname.startsWith("/requests/")) {
    const parts = pathname.split("/").filter(Boolean)
    if (parts.length >= 3 && parts[2] === "approval") return "Approval Review"
    if (parts.length >= 3 && parts[2] === "purchase-order") return "Purchase Order"
    if (parts.length >= 3 && parts[2] === "canvass") {
      return parts[3] === "review" ? "Canvass Review" : "Canvass Sheet"
    }
    if (parts.length >= 3 && parts[2] === "receiving") return "Receiving"
    if (parts.length >= 3 && parts[2] === "completed") return "Completed"
    return "Request Detail"
  }

  return "Dashboard"
}

function getInitials(name?: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}



function filterByPermission(items: NavItem[], hasPermission: (p: PermissionName) => boolean) {
  return items.filter((item) => {
    if (!item.requiredPermission) return true
    const required = Array.isArray(item.requiredPermission)
      ? item.requiredPermission
      : [item.requiredPermission]
    return required.some((p) => hasPermission(p))
  })
}

function NavGroup({
  label,
  items,
  hasPermission,
}: {
  label: string
  items: NavItem[]
  hasPermission: (p: PermissionName) => boolean
}) {
  const visible = filterByPermission(items, hasPermission)
  if (visible.length === 0) return null





  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visible.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function SidebarDemo() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const { hasPermission } = useAuth()
  const location = useLocation()
  const [departmentName, setDepartmentName] = useState<string | null>(null)
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false)
  const visibleAdminItems = filterByPermission(administration, hasPermission)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`${API_BASE}/users/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setDepartmentName(data?.departmentName ?? null))
      .catch(() => null)
  }, [session?.user?.id])

  useEffect(() => {
    const isChildActive = administration.some((item) => item.url === location.pathname)
    if (isChildActive) {
      setIsUserManagementOpen(true)
    }
  }, [location.pathname])

  const pageTitle = getPageTitle(location.pathname)

  useEffect(() => {
    document.title = `${pageTitle} `
  }, [pageTitle])

  const user = session?.user
  const userName = user?.name ?? (isSessionLoading ? "Loading..." : "Guest")
  const userEmail = user?.email ?? (isSessionLoading ? "Fetching session..." : "No account found")
  const userImage = user?.image ?? ""

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background text-foreground">
        <Sidebar>
          <SidebarHeader className="px-4 py-4">
            <div className="flex items-center justify-center">
              <img
                src={jacolbsLogo}
                alt="JACOLBS logo"
                className="h-12 w-auto max-w-[180px] rounded-md object-contain"
              />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>MAIN NAVIGATION</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <NavGroup
              label="REQUEST MANAGEMENT"
              items={requestManagement}

              hasPermission={hasPermission}
            />

        
            {visibleAdminItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>ADMINISTRATION</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        type="button"
                        className="w-full justify-between"
                        tooltip="User Management"
                        onClick={() => setIsUserManagementOpen((open) => !open)}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="size-4" />
                          <span>User Management</span>
                        </div>
                        {isUserManagementOpen ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </SidebarMenuButton>
                      {isUserManagementOpen && (
                        <SidebarMenuSub>
                          {visibleAdminItems.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild size="sm" isActive={location.pathname === item.url}>
                                <NavLink to={item.url}>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter>
            <SidebarGroup>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-12 w-full justify-between gap-3 rounded-xl">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={userImage} alt={userName} />
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col items-start">
                        <span className="truncate text-sm font-medium">
                          {userName}
                        </span>
                        {departmentName ? (
                          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Building2 className="size-3 shrink-0" />
                            {departmentName}
                          </span>
                        ) : (
                          <span className="truncate text-xs text-muted-foreground">
                            {userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={userImage} alt={userName} />
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col items-start">
                        <span className="truncate text-sm font-medium text-foreground">
                          {userName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {userEmail}
                        </span>
                        {departmentName && (
                          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Building2 className="size-3 shrink-0" />
                            {departmentName}
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink to="/settings" className="flex w-full items-center gap-2">
                      <Settings className="size-4" />
                      <span>Settings</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink
                      to="/"
                      className="flex w-full items-center gap-2"
                      onClick={() => authClient.signOut()}
                    >
                      <LogOut className="size-4" />
                      <span>Sign Out</span>
                    </NavLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
            <SidebarTrigger />
            <div>
              <h1 className="text-lg font-semibold">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex flex-1 items-start justify-start overflow-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
