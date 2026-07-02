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
import {
  Calendar,
  ChevronsUpDown,
  Home,
  Inbox,
  FilePlus2,
  Shield,
  Settings,
  Users,
} from "lucide-react"

import { NavLink, Outlet, useLocation } from "react-router-dom"

const mainNavigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
]

const requestManagement = [
  {
    title: "All Requests",
    url: "/allrequest",
    icon: Inbox,
  },
  {
    title: "My Requests",
    url: "/myrequest",
    icon: Calendar,
  },
  {
    title: "Create Request",
    url: "/create-request",
    icon: FilePlus2,
  },
]

const administration = [
  {
    title: "User Provisioning",
    url: "/user-provisioning",
    icon: Users,
  },
  {
    title: "Roles & Permissions",
    url: "/roles-permissions",
    icon: Shield,
  },
]

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/allrequest": "All Requests",
  "/myrequest": "My Requests",
  "/create-request": "Create Request",
  "/user-provisioning": "User Provisioning",
  "/roles-permissions": "Roles & Permissions",
  "/settings": "Settings",
}

function getInitials(name?: string | null) {
  if (!name) {
    return "U"
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function SidebarDemo() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const location = useLocation()

  const pageTitle = routeTitles[location.pathname] ?? "Dashboard"
  const user = session?.user
  const userName = user?.name ?? (isSessionLoading ? "Loading..." : "Guest")
  const userEmail = user?.email ?? (isSessionLoading ? "Fetching session..." : "No account found")
  const userImage = user?.image ?? ""

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background text-foreground">
        <Sidebar>
          <SidebarHeader className="px-4 py-4">
            <div className="text-sm font-semibold tracking-wide text-foreground">
              Logo nato here
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

            <SidebarGroup>
              <SidebarGroupLabel>REQUEST MANAGEMENT</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {requestManagement.map((item) => (
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

            <SidebarGroup>
              <SidebarGroupLabel>ADMINISTRATION</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {administration.map((item) => (
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
                        <span className="truncate text-xs text-muted-foreground">
                          {userEmail}
                        </span>
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
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink
                      to="/settings"
                      className="flex w-full items-center gap-2"
                    >
                      <Settings className="size-4" />
                      <span>Settings</span>
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

          <div className="flex flex-1 items-center justify-center overflow-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}