import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { DepartmentBadge, type DepartmentName } from "@/components/ui/Badges"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  Lock,
  Search,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

export type WorkflowStage =
  | "draft"
  | "approval"
  | "purchase-order"
  | "canvass"
  | "canvass-review"
  | "purchase"
  | "receiving"
  | "completed"

export type RequestStatus =
  | "Draft"
  | "Returned"
  | "Awaiting Approval"
  | "Approved"
  | "PO Generated"
  | "Canvassing"
  | "For Comparison"
  | "Purchased"
  | "Receiving"
  | "Completed"

export type ProcurementStage = "Ready for Canvass" | "Canvassing" | "PO Generated" | "Received"

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

export type ProcurementRequestCard = {
  id: string
  title: string
  department: DepartmentName
  number: string
  amount: string
  age: string
  status: ProcurementStage
  stage: ProcurementStage
}

type StageDefinition = {
  key: WorkflowStage
  label: string
  helper: string
}

const workflowStages: StageDefinition[] = [
  { key: "draft", label: "Request", helper: "Create and submit the request." },
  { key: "approval", label: "Approval", helper: "Review, approve, or return." },
  { key: "purchase-order", label: "PO", helper: "Generate the purchase order." },
  { key: "canvass", label: "Canvass", helper: "Capture supplier quotations." },
  { key: "canvass-review", label: "Review", helper: "Compare quotations and justify selection." },
  { key: "purchase", label: "Purchase", helper: "Confirm the chosen supplier." },
  { key: "receiving", label: "Receiving", helper: "Log delivered items and variances." },
  { key: "completed", label: "Completed", helper: "Archive the request with audit history." },
]

