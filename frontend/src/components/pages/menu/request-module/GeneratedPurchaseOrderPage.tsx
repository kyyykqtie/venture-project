import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Printer } from "lucide-react"

import { StageWorkspaceShell, getRequest } from "./workflow"

export function GeneratedPurchaseOrderPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)

  return (
    <StageWorkspaceShell
      title="Generated Purchase Order"
      description="Review the generated PO before confirming receipt or moving to the next operational step."
      request={request}
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 size-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
          <Button asChild size="sm">
            <Link to={`/requests/${request.id}/receiving`}>Go to Receiving</Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.85fr)]">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Purchase Order Summary</CardTitle>
            <CardDescription>This preview is the document users should see before confirming receipt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">PO Number</p>
                <p className="mt-1 font-semibold">{request.purchaseOrder.poNumber}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vendor</p>
                <p className="mt-1 font-semibold">{request.purchaseOrder.vendor}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Prepared By</p>
                <p className="mt-1 font-semibold">{request.purchaseOrder.preparedBy}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Approved By</p>
                <p className="mt-1 font-semibold">{request.purchaseOrder.approvedBy}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {request.lineItems.map((item) => (
                    <tr key={item.description} className="border-t border-border/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.specification}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.estimatedCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle>PO Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm">
              <Badge variant="secondary">{request.purchaseOrder.status}</Badge>
              <p className="text-muted-foreground">This document is available to review before receipt confirmation.</p>
              <p className="text-muted-foreground">Delivery date: {request.purchaseOrder.deliveryDate}</p>
              <p className="text-muted-foreground">Payment terms: {request.purchaseOrder.terms}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle>Use This PO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
              <p>1. Review the generated PO.</p>
              <p>2. Confirm receipt against the PO.</p>
              <p>3. Close the request after items are received.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </StageWorkspaceShell>
  )
}
