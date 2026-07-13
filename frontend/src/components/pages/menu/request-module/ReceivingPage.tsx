import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Truck } from "lucide-react"
import { usePermissions } from "@/context/AuthContext"

import { StageWorkspaceShell, getRequest } from "./workflow"

export function ReceivingPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)
  const { hasPermission } = usePermissions()
  const canReceive = hasPermission("receive_goods")

  return (
    <StageWorkspaceShell
      title="Receiving"
      description="Log delivered items, inspect quantities, and close the request after receipt."
      request={request}
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild size="sm">
            <Link to={`/requests/${request.id}/purchase-order/view`}>View Generated PO</Link>
          </Button>
          {canReceive && (
            <Button size="sm">
              <Truck className="mr-2 size-4" />
              Confirm Receipt
            </Button>
          )}
        </div>
      }
    >
      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle>Receiving Checklist</CardTitle>
          <CardDescription>Capture what was delivered and note any discrepancies before completion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            Items received against the approved order: {request.purchaseOrder.poNumber}.
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            Partial delivery and variance support can be added later.
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/requests/${request.id}/completed`}>Close Request</Link>
          </Button>
        </CardContent>
      </Card>
    </StageWorkspaceShell>
  )
}
