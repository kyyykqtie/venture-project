import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { StageWorkspaceShell, getRequest } from "./workflow"

export function RequestCompletedPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)

  return (
    <StageWorkspaceShell
      title="Process Completed"
      description="The request is closed and available for audit, reference, and reporting."
      request={request}
      action={
        <Button asChild size="sm">
          <Link to="/requests/my">Back to Requests</Link>
        </Button>
      }
    >
      <Card>
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle>Completion Summary</CardTitle>
          <CardDescription>Show the final state without allowing additional operational changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
          <p>The request has moved through approval, canvass, purchase, and receiving.</p>
          <p>The next implementation pass can add exports, audit logs, and document archiving.</p>
        </CardContent>
      </Card>
    </StageWorkspaceShell>
  )
}
