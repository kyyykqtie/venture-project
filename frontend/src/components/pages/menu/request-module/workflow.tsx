import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type DepartmentName, DepartmentBadge } from "@/components/ui/Badges"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  OctagonAlert,
  Search,
} from "lucide-react"
import { Link } from "react-router-dom"
import type { VariantProps } from "class-variance-authority"


export type WorkflowStage =
  | "draft"
  | "pending-initial-approval"
  | "pending-final-approval"
  | "approved"
  | "declined"
  | "purchase-order"
  | "canvass"
  | "canvass-review"
  | "purchase"
  | "receiving"
  | "completed"


export type RequestStatus =
  | "Draft"
  | "Returned for Revision"
  | "Awaiting Approval"
  | "Approved"
  | "PO Generated"
  | "Canvassing"
  | "For Comparison"
  | "Purchased"
  | "Receiving"
  | "Completed"


export type RequestPdfLineItem = {
  description: string
  quantity: number
  unit: string
  unitPrice?: string
  estimatedCost: string
  specification?: string
}


export type ApprovalInfo = {
  approver: string
  approvedDate: string
  receiverName: string
  receivedDate: string
}


export type RequestDetail = RequestPdfSource & Partial<ApprovalInfo>

export type RequestPdfSource = {
  id: string
  title: string
  department: DepartmentName
  budget: string
  requestDate: string
  dateNeeded: string
  submittedBy: string
  submittedDate: string

  shippingTerms: string
  shippingMethod: string
  deliveryDate: string
  remarks: string
  address: string
  phone: string
  lineItems: RequestPdfLineItem[]
}


function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value)
}

export type RequestFormData = RequestPdfSource

export type RequestRecord = RequestPdfSource & Partial<ApprovalInfo> & {
  site: string
  requester: string
  dueDate: string
  amount: string
  items: number
  status: RequestStatus
  stage: WorkflowStage
  canvassUnlocked: boolean
  supplierCount: number
  updatedAt: string
  attachments: string[]
  purchaseOrder: {
    poNumber: string
    vendor: string
    preparedBy: string
    approvedBy: string
    deliveryDate: string
    terms: string
    status: string
  }
}


type StageDefinition = {
  key: WorkflowStage
  label: string
  helper: string
}




// Raw shape returned by GET /purchase-requests/:id
export type ApiPurchaseRequestDetail = {
  id: string
  requestNumber: string
  title: string
  departmentId: string
  departmentName: string | null
  requestedByUserId: string
  requestedByName?: string | null
  requestedByEmail?: string | null
  budget: string
  requestDate: string
  dateNeeded: string | null
  status: string
  draft: {
    initialApproval?: { decision: string; remarks: string | null; approverId: string; approverName?: string | null; decidedAt: string }
    finalApproval?: { decision: string; remarks: string | null; approverId: string; approverName?: string | null; decidedAt: string }
    [key: string]: unknown
  } | null
  createdAt: string
  updatedAt: string
}

// Raw shape returned by GET /purchase-requests and /purchase-requests/mine
type ApiPurchaseRequest = {
  id: string
  requestNumber: string
  title: string
  departmentName: string | null
  departmentId: string
  requestedByUserId: string
  budget: string
  requestDate: string
  dateNeeded: string | null
  status: string
  updatedAt: string
}

export type WorkflowStageInfo = {
  stage: WorkflowStage
  declinedAt?: WorkflowStage
}

export function mapApiStatusToStageInfo(record: ApiPurchaseRequestDetail): WorkflowStageInfo {
  if (record.status !== "declined") {
    return { stage: mapApiStatusToStage(record.status) }
  }

  if (record.draft?.finalApproval?.decision === "decline") {
    return { stage: "declined", declinedAt: "pending-final-approval" }
  }
  if (record.draft?.initialApproval?.decision === "decline") {
    return { stage: "declined", declinedAt: "pending-initial-approval" }
  }
  return { stage: "declined" }
}


