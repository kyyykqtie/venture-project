import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

import { StageWorkspaceShell, getRequest, type RequestPdfLineItem } from "./workflow"

type CanvassSupplier = {
  id: string
  name: string
  contact: string
  note: string
}

type CanvassRow = {
  id: string
  description: string
  quantity: number
  unit: string
  quotes: string[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value)
}

function parseCurrency(value: string) {
  const numericValue = Number(value.replace(/[^\d.-]/g, ""))
  return Number.isFinite(numericValue) ? numericValue : 0
}

function createRow(item: RequestPdfLineItem, supplierCount: number): CanvassRow {
  return {
    id: `${item.description}-${Date.now()}`,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    quotes: Array.from({ length: supplierCount }, (_, index) => (index === 0 ? item.unitPrice || "0" : "0")),
  }
}

export function CanvassSheetPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)
  const initialSupplierCount = 3

  const [suppliers, setSuppliers] = useState<CanvassSupplier[]>(() =>
    Array.from({ length: initialSupplierCount }, (_, index) => ({
      id: `supplier-${index + 1}`,
      name: `Supplier ${index + 1}`,
      contact: "",
      note: index === 0 ? "Lowest quotation" : "",
    }))
  )
  const [rows, setRows] = useState<CanvassRow[]>(() =>
    request.lineItems.map((item) => createRow(item, initialSupplierCount))
  )

  const addSupplier = () => {
    setSuppliers((current) => [
      ...current,
      {
        id: `supplier-${current.length + 1}`,
        name: `Supplier ${current.length + 1}`,
        contact: "",
        note: "",
      },
    ])
    setRows((current) => current.map((row) => ({ ...row, quotes: [...row.quotes, "0"] })))
  }

  const updateSupplier = (index: number, field: keyof CanvassSupplier, value: string) => {
    setSuppliers((current) => current.map((supplier, supplierIndex) => (supplierIndex === index ? { ...supplier, [field]: value } : supplier)))
  }

  const addRow = () => {
    setRows((current) => [
      ...current,
      {
        id: `row-${Date.now()}`,
        description: "",
        quantity: 1,
        unit: "",
        quotes: Array.from({ length: suppliers.length }, () => "0"),
      },
    ])
  }

  const updateRow = (index: number, field: keyof Omit<CanvassRow, "quotes">, value: string | number) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)))
  }

  const updateQuote = (rowIndex: number, supplierIndex: number, value: string) => {
    setRows((current) =>
      current.map((row, currentRowIndex) => {
        if (currentRowIndex !== rowIndex) {
          return row
        }

        const quotes = row.quotes.slice()
        quotes[supplierIndex] = value
        return { ...row, quotes }
      })
    )
  }

  return (
    <StageWorkspaceShell
      title="Canvass Sheet"
      description="Capture supplier quotations and prepare the comparison sheet for review and persistence."
      request={request}
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={addSupplier}>
            <Plus className="mr-2 size-4" />
            Add Supplier
          </Button>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 size-4" />
            Add Item Row
          </Button>
          <Button asChild size="sm">
            <Link to={`/requests/${request.id}/canvass/review`}>Open Review</Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Canvass Comparison</CardTitle>
            <CardDescription>Enter supplier quotes directly into the comparison sheet. Each column stays ready for API persistence later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {/* BACKEND TODO: gate canvass access behind request and purchase-order status checks, then hydrate the editor from the canvass API when available. */}
            {!request.canvassUnlocked ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                Canvass capture is locked until the request reaches the approved purchase-order stage.
              </div>
            ) : null}

            {request.canvassUnlocked ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/60">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                        <th rowSpan={2} className="border-r border-border/60 px-3 py-3 text-left font-medium">Item Description</th>
                        <th rowSpan={2} className="border-r border-border/60 px-3 py-3 text-left font-medium">QTY</th>
                        {suppliers.map((supplier) => (
                          <th key={supplier.id} colSpan={2} className="border-r border-border/60 px-3 py-3 text-center font-medium last:border-r-0">
                            {supplier.name}
                          </th>
                        ))}
                      </tr>
                      <tr className="border-b border-border/60 bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                        {suppliers.map((supplier) => (
                          <>
                            <th key={`${supplier.id}-unit`} className="border-r border-border/60 px-3 py-2 font-medium">Unit Price</th>
                            <th key={`${supplier.id}-total`} className="border-r border-border/60 px-3 py-2 font-medium last:border-r-0">Total Amt.</th>
                          </>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={row.id} className="border-b border-border/60 last:border-0 align-top">
                          <td className="border-r border-border/60 px-3 py-3">
                            <Input
                              value={row.description}
                              onChange={(event) => updateRow(rowIndex, "description", event.target.value)}
                              placeholder="Item description"
                            />
                          </td>
                          <td className="border-r border-border/60 px-3 py-3">
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={row.quantity}
                              onChange={(event) => updateRow(rowIndex, "quantity", Number(event.target.value) || 0)}
                            />
                          </td>
                          {suppliers.map((supplier, supplierIndex) => {
                            const unitPrice = parseCurrency(row.quotes[supplierIndex] ?? "0")
                            const total = unitPrice * row.quantity

                            return (
                              <>
                                <td key={`${row.id}-${supplier.id}-unit`} className="border-r border-border/60 px-3 py-3">
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    value={row.quotes[supplierIndex] ?? ""}
                                    onChange={(event) => updateQuote(rowIndex, supplierIndex, event.target.value)}
                                    placeholder="0.00"
                                  />
                                </td>
                                <td key={`${row.id}-${supplier.id}-total`} className="border-r border-border/60 px-3 py-3 last:border-r-0 text-sm text-muted-foreground">
                                  {formatCurrency(total)}
                                </td>
                              </>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* BACKEND TODO: store canvass rows in a dedicated canvass_items table, persist supplier quote columns in canvass_supplier_quotes, and save updates through an authenticated API endpoint. */}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle>Supplier Setup</CardTitle>
              <CardDescription>Supplier metadata is editable here so procurement can prepare comparison records before saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm">
              {suppliers.map((supplier, index) => (
                <div key={supplier.id} className="space-y-2 rounded-xl border border-border/60 p-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${supplier.id}-name`}>Supplier Name</Label>
                    <Input
                      id={`${supplier.id}-name`}
                      value={supplier.name}
                      onChange={(event) => updateSupplier(index, "name", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${supplier.id}-contact`}>Contact / Note</Label>
                    <Input
                      id={`${supplier.id}-contact`}
                      value={supplier.contact}
                      onChange={(event) => updateSupplier(index, "contact", event.target.value)}
                      placeholder="Supplier contact"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${supplier.id}-note`}>Selection Note</Label>
                    <Input
                      id={`${supplier.id}-note`}
                      value={supplier.note}
                      onChange={(event) => updateSupplier(index, "note", event.target.value)}
                      placeholder="Optional note"
                    />
                  </div>
                </div>
              ))}

              {/* BACKEND TODO: connect supplier setup to a canvass_suppliers table and hydrate these inputs from the saved record. */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle>Save Canvass</CardTitle>
              <CardDescription>Persist the comparison sheet once the quotations are ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
              <p>Use this canvas to compare supplier totals and prepare the review step.</p>
              <Button className="w-full" size="sm">
                Save Canvass
              </Button>
              {/* BACKEND TODO: save and update canvass records through the request workflow API, including audit metadata and approval-ready state changes. */}
            </CardContent>
          </Card>
        </div>
      </div>
    </StageWorkspaceShell>
  )
}
