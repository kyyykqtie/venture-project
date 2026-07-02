import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Calendar,
  ChevronsUpDown,
  Home,
  Inbox,
  Search,
  Settings,
  User,
} from "lucide-react"

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function SidebarDemo() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background text-foreground">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarGroup>
              <SidebarMenuButton className="h-12 w-full justify-between gap-3">
                <div className="flex items-center gap-2">
                  <User className="size-5 rounded-md" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-muted-foreground">
                      john@example.com
                    </span>
                  </div>
                </div>
                <ChevronsUpDown className="size-5 rounded-md" />
              </SidebarMenuButton>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
            <SidebarTrigger />
            <div>
              <p className="text-sm text-muted-foreground">Workspace</p>
              <h1 className="text-lg font-semibold">Main Content</h1>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-xl rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Sidebar integrated</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This is the main content area of the page.
              </p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}