export const requestRecords: RequestRecord[] = [
  {
    id: "MR-2026-014",
    title: "Office furniture and workstation materials",
    department: "Operations",
    budget: "PHP 184,500",
    site: "Greenland Newtown Executive Village",
    requester: "Ana Rivera",
    approver: "Engr. J. Santos",
    requestDate: "2026-07-10",
    dateNeeded: "2026-07-18",
    submittedBy: "Ana Rivera",
    submittedDate: "July 10, 2026",
    approvedDate: "July 11, 2026",
    receiverName: "Maria Santos",
    receivedDate: "",
    shippingTerms: "Net 30",
    shippingMethod: "Supplier Delivery",
    deliveryDate: "July 18, 2026",
    remarks: "Deliver in batches if stock is not immediately available.",
    address: "No. 28 Texas St. Greenland Newtown Executive Village, Ph2, Brgy Banaba, San Mateo, Rizal",
    phone: "02-8523-6925",
    dueDate: "Jul 18, 2026",
    amount: "PHP 184,500",
    items: 8,
    status: "Completed",
    stage: "completed",
    canvassUnlocked: true,
    supplierCount: 3,
    updatedAt: "Completed today",
    lineItems: [
      {
        description: "Office chair",
        quantity: 12,
        unit: "pcs",
        unitPrice: "PHP 4,000",
        specification: "Ergonomic mesh chair with lumbar support",
        estimatedCost: "PHP 48,000",
      },
      {
        description: "Filing cabinet",
        quantity: 4,
        unit: "pcs",
        unitPrice: "PHP 8,000",
        specification: "4-drawer steel cabinet, lockable",
        estimatedCost: "PHP 32,000",
      },
      {
        description: "Long desk",
        quantity: 6,
        unit: "sets",
        unitPrice: "PHP 17,416.67",
        specification: "Modular workstation desk with cable tray",
        estimatedCost: "PHP 104,500",
      },
    ],
    attachments: ["Site photos.pdf", "BOQ draft.xlsx", "Revision notes.docx"],
    purchaseOrder: {
      poNumber: "PO-2026-014",
      vendor: "Adnem Office Supply Co.",
      preparedBy: "Purchasing Team",
      approvedBy: "Maria Dela Cruz",
      deliveryDate: "Jul 24, 2026",
      terms: "Net 30",
      status: "Generated",
    },
  },
  {
    id: "PO-2026-014",
    title: "Concrete and rebar procurement",
    department: "Finance",
    budget: "PHP 428,900",
    site: "Project North",
    requester: "Joan Ramos",
    approver: "Luis Reyes",
    requestDate: "2026-07-10",
    dateNeeded: "2026-07-12",
    submittedBy: "Joan Ramos",
    submittedDate: "July 10, 2026",
    approvedDate: "July 10, 2026",
    receiverName: "Procurement Team",
    receivedDate: "",
    shippingTerms: "Net 15",
    shippingMethod: "Pickup",
    deliveryDate: "July 12, 2026",
    remarks: "Coordinate delivery schedule with the project engineer.",
    address: "Project North storage yard",
    phone: "",
    dueDate: "Jul 12, 2026",
    amount: "PHP 428,900",
    items: 16,
    status: "Canvassing",
    stage: "canvass",
    canvassUnlocked: true,
    supplierCount: 3,
    updatedAt: "Just now",
    lineItems: [
      {
        description: "Concrete 40kg",
        quantity: 120,
        unit: "bags",
        unitPrice: "PHP 260",
        specification: "High-strength mix for foundation works",
        estimatedCost: "PHP 31,200",
      },
      {
        description: "Rebar 16mm",
        quantity: 180,
        unit: "pcs",
        unitPrice: "PHP 1,315",
        specification: "Deformed bar, 12m length",
        estimatedCost: "PHP 236,700",
      },
      {
        description: "Tie wire",
        quantity: 24,
        unit: "kgs",
        unitPrice: "PHP 400",
        specification: "Galvanized tie wire roll",
        estimatedCost: "PHP 9,600",
      },
    ],
    attachments: ["Canvass summary.pdf", "Supplier quotations.pdf", "Approval memo.docx"],
    purchaseOrder: {
      poNumber: "PO-2026-014",
      vendor: "Northern Construction Supply",
      preparedBy: "Purchasing Team",
      approvedBy: "Luis Reyes",
      deliveryDate: "Jul 16, 2026",
      terms: "Net 30",
      status: "Generated",
    },
  },
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

export const procurementRequests: ProcurementRequestCard[] = [
  {
    id: "PR-2026-004",
    title: "IT Equipment Request",
    department: "Operations",
    number: "REQ-0004",
    amount: "₱150,000",
    age: "3 days old",
    status: "Ready for Canvass",
    stage: "Ready for Canvass",
  },
  {
    id: "PR-2026-005",
    title: "Office Partition Upgrade",
    department: "HR",
    number: "REQ-0005",
    amount: "₱84,500",
    age: "1 day old",
    status: "Canvassing",
    stage: "Canvassing",
  },
  {
    id: "PR-2026-006",
    title: "Network Switch Replacement",
    department: "Finance",
    number: "REQ-0006",
    amount: "₱220,000",
    age: "5 days old",
    status: "PO Generated",
    stage: "PO Generated",
  },
  {
    id: "PR-2026-007",
    title: "Warehouse Delivery Receipt",
    department: "SalesMarketing",
    number: "REQ-0007",
    amount: "₱42,000",
    age: "7 days old",
    status: "Received",
    stage: "Received",
  },
]

export function getRequest(requestId?: string) {
  const storedDraft = loadRequestDraft()

  if (requestId && storedDraft?.id === requestId) {
    return mapDraftToRequestRecord(storedDraft)
  }

  return requestRecords.find((record) => record.id === requestId) ?? requestRecords[0]
}

export function formatStageLabel(stage: WorkflowStage) {
  return workflowStages.find((item) => item.key === stage)?.label ?? "Request"
}

export function statusTone(status: RequestStatus) {
  if (status === "Completed") return "default"
  if (status === "Approved" || status === "PO Generated" || status === "Purchased") return "secondary"
  if (status === "Awaiting Approval" || status === "Canvassing" || status === "For Comparison" || status === "Receiving") return "outline"
  if (status === "Returned") return "destructive"
  return "outline"
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
    updatedAt: "Just now",
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

export function WorkflowProgressTracker({ stage }: { stage: WorkflowStage }) {
  const activeIndex = workflowIndex(stage)
  const currentStage = workflowStages[Math.max(activeIndex, 0)]?.label ?? workflowStages[0].label

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      
        
      </div>

      <div className="relative">
        <div className="absolute left-6 right-6 top-4 h-[2px] rounded-full bg-gradient-to-r from-emerald-200 via-border/80 to-border/60" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-2 overflow-x-auto pb-1">
          {workflowStages.map((item, index) => {
            const isDone = index < activeIndex
            const isActive = index === activeIndex
            const isUpcoming = !isDone && !isActive

            return (
              <div key={item.key} className="relative z-10 flex min-w-[96px] flex-1 flex-col items-center text-center">
                <div
                  className={cn(
                    "relative mb-2 flex size-10 items-center justify-center rounded-full border shadow-sm transition-all duration-200",
                    isDone
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isDone ? <CheckCircle2 className="size-4" /> : <span className="text-[11px] font-semibold">{index + 1}</span>}
                  {isActive ? <span className="absolute inset-0 rounded-full ring-4 ring-primary/20" /> : null}
                </div>
                <div className="space-y-0.5">
                  <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : isDone ? "text-emerald-700" : "text-muted-foreground")}>{item.label}</p>
                  <p className={cn("text-[11px] leading-4", isActive ? "text-primary/80" : isDone ? "text-emerald-600" : "text-muted-foreground/80")}>{item.helper}</p>
                </div>
                {isUpcoming ? <span className="mt-2 h-1.5 w-10 rounded-full bg-border/70" /> : null}
              </div>
            )
          })}
        </div>
      </div>
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
  const records = scope === "my" ? requestRecords.slice(0, 1) : requestRecords

  return (
    <ModulePageShell
      title={scope === "my" ? "My Requests" : "All Requests"}
      description={
        scope === "my"
          ? "Track drafts, returned items, and requests waiting for the next action."
          : "Monitor every request in the module and jump directly into the workflow."
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Open" value="12" hint="Requests needing action" />
        <SummaryStat label="Returned" value="3" hint="Needs revision and resubmission" />
        <SummaryStat label="In Purchasing" value="5" hint="Approved requests in later stages" />
        <SummaryStat label="Completed" value="28" hint="Closed requests for audit reference" />
      </div>

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
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium md:px-5">Request</th>
                <th className="px-4 py-3 font-medium md:px-5">Department</th>
                <th className="px-4 py-3 font-medium md:px-5">Current Stage</th>
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
                      <p className="font-medium text-foreground">{record.id}</p>
                      <p className="text-sm text-muted-foreground">{record.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 md:px-5">
                    <DepartmentBadge department={record.department} />
                  </td>
                  <td className="px-4 py-4 md:px-5">
                    <Badge variant={statusTone(record.status)}>{formatStageLabel(record.stage)}</Badge>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground md:px-5">{record.amount}</td>
                  <td className="px-4 py-4 text-muted-foreground md:px-5">{record.updatedAt}</td>
                  <td className="px-4 py-4 md:px-5">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/requests/${record.id}`}>Open</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ModulePageShell>
  )
}

export function RequestDetailWorkspace({ request }: { request: RequestRecord }) {
  const canvassLocked = !request.canvassUnlocked

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Request Overview</CardTitle>
            <CardDescription>Keep the request, supporting documents, and approval context in one place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryStat label="Requested By" value={request.submittedBy} hint={request.submittedDate} />
              <SummaryStat label="Approved By" value={request.approver ?? "Pending"} hint={request.approvedDate || "Pending approval"} />
              <SummaryStat label="Received By" value={request.receiverName || "Pending"} hint={request.receivedDate || "Not yet received"} />
              <SummaryStat label="Delivery Date" value={request.deliveryDate} hint={request.shippingMethod} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Working Area</CardTitle>
            <CardDescription>Use this section for the active stage, supporting notes, and attached records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div>
                <p className="text-sm font-medium">Materials / Services</p>
                <p className="text-sm text-muted-foreground">Line items stay visible while the request moves through approval.</p>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                {request.lineItems.map((item) => (
                  <div key={item.description} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{item.description}</p>
                      {item.specification ? <p className="text-xs text-muted-foreground">{item.specification}</p> : null}
                    </div>
                    <span className="text-muted-foreground">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-dashed border-border bg-background p-3 text-xs text-muted-foreground">
                BACKEND TODO: connect this request snapshot to the request_items table and render the live record from the request detail API.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock3 className="size-4" />
                  Approval Timeline
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Capture every decision and return with a visible audit trail.</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="size-4" />
                  Stakeholders
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Requester, approver, and purchasing share the same record.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Canvass Sheet Access</CardTitle>
            <CardDescription>Hidden until the purchase order is generated and approved.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className={`rounded-xl border p-4 ${canvassLocked ? "border-dashed border-border bg-muted/20" : "border-border bg-card"}`}>
              {canvassLocked ? (
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Lock className="mt-0.5 size-4" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Canvass sheet is locked</p>
                    <p>
                      This stage becomes available only after the purchase order is generated. The UI should keep it visible
                      as a future step, but inaccessible until prerequisites are satisfied.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileCheck2 className="size-4" />
                    Supplier comparison is available
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Compare quotations side by side, highlight the lowest amount, and allow justified overrides.
                  </p>
                  <Button asChild size="sm">
                    <Link to={`/requests/${request.id}/canvass/review`}>Open comparison view</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Reference details for approvals and handoff.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Request ID</span>
              <span className="font-medium">{request.id}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Department</span>
              <DepartmentBadge department={request.department} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="font-medium">{request.amount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Suppliers</span>
              <span className="font-medium">{request.supplierCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Next Actions</CardTitle>
            <CardDescription>Jump into the next workflow stage from here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            <Button asChild className="w-full justify-between" variant="outline" size="sm">
              <Link to={`/requests/${request.id}/approval`}>
                Review Approval
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="outline" size="sm">
              <Link to={`/requests/${request.id}/purchase-order`}>
                Purchase Order
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="outline" size="sm">
              <Link to={`/requests/${request.id}/canvass`}>
                Canvass Sheet
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="outline" size="sm">
              <Link to={`/requests/${request.id}/receiving`}>
                Receiving
                <ArrowRight className="size-4" />
              </Link>
            </Button>
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
