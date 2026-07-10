import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheck2 } from "lucide-react"

import { StageWorkspaceShell, SummaryStat, getRequest } from "./workflow"

export function PurchaseOrderPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)

  return (
    <StageWorkspaceShell
      title="Purchase Order"
      description="Generate the purchase order only after approval is complete."
      request={request}
      action={
        <Button size="sm">
          <FileCheck2 className="mr-2 size-4" />
          Generate PO
        </Button>
      }
    >
      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle>PO Summary</CardTitle>
          <CardDescription>Use this stage to confirm the order before canvass work begins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryStat label="Vendor" value="Pending" hint="Selected after review" />
            <SummaryStat label="Terms" value="Net 30" hint="Editable in future iterations" />
            <SummaryStat label="Status" value="Ready" hint="Awaiting PO generation" />
          </div>
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            The canvass sheet remains inaccessible until this stage is generated and approved.
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/requests/${request.id}/canvass`}>Continue to Canvass</Link>
          </Button>
        </CardContent>
      </Card>
    </StageWorkspaceShell>
  )
}