const workflowStages: StageDefinition[] = [
  { key: "draft", label: "Awaiting Initial Review", helper: "Create and submit the request." },
  { key: "pending-initial-approval", label: "Pending Initial Approval", helper: "Awaiting the initial approver's decision." },
  { key: "pending-final-approval", label: "Pending Final Approval", helper: "Awaiting the final approver's decision." },
  { key: "approved", label: "Approved", helper: "Cleared for the next operational stage." },
  { key: "purchase-order", label: "PO", helper: "Generate the purchase order." },
  { key: "canvass", label: "Canvass", helper: "Capture supplier quotations." },
  { key: "canvass-review", label: "Review", helper: "Compare quotations and justify selection." },
  { key: "purchase", label: "Purchase", helper: "Confirm the chosen supplier." },
  { key: "receiving", label: "Receiving", helper: "Log delivered items and variances." },
  { key: "completed", label: "Completed", helper: "Archive the request with audit history." },
]

const quotationRows = [
  { item: "Plywood 1/2", qty: 24, suppliers: [48, 53, 50] },
  { item: "Galvanized nail", qty: 10, suppliers: [18, 21, 19] },
  { item: "Cement 40kg", qty: 120, suppliers: [260, 255, 274] },
]

export const canvassSupplierRows = [
  {
    supplier: "Supplier 1",
    contact: "A. Cruz Trading",
    total: "PHP 421,000",
    note: "Lowest quotation",
  },
  {
    supplier: "Supplier 2",
    contact: "BuildRight Supply",
    total: "PHP 428,900",
    note: "Selected for faster delivery",
  },
  {
    supplier: "Supplier 3",
    contact: "Northline Materials",
    total: "PHP 437,450",
    note: "Higher unit pricing",
  },
]

function mapApiStatusToStage(status: string): WorkflowStage {
  switch (status) {
    case "draft": return "draft"
    case "submitted":
    case "pending_initial_approval": return "pending-initial-approval"
    case "pending_final_approval": return "pending-final-approval"
    case "approved": return "approved"
    case "declined": return "declined"
    default: return "draft"
  }
}


function formatDateDisplay(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}


function mapApiStatusToLabel(status: string): RequestStatus {
  switch (status) {
    case "draft": return "Draft"
    case "submitted":
    case "pending_initial_approval":
    case "pending_final_approval": return "Awaiting Approval"
    case "approved": return "Approved"
    case "declined": return "Returned for Revision"
    default: return "Draft"
  }
}




