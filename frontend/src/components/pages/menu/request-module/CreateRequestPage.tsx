import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

import {
  ModulePageShell,
  type RequestFormData,
  type RequestPdfLineItem,
  saveRequestDraft,
} from "./workflow"

const departmentOptions = ["Operations", "Finance", "HR", "SalesMarketing"] as const
const shippingTermOptions = ["FOB", "CIF", "DDP"] as const
const shippingMethodOptions = ["Supplier Delivery", "Courier", "Pickup"] as const

function createBlankLineItem(): RequestPdfLineItem {
  return {
    description: "",
    quantity: 1,
    unit: "",
    unitPrice: "0",
    estimatedCost: "0",
  }
}

function createInitialDraft(): RequestFormData {
  const today = new Date()
  return {
    id: "REQ-0001",
    title: "",
    department: "Operations",
    budget: "",
    requestDate: today.toISOString().slice(0, 10),
    dateNeeded: "",
    submittedBy: "",
    submittedDate: today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),

    shippingTerms: "Net 30",
    shippingMethod: "Supplier Delivery",
    deliveryDate: "",

    remarks: "",
    address: "",
    phone: "",

    lineItems: [createBlankLineItem()],
  }
}

function parseCurrency(value: string) {
  const numericValue = Number(value.replace(/[^\d.-]/g, ""))
  return Number.isFinite(numericValue) ? numericValue : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value)
}

