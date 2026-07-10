import { useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { type DepartmentName } from "@/components/ui/Badges"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ModulePageShell, procurementRequests, type ProcurementStage } from "./workflow"
import { ArrowRight, BriefcaseBusiness, Clock3, Coins, Filter, Search, SearchX, Sparkles } from "lucide-react"

const boardColumns: ProcurementStage[] = ["Ready for Canvass", "Canvassing", "PO Generated", "Received"]

const departmentConfig: Record<DepartmentName, { label: string; dot: string; chip: string }> = {
  Operations: {
    label: "Operations",
    dot: "bg-rose-500",
    chip: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
  Finance: {
    label: "Finance",
    dot: "bg-violet-500",
    chip: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
  },
  HR: {
    label: "HR",
    dot: "bg-cyan-500",
    chip: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  },
  SalesMarketing: {
    label: "Sales & Marketing",
    dot: "bg-orange-500",
    chip: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
}

function stageVariant(stage: ProcurementStage) {
  if (stage === "Ready for Canvass") return "warning"
  if (stage === "Canvassing") return "info"
  if (stage === "PO Generated") return "secondary"
  return "success"
}

function moneyToNumber(amount: string) {
  const numericValue = Number(amount.replace(/[^\d.-]/g, ""))
  return Number.isFinite(numericValue) ? numericValue : 0
}

export function ProcurementDashboardPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<"All Departments" | DepartmentName>("All Departments")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRequests = procurementRequests.filter((request) => {
    const matchesDepartment = selectedDepartment === "All Departments" || request.department === selectedDepartment
    const search = searchTerm.trim().toLowerCase()
    const matchesSearch =
      search.length === 0 ||
      [request.title, request.number, request.department, request.amount, request.age].some((value) => value.toLowerCase().includes(search))

    return matchesDepartment && matchesSearch
  })

  const activeCount = filteredRequests.length
  const activeDepartments = new Set(filteredRequests.map((request) => request.department)).size
  const totalAmount = filteredRequests.reduce((sum, request) => sum + moneyToNumber(request.amount), 0)
  const hasActiveFilters = searchTerm.trim().length > 0 || selectedDepartment !== "All Departments"

  const summaryCards = [
    {
      label: "Active requests",
      value: activeCount.toString(),
      hint: "Ready for next action",
      icon: BriefcaseBusiness,
    },
    {
      label: "Visible departments",
      value: activeDepartments.toString(),
      hint: "Filtered by current scope",
      icon: Sparkles,
    },
    {
      label: "Total value",
      value: new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(totalAmount),
      hint: "Across the current view",
      icon: Coins,
    },
  ]

  return (
    <ModulePageShell
      title="Purchasing queue"
      description="Requests from every department, approved and ready to move."
      action={
        <div className="relative w-full sm:w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-2xl pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search requests..."
          />
        </div>
      }
    >
      <div className="space-y-5">
       

        <div className="grid gap-3 md:grid-cols-3">
          {summaryCards.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.label} className="border-border/70 bg-card/80 ">
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-xl font-semibold tracking-tight text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                    <Icon className="size-4" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 ">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* BACKEND TODO: fetch procurement board data from procurement_requests and enforce RBAC visibility here. */}
              <Button
                type="button"
                variant={selectedDepartment === "All Departments" ? "default" : "outline"}
                size="sm"
                className="rounded-full px-4"
                onClick={() => setSelectedDepartment("All Departments")}
              >
                <Filter className="mr-2 size-4" />
                All departments
              </Button>
              {Object.entries(departmentConfig).map(([key, config]) => {
                const department = key as DepartmentName
                const selected = selectedDepartment === department

                return (
                  <Button
                    key={department}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("rounded-full border px-4", config.chip, selected && "")}
                    onClick={() => setSelectedDepartment(department)}
                  >
                    <span className={cn("mr-2 size-2 rounded-full", config.dot)} />
                    {config.label}
                  </Button>
                )
              })}
            </div>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                onClick={() => {
                  setSelectedDepartment("All Departments")
                  setSearchTerm("")
                }}
              >
                <SearchX className="mr-2 size-4" />
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {boardColumns.map((column) => {
            const columnRequests = filteredRequests.filter((request) => request.stage === column)

            return (
              <div key={column} className="space-y-3 rounded-[24px] border border-border/70 bg-slate-50/70 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-background/80 px-2 py-2">
                  <div>
                    <p className="text-base font-semibold text-foreground">{column}</p>
                    <p className="text-sm text-muted-foreground">
                      {column === "Ready for Canvass" && "Approved by department"}
                      {column === "Canvassing" && "Gathering supplier quotes"}
                      {column === "PO Generated" && "Awaiting final sign-off"}
                      {column === "Received" && "Closed out"}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                    {columnRequests.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {columnRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 text-center text-sm text-muted-foreground">
                      No requests in this stage.
                    </div>
                  ) : null}

                  {columnRequests.map((request) => {
                    const department = departmentConfig[request.department]

                    return (
                      <Card
                        key={request.id}
                        className="rounded-[20px] border-border/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 "
                      >
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <Badge
                              variant="outline"
                              className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", department.chip)}
                            >
                              <span className={cn("mr-2 size-2 rounded-full", department.dot)} />
                              {department.label}
                            </Badge>
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {request.number}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-base font-semibold leading-6 text-foreground">{request.title}</p>
                            <p className="text-sm text-muted-foreground">{request.department}</p>
                          </div>

                          <div className="flex items-center justify-between gap-3 text-sm text-foreground">
                            <span className="font-medium">{request.amount}</span>
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Clock3 className="size-3.5" />
                              {request.age}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <Badge variant={stageVariant(request.status)} className="rounded-full px-2.5 py-1 text-xs">
                              {request.status}
                            </Badge>
                            <Button asChild variant="ghost" size="sm" className="rounded-full px-2.5 text-muted-foreground hover:bg-slate-100 hover:text-foreground">
                              <Link to={`/requests/${request.id}`} className="inline-flex items-center gap-1">
                                Open
                                <ArrowRight className="size-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
          <span>{activeCount} active requests across {activeDepartments} departments</span>
          <span>•</span>
          <span>Total value {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(totalAmount)}</span>
        </div>
      </div>
    </ModulePageShell>
  )
}