// Shared hook — every page that used to call getRequest(requestId) synchronously
// now uses this instead.
// Real backend-backed request fetch — use this in RequestDetailPage and
// ApprovalReviewPage going forward. Other pages still use getRequest() (mock)
// until their backend models exist.
export function useRequest(requestId?: string) {
  const [request, setRequest] = useState<ApiPurchaseRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!requestId) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetch(`${import.meta.env.VITE_API_URL}/purchase-requests/${requestId}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Request not found" : "Failed to load request")
        return res.json() as Promise<ApiPurchaseRequestDetail>
      })
      .then((data) => { if (!cancelled) setRequest(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [requestId])

  return { request, isLoading, error }
}


export function formatStageLabel(stage: WorkflowStage) {
  if (stage === "declined") return "Declined"
  return workflowStages.find((item) => item.key === stage)?.label ?? "Request"
}



export function getRequest(requestId?: string): RequestRecord {
  const storedDraft = loadRequestDraft()
  if (requestId && storedDraft?.id === requestId) {
    return mapDraftToRequestRecord(storedDraft)
  }

  return mapDraftToRequestRecord({
    id: requestId ?? "PLACEHOLDER",
    title: "Placeholder Request",
    department: "Operations",
    budget: "0",
    requestDate: new Date().toISOString(),
    dateNeeded: "",
    submittedBy: "Unknown",
    submittedDate: new Date().toISOString(),
    shippingTerms: "",
    shippingMethod: "",
    deliveryDate: "",
    remarks: "",
    address: "",
    phone: "",
    lineItems: [],
  })
}

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

export function statusTone(status: RequestStatus): BadgeVariant {
  switch (status) {
    case "Draft":
      return "muted"
    case "Awaiting Approval":
      return "warning"
    // case "Return For Revision":
    //   return "destructive"
    case "Approved":
      return "success"
    case "PO Generated":
    case "Canvassing":
    case "For Comparison":
      return "info"
    case "Purchased":
    case "Receiving":
      return "secondary"
    case "Completed":
      return "default"
    default:
      return "outline"
  }
}




function parseCurrencyValue(value: string) {
  const numeric = Number(value.replace(/[^\d.-]/g, ""))
  return Number.isFinite(numeric) ? numeric : 0
}

function formatPesos(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(amount)
}

const requestDraftStorageKey = "venture-request-draft"

export function saveRequestDraft(draft: RequestFormData) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(requestDraftStorageKey, JSON.stringify(draft))
}

export function loadRequestDraft() {
  if (typeof window === "undefined") {
    return null
  }

  const storedValue = window.localStorage.getItem(requestDraftStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    return JSON.parse(storedValue) as RequestFormData
  } catch {
    return null
  }
}

function workflowIndex(stage: WorkflowStage) {
  return workflowStages.findIndex((item) => item.key === stage)
}

export function mapDraftToRequestRecord(draft: RequestFormData): RequestRecord {
  const subtotal = draft.lineItems.reduce((total, item) => total + parseCurrencyValue(item.estimatedCost), 0)

  return {
    ...draft,
    site: draft.address,
    requester: draft.submittedBy,
    dueDate: draft.dateNeeded || draft.deliveryDate || "Pending",
    amount: formatPesos(subtotal),
    items: draft.lineItems.length,
    status: "Draft",
    stage: "draft",
    canvassUnlocked: false,
    supplierCount: 0,
    updatedAt: "",
    attachments: [],
    purchaseOrder: {
      poNumber: draft.id,
      vendor: "Pending",
      preparedBy: "Pending",
      approvedBy: "Pending",
      deliveryDate: draft.deliveryDate || "Pending",
      terms: draft.shippingTerms,
      status: "Draft",
    },
  }
}

export function ModulePageShell({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="w-full space-y-4 lg:space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {children}
    </div>
  )
}

export function SummaryStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card size="sm">
      <CardContent className="space-y-1 p-3 md:p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tracking-tight md:text-2xl">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export function WorkflowProgressTracker({
  stage,
  declinedAt,
}: {
  stage: WorkflowStage
  declinedAt?: WorkflowStage
}) {
  const isDeclined = stage === "declined"
  const isTerminalApproved = stage === "approved"
  const activeIndex = isDeclined ? workflowIndex(declinedAt ?? "draft") : workflowIndex(stage)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-5 shadow-sm">
      <div className="relative">
        <div className="absolute left-6 right-6 top-4 h-[2px] rounded-full bg-gradient-to-r from-emerald-200 via-border/80 to-border/60" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-2 overflow-x-auto pb-1">
          {workflowStages.map((item, index) => {
            const isFrozenLast = isDeclined && index === activeIndex
            const isDone = isDeclined
              ? index < activeIndex
              : isTerminalApproved
                ? index <= activeIndex   // ← "approved" itself now counts as done/green
                : index < activeIndex
            const isActive = !isDeclined && !isTerminalApproved && index === activeIndex   // ← no pulsing blue once approved
            const isUpcoming = !isDone && !isActive && !isFrozenLast
            return (
              <div key={item.key} className="relative z-10 flex min-w-[96px] flex-1 flex-col items-center text-center">
                <div
                  className={cn(
                    "relative mb-2 flex size-10 items-center justify-center rounded-full border shadow-sm transition-all duration-200",
                    isFrozenLast
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : isDone
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : isActive
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isFrozenLast ? (
                    <OctagonAlert className="size-4" />
                  ) : isDone ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <span className="text-[11px] font-semibold">{index + 1}</span>
                  )}
                  {isActive ? <span className="absolute inset-0 rounded-full ring-4 ring-primary/20" /> : null}
                </div>
                <div className="space-y-0.5">
                  <p className={cn("text-sm font-semibold", isActive || isFrozenLast ? "text-foreground" : isDone ? "text-emerald-700" : "text-muted-foreground")}>
                    {item.label}
                  </p>
                  <p className={cn("text-[11px] leading-4", isActive ? "text-primary/80" : isFrozenLast ? "text-destructive/80" : isDone ? "text-emerald-600" : "text-muted-foreground/80")}>
                    {item.helper}
                  </p>
                </div>
                {isUpcoming ? <span className="mt-2 h-1.5 w-10 rounded-full bg-border/70" /> : null}
              </div>
            )
          })}
        </div>
      </div>

      {isDeclined ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <OctagonAlert className="size-4" />
          <span>
            This request was declined at the "{workflowStages.find((s) => s.key === (declinedAt ?? "draft"))?.label}" stage and did not proceed further.
          </span>
        </div>
      ) : null}
    </div>
  )
}
export function RequestPdfPreview({ request }: { request: RequestDetail }) {
  const subtotal = request.lineItems.reduce((total, item) => total + parseCurrencyValue(item.estimatedCost), 0)

  return (
    <div className="space-y-0 border border-border bg-white text-slate-950 shadow-sm print:border-0 print:shadow-none">
      <div className="border-b border-slate-300 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xl font-bold tracking-tight text-slate-900">ADNEM BUILDERS INC.</p>
            <div className="text-xs leading-5 text-slate-700">
              <p>No. 28 Texas St. Greenland Newtown Executive Village</p>
              <p>Ph2, Brgy Banaba San Mateo Rizal</p>
              <p>Tel: 02-8523-6925</p>
              <p>adnembuilders@gmail.com / adnembuildersinc@gmail.com</p>
              <p>mobile: 0922 8036439 / 09328760731</p>
            </div>
          </div>
          <div className="min-w-[200px] space-y-1 text-right text-sm">
            <div className="flex justify-between gap-4">
              <span className="font-semibold uppercase tracking-wide text-slate-700">Date</span>
              <span>{request.submittedDate}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-semibold uppercase tracking-wide text-slate-700">Request #</span>
              <span>{request.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-300 px-5 py-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Requested By</p>
          <p className="mt-1 font-medium text-slate-900">{request.submittedBy}</p>
          <p className="text-xs text-slate-600">Date: {request.submittedDate}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Request Approved By</p>
          <p className="mt-1 font-medium text-slate-900">{request.approver}</p>
          <p className="text-xs text-slate-600">Date: {request.approvedDate || "Pending"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Request Received By</p>
          <p className="mt-1 font-medium text-slate-900">{request.receiverName || "Pending"}</p>
          <p className="text-xs text-slate-600">Date: {request.receivedDate || "Pending"}</p>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-300 px-5 py-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Address</p>
          <p className="mt-1 text-slate-900">{request.address}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Phone</p>
          <p className="mt-1 text-slate-900">{request.phone || "-"}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Shipping Terms</p>
            <p className="mt-1 text-slate-900">{request.shippingTerms}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Shipping Method</p>
            <p className="mt-1 text-slate-900">{request.shippingMethod}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Delivery Date</p>
            <p className="mt-1 text-slate-900">{request.deliveryDate}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-300 px-5 py-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Budget</p>
          <p className="mt-1 text-slate-900">{request.budget}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Request Date</p>
          <p className="mt-1 text-slate-900">{request.requestDate}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Date Needed</p>
          <p className="mt-1 text-slate-900">{request.dateNeeded}</p>
        </div>
      </div>

      <div className="overflow-hidden border-b border-slate-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-xs uppercase tracking-wide text-slate-700">
              <th className="border-r border-slate-300 px-3 py-2 text-left font-semibold">Item #</th>
              <th className="border-r border-slate-300 px-3 py-2 text-left font-semibold">Description</th>
              <th className="border-r border-slate-300 px-3 py-2 text-left font-semibold">QTY</th>
              <th className="border-r border-slate-300 px-3 py-2 text-left font-semibold">Unit Price</th>
              <th className="px-3 py-2 text-left font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {request.lineItems.map((item, index) => (
              <tr key={`${request.id}-${item.description}-${index}`} className="align-top">
                <td className="border-r border-t border-slate-300 px-3 py-2 text-slate-700">{index + 1}</td>
                <td className="border-r border-t border-slate-300 px-3 py-2">
                  <p className="font-medium text-slate-900">{item.description}</p>
                  {item.specification ? <p className="text-xs text-slate-600">{item.specification}</p> : null}
                </td>
                <td className="border-r border-t border-slate-300 px-3 py-2 text-slate-700">{item.quantity}</td>
                <td className="border-r border-t border-slate-300 px-3 py-2 text-slate-700">{item.unitPrice || item.estimatedCost}</td>
                <td className="border-t border-slate-300 px-3 py-2 text-slate-700">{item.estimatedCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)]">
        <div>
          <p className="text-sm font-medium text-slate-800">Remarks / Instructions:</p>
          <div className="mt-2 min-h-40 rounded-sm border border-slate-400 px-3 py-2 text-sm text-slate-800">
            {request.remarks}
          </div>
        </div>
        <div className="space-y-1 text-sm text-slate-800">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold uppercase text-slate-700">Subtotal</span>
            <span>{formatPesos(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold uppercase text-slate-700">Discount</span>
            <span>₱0.00</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold uppercase text-slate-700">Subtotal Minus Discount</span>
            <span>{formatPesos(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold uppercase text-slate-700">Tax Rate</span>
            <span>0%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold uppercase text-slate-700">Total Tax</span>
            <span>₱0.00</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold uppercase text-slate-700">Shipping/Handling</span>
            <span>₱0.00</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold uppercase text-slate-700">Other</span>
            <span>₱0.00</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-300 pt-2 text-base font-bold">
            <span className="uppercase text-slate-900">Total</span>
            <span>{formatPesos(subtotal)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-300 px-5 py-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Authorized Signature :</p>
          <div className="mt-6 border-t border-slate-400 pt-2 text-xs text-slate-600">Signature over printed name</div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Date</p>
          <p className="mt-6 text-sm text-slate-900">{request.submittedDate}</p>
        </div>
      </div>
    </div>
  )
}

export function QueuePage({ scope }: { scope: "my" | "all" }) {
  const [records, setRecords] = useState<ApiPurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    let cancelled = false
    const path = scope === "my" ? "/purchase-requests/mine" : "/purchase-requests"

    setIsLoading(true)
    setError(null)

    fetch(`${import.meta.env.VITE_API_URL}${path}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load requests")
        return res.json() as Promise<ApiPurchaseRequest[]>
      })
      .then((data) => { if (!cancelled) setRecords(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [scope])


  return (
    <ModulePageShell
      title={scope === "my" ? "My Requests" : "Requests"}   // was: "All Requests"
      description={
        scope === "my"
          ? "Track drafts, returned items, and requests waiting for the next action."
          : "Requests currently relevant to your role in the workflow."   // unchanged — this text is already accurate to the real behavior
      }
      action={
        scope === "my" ? (
          <Button asChild size="sm">
            <Link to="/requests/new">
              <ArrowRight className="mr-2 size-4 rotate-180" />
              New Request
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild size="sm">
            <Link to="/requests/new">Open Intake</Link>
          </Button>
        )
      }
    >


      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Request Queue</CardTitle>
              <CardDescription>Use the table to jump directly into a request workflow.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                Filter
              </Button>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="w-64 pl-9" placeholder="Search request ID or title" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading requests…</div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">{error}</div>
          ) : records.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No requests to show.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium md:px-5">Request</th>
                  <th className="px-4 py-3 font-medium md:px-5">Department</th>
                  <th className="px-4 py-3 font-medium md:px-5">Status</th>
                  <th className="px-4 py-3 font-medium md:px-5">Amount</th>
                  <th className="px-4 py-3 font-medium md:px-5">Updated</th>
                  <th className="px-4 py-3 font-medium md:px-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-4 md:px-5">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{record.requestNumber}</p>
                        <p className="text-sm text-muted-foreground">{record.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-5">
                      {record.departmentName ? (
                        <DepartmentBadge department={record.departmentName as DepartmentName} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 md:px-5">
                      <Badge variant={statusTone(mapApiStatusToLabel(record.status))}>
                        {formatStageLabel(mapApiStatusToStage(record.status))}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground md:px-5">{formatCurrency(parseCurrencyValue(record.budget))}</td>
                    <td className="px-4 py-4 text-muted-foreground md:px-5">{formatDateDisplay(record.updatedAt)}</td>
                    <td className="px-4 py-4 md:px-5">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/requests/${record.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </ModulePageShell>
  )
}

export function RequestDetailWorkspace({ request }: { request: ApiPurchaseRequestDetail }) {
  const initialDecision = request.draft?.initialApproval
  const finalDecision = request.draft?.finalApproval
  const requesterName = request.requestedByName ?? request.requestedByUserId ?? "Unknown requester"
  const initialApproverName = initialDecision?.approverName ?? initialDecision?.approverId ?? "Pending approver"
  const finalApproverName = finalDecision?.approverName ?? finalDecision?.approverId ?? "Pending approver"

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Request Overview</CardTitle>
            <CardDescription>Core details for this request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryStat
                label="Requested By"
                value={requesterName}
                hint={formatDateDisplay(request.createdAt)}
              />
              <SummaryStat
                label="Approved By"
                value={finalDecision?.decision === "approve" ? finalApproverName : "Pending"}
                hint={finalDecision?.decidedAt ? formatDateDisplay(finalDecision.decidedAt) : "Awaiting final approval"}
              />
              <SummaryStat
                label="Received By"
                value="Not yet available"
                hint="Receiving stage isn't implemented yet"
              />
              <SummaryStat
                label="Delivery Date"
                value="Not yet available"
                hint="Purchase order stage isn't implemented yet"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Approval History</CardTitle>
            <CardDescription>Decisions recorded at each approval stage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm">
            {initialDecision ? (
              <div className="rounded-xl border border-border/60 p-3">
                <p className="font-medium text-foreground">
                  Initial Approval — {initialDecision.decision === "approve" ? "Approved" : "Declined"}
                </p>
                <p className="text-xs text-muted-foreground">{formatDateDisplay(initialDecision.decidedAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Reviewed by {initialApproverName}</p>
                {initialDecision.remarks ? <p className="mt-1 text-muted-foreground">{initialDecision.remarks}</p> : null}
              </div>
            ) : (
              <p className="text-muted-foreground">Awaiting initial approval.</p>
            )}

            {finalDecision ? (
              <div className="rounded-xl border border-border/60 p-3">
                <p className="font-medium text-foreground">
                  Final Approval — {finalDecision.decision === "approve" ? "Approved" : "Declined"}
                </p>
                <p className="text-xs text-muted-foreground">{formatDateDisplay(finalDecision.decidedAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Reviewed by {finalApproverName}</p>
                {finalDecision.remarks ? <p className="mt-1 text-muted-foreground">{finalDecision.remarks}</p> : null}
              </div>
            ) : (
              <p className="text-muted-foreground">Awaiting final approval.</p>
            )}
          </CardContent>
        </Card>

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          Line items are not yet stored as structured data on the backend — this section will show the itemized request once that's added to the schema.
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Reference details for approvals and handoff.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Request Number</span>
              <span className="font-medium">{request.requestNumber}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Department</span>
              {request.departmentName ? (
                 <DepartmentBadge department={request.departmentName as DepartmentName} />
              ) : (
                <span className="text-muted-foreground">No Role</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Requested By</span>
              <span className="font-medium text-foreground">{requesterName}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ComparisonGrid({ request }: { request: RequestRecord }) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle>Supplier Quotation Comparison</CardTitle>
        <CardDescription>
          The lowest quotation is highlighted, but approvers can still choose another supplier with a clear justification.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium md:px-5">Item</th>
              <th className="px-4 py-3 font-medium md:px-5">Qty</th>
              <th className="px-4 py-3 font-medium md:px-5">Supplier 1</th>
              <th className="px-4 py-3 font-medium md:px-5">Supplier 2</th>
              <th className="px-4 py-3 font-medium md:px-5">Supplier 3</th>
            </tr>
          </thead>
          <tbody>
            {quotationRows.map((row) => {
              const lowest = Math.min(...row.suppliers)

              return (
                <tr key={row.item} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-4 font-medium md:px-5">{row.item}</td>
                  <td className="px-4 py-4 text-muted-foreground md:px-5">{row.qty}</td>
                  {row.suppliers.map((value, index) => {
                    const isLowest = value === lowest

                    return (
                      <td key={`${row.item}-${index}`} className="px-4 py-4 md:px-5">
                        <div className={`rounded-xl border px-3 py-2 ${isLowest ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>
                          <div className="text-[11px] uppercase tracking-wide opacity-70">{`Supplier ${index + 1}`}</div>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <span className="font-medium">PHP {value.toFixed(2)}</span>
                            {isLowest ? <CheckCircle2 className="size-4" /> : null}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
      <div className="border-t border-border/60 p-4 text-sm text-muted-foreground">Request {request.id} is ready for supplier comparison and review.</div>
    </Card>
  )
}

export function StageWorkspaceShell({
  title,
  description,
  request,
  action,
  children,
}: {
  title: string
  description: string
  request: RequestRecord
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <ModulePageShell
      title={title}
      description={description}
      action={
        <>
          <Button variant="outline" asChild size="sm">
            <Link to={`/requests/${request.id}`}>Back to Request</Link>
          </Button>
          {action}
        </>
      }
    >
      {children}
    </ModulePageShell>
  )
}
