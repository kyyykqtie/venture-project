import { SidebarDemo } from "@/components/SideBarComponent"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

const stats = [
  {
    label: "Active Users",
    value: "248",
    hint: "+12% this month",
    icon: Users,
  },
  {
    label: "Pending Requests",
    value: "37",
    hint: "Needs review",
    icon: FileText,
  },
  {
    label: "System Health",
    value: "Stable",
    hint: "99.8% uptime",
    icon: Activity,
  },
  {
    label: "Security Status",
    value: "Protected",
    hint: "2FA enforced",
    icon: ShieldCheck,
  },
]

const quickActions = [
  {
    title: "User provisioning",
    description: "Onboard new staff and assign access in minutes.",
    href: "/user-provisioning",
    icon: Users,
  },
  {
    title: "Roles & permissions",
    description: "Adjust access levels and governance rules.",
    href: "/roles-permissions",
    icon: ShieldCheck,
  },
  {
    title: "System settings",
    description: "Tune the platform defaults and workflow policies.",
    href: "/settings",
    icon: Settings,
  },
]

const recentActivity = [
  {
    title: "New procurement request approved",
    meta: "Procurement • 5 mins ago",
    tone: "success",
  },
  {
    title: "Role update completed for Finance",
    meta: "Administration • 22 mins ago",
    tone: "info",
  },
  {
    title: "Pending review flagged for escalation",
    meta: "Operations • 1 hr ago",
    tone: "warning",
  },
]

export function Dashboard() {
  return <SidebarDemo />
}

export function SuperAdminDashboardPage() {
  return (
    <div className="w-full space-y-6">
     
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.label} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Administrator actions</CardTitle>
            <CardDescription>
              Keep the platform secure and operational with fast access to the most important admin tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Link key={action.title} to={action.href} className="block">
                  <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4 transition hover:border-primary/40 hover:bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>System alerts</CardTitle>
            <CardDescription>Watch critical issues and response status at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4" />
                2 approvals need attention
              </div>
              <p className="mt-1 text-xs text-amber-700">Escalation is recommended before end of day.</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4" />
                Backup completed successfully
              </div>
              <p className="mt-1 text-xs text-emerald-700">Latest system snapshot was stored 30 minutes ago.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            A live feed of governance and workflow events for the current admin view.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((item) => (
            <div key={item.title} className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-muted p-2 text-muted-foreground">
                  <Clock3 className="size-4" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.meta}</p>
                </div>
              </div>
              <Badge
                variant={item.tone === "warning" ? "outline" : item.tone === "success" ? "secondary" : "default"}
              >
                {item.tone === "warning" ? "Needs review" : item.tone === "success" ? "Resolved" : "Updated"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}