export function CreateRequestPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<RequestFormData>(() => createInitialDraft())
  const today = new Date().toISOString().split("T")[0]

  const subtotal = draft.lineItems.reduce((total, item) => total + parseCurrency(item.estimatedCost), 0)

  const updateField = <K extends keyof RequestFormData>(field: K, value: RequestFormData[K]) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateLineItem = <K extends keyof RequestPdfLineItem>(index: number, field: K, value: RequestPdfLineItem[K]) => {
    setDraft((current) => {
      const nextItems = current.lineItems.slice()
      const nextItem = { ...nextItems[index], [field]: value }

      if (field === "quantity" || field === "unitPrice") {
        const quantityValue = field === "quantity" ? Number(value) : nextItem.quantity
        const unitPriceValue = field === "unitPrice" ? Number(value) : parseCurrency(nextItem.unitPrice ?? "0")
        nextItem.estimatedCost = formatCurrency(quantityValue * unitPriceValue)
      }

      nextItems[index] = nextItem

      return {
        ...current,
        lineItems: nextItems,
      }
    })
  }

  const addLineItem = () => {
    setDraft((current) => ({
      ...current,
      lineItems: [...current.lineItems, createBlankLineItem()],
    }))
  }

  const removeLineItem = (index: number) => {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.length === 1 ? [createBlankLineItem()] : current.lineItems.filter((_, lineIndex) => lineIndex !== index),
    }))
  }

  const handleSubmitDraft = () => {
    if (
      draft.deliveryDate &&
      draft.deliveryDate < today
    ) {
      alert("Delivery Date cannot be earlier than today.")
      return
    }

    // TODO:
    // Backend should:
    // - Generate UUID
    // - Generate PR-2026-000001
    // - Validate delivery date again

    saveRequestDraft(draft)

    navigate(`/requests/${draft.id}`)
  }

  return (
    <ModulePageShell
      title="Create Request"
      description="Capture the request details once, then reuse the same draft model for approval and PDF rendering."
      action={
        <Button variant="outline" asChild size="sm">
          <Link to="/requests/my">
            <ArrowLeft className="mr-2 size-4" />
            Cancel
          </Link>
        </Button>
      }
    >
      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle>Request Draft</CardTitle>
          <CardDescription>
            The create form is the base data source for the request PDF and future backend persistence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="request-number">Request Number</Label>
              {/* {/* // TODO (Backend):
              // Replace with the server-generated display request number */}

              <Input id="request-number" value={draft.id} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-title">Request Title</Label>
              <Input
                id="request-title"
                value={draft.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Laptop procurement request"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={draft.budget}
                onChange={(event) => updateField("budget", event.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={draft.department} onValueChange={(value) => updateField("department", value as RequestFormData["department"])}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-date">Request Date</Label>
              <Input
                id="request-date"
                type="date"
                value={draft.requestDate}
                onChange={(event) => updateField("requestDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-needed">Date Needed</Label>
              <Input
                id="date-needed"
                type="date"
                value={draft.dateNeeded}
                onChange={(event) => updateField("dateNeeded", event.target.value)}
              />
            </div>
          </div>




          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <div className="space-y-2">
              <Label htmlFor="submitted-by">Requested By</Label>
              <Input
                id="submitted-by"
                type="text"
                value={draft.submittedBy}
                onChange={(event) =>
                  updateField("submittedBy", event.target.value)
                }
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>

              <div className="flex">
                <div className="flex w-20 items-center justify-center rounded-l-md border border-r-0 bg-muted text-sm font-medium">
                  +63
                </div>

                <Input
                  id="phone"
                  type="tel"
                  className="rounded-l-none"
                  value={draft.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="9123456789"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={draft.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Complete delivery address"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="shipping-terms">Shipping Terms</Label>
              <Select value={draft.shippingTerms} onValueChange={(value) => updateField("shippingTerms", value as RequestFormData["shippingTerms"])}>
                <SelectTrigger id="shipping-terms">
                  <SelectValue placeholder="Select shipping terms" />
                </SelectTrigger>
                <SelectContent>
                  {shippingTermOptions.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping-method">Shipping Method</Label>
              <Select value={draft.shippingMethod} onValueChange={(value) => updateField("shippingMethod", value as RequestFormData["shippingMethod"])}>
                <SelectTrigger id="shipping-method">
                  <SelectValue placeholder="Select shipping method" />
                </SelectTrigger>
                <SelectContent>
                  {shippingMethodOptions.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-date">Delivery Date</Label>
              <Input

                id="delivery-date"
                type="date"
                min={today}
                value={draft.deliveryDate}
                onChange={(event) =>
                  updateField("deliveryDate", event.target.value)
                }
              />
            </div>
          </div>


          <Separator />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Requested Materials / Services</h3>
                <p className="text-sm text-muted-foreground">Enter the items needed for the request. Quantity and price inputs stay typed for later backend mapping.</p>
              </div>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 size-4" />
                Add Item
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">QTY</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Unit Price</th>
                    <th className="px-4 py-3 font-medium">Estimated Cost</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.lineItems.map((item, index) => (
                    <tr key={`${draft.id}-${index}`} className="border-t border-border/60">
                      <td className="px-4 py-3 align-top">
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(event) => updateLineItem(index, "description", event.target.value)}
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) => updateLineItem(index, "quantity", Number(event.target.value) || 0)}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Input
                          type="text"
                          value={item.unit}
                          onChange={(event) => updateLineItem(index, "unit", event.target.value)}
                          placeholder="pcs"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) => updateLineItem(index, "unitPrice", event.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Input type="text" value={item.estimatedCost} readOnly />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div>
              <Label htmlFor="remarks">Remarks / Instructions</Label>
              <Textarea
                id="remarks"
                rows={7}
                value={draft.remarks}
                onChange={(event) => updateField("remarks", event.target.value)}
                placeholder="Add supporting notes, delivery instructions, or special handling details."
              />
            </div>
            {/* BACKEND TODO: persist this draft to the procurement_requests table and procurement_request_items table, then replace the static request number with the server-generated sequence. */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Estimated subtotal:</span> {formatCurrency(subtotal)}
            </div>
          </div>

          <div className="border-t border-border/60 pt-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div>
                <h3 className="text-sm font-semibold">Submit Draft</h3>
                <p className="text-sm text-muted-foreground">
                  Submit when the draft is complete. The same field set will feed approval, canvass, and PDF rendering.
                </p>
              </div>
              <Button size="lg" className="min-w-44 px-8" onClick={handleSubmitDraft}>
                Submit Draft
              </Button>
            </div>
            {/* BACKEND TODO: connect submit handling to authentication, RBAC checks, and the request creation endpoint. */}
          </div>
        </CardContent>
      </Card>
    </ModulePageShell>
  )
}
