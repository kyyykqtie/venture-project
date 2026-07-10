import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

import { ComparisonGrid, StageWorkspaceShell, getRequest } from "./workflow"

export function CanvassReviewPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)

  return (
    <StageWorkspaceShell
      title="Canvass Review"
      description="Compare supplier quotations side by side and select the best quotation with justification when needed."
      request={request}
      action={<Button size="sm"><CheckCircle2 className="mr-2 size-4" />Confirm Supplier</Button>}
    >
      <div className="space-y-4">
        <ComparisonGrid request={request} />

        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Decision Justification</CardTitle>
            <CardDescription>Document why a supplier other than the lowest quotation was selected.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <Textarea rows={5} placeholder="Provide the rationale for supplier selection." />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Save Review Note</Button>
              <Button asChild size="sm">
                <Link to={`/requests/${request.id}/receiving`}>Proceed to Receiving</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StageWorkspaceShell>
  )
}
