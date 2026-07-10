import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ModulePageShell, procurementRequests, type DepartmentName, type ProcurementStage } from "./workflow"
import { Clock3, Filter, Search } from "lucide-react"

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

  const departments = useMemo(() => ["All Departments", ...Object.keys(departmentConfig)], [])

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
      <div className="space-y-4">
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
                className={`rounded-full border px-4 ${config.chip} ${selected ? "shadow-sm" : ""}`}
                onClick={() => setSelectedDepartment(department)}
              >
                <span className={`mr-2 size-2 rounded-full ${config.dot}`} />
                {config.label}
              </Button>
            )
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {boardColumns.map((column) => {
            const columnRequests = filteredRequests.filter((request) => request.stage === column)

            return (
              <div key={column} className="space-y-3">
                <div className="flex items-end justify-between gap-3 px-1">
                  <div>
                    <p className="text-base font-medium text-foreground">{column}</p>
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
                  {columnRequests.map((request) => {
                    const department = departmentConfig[request.department]

                    return (
                      <Card key={request.id} className="rounded-2xl border-border/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <Badge
                              variant="outline"
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${department.chip}`}
                            >
                              <span className={`mr-2 size-2 rounded-full ${department.dot}`} />
                              {department.label}
                            </Badge>
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {request.number}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-base font-medium leading-6 text-foreground">{request.title}</p>
                            <p className="text-sm text-muted-foreground">{request.department}</p>
                          </div>

                          <div className="flex items-center justify-between gap-3 text-sm text-foreground">
                            <span>{request.amount}</span>
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Clock3 className="size-3.5" />
                              {request.age}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <Badge variant={stageVariant(request.status)} className="rounded-full px-2.5 py-1 text-xs">
                              {request.status}
                            </Badge>
                            <Button asChild variant="ghost" size="sm" className="px-2 text-muted-foreground">
                              <Link to={`/requests/${request.id}`}>Open</Link>
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
