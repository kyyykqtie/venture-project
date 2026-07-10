import { useState } from "react"
import { useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DepartmentBadge } from "@/components/ui/Badges"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, OctagonAlert } from "lucide-react"

import { StageWorkspaceShell, getRequest } from "./workflow"

type DecisionMode = "approve" | "return"

export function ApprovalReviewPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)
  const [decisionMode, setDecisionMode] = useState<DecisionMode>("approve")
  const [decisionNote, setDecisionNote] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMode, setConfirmMode] = useState<DecisionMode>("approve")

  const openConfirmation = (mode: DecisionMode) => {
    setConfirmMode(mode)
    setConfirmOpen(true)
  }

  const confirmLabel = confirmMode === "approve" ? "Approve and Continue" : "Return for Revision"
  const confirmDescription =
    confirmMode === "approve"
      ? "Confirm that this request can proceed to the next workflow stage."
      : "Confirm that the request should be returned to the requester for revision."

  return (
    <StageWorkspaceShell
      title="Approval Review"
      description="Review the request summary, then approve it or return it with a revision note."
      request={request}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Request Summary</CardTitle>
                <CardDescription>Summary data is shown here so the approver can confirm the request before making a decision.</CardDescription>
              </div>
              <Badge variant="warning">Pending Approval</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Request Number</p>
                <p className="mt-1 font-semibold">{request.id}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                <div className="mt-2">
                  <DepartmentBadge department={request.department} />
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Amount</p>
                <p className="mt-1 font-semibold">{request.amount}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Date Needed</p>
                <p className="mt-1 font-semibold">{request.dueDate}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4" />
                Requested Items
              </div>
              <div className="overflow-hidden rounded-xl border border-border/60">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">QTY</th>
                      <th className="px-4 py-3 font-medium">Unit</th>
                      <th className="px-4 py-3 font-medium">Unit Price</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.lineItems.map((item) => (
                      <tr key={item.description} className="border-t border-border/60">
                        <td className="px-4 py-3 font-medium">{item.description}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.unitPrice || item.estimatedCost}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.estimatedCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Approval Actions</CardTitle>
            <CardDescription>Select the decision path, then confirm the action before the workflow continues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {/* BACKEND TODO: connect approval actions to the request_workflow_actions table, enforce RBAC permissions, and persist the approver decision with a server timestamp. */}

            <div className="space-y-2">
              <Label>Decision</Label>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant={decisionMode === "approve" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setDecisionMode("approve")}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Approve and Continue
                </Button>
                <Button
                  type="button"
                  variant={decisionMode === "return" ? "secondary" : "outline"}
                  className="justify-start"
                  onClick={() => setDecisionMode("return")}
                >
                  <OctagonAlert className="mr-2 size-4" />
                  Return for Revision
                </Button>
              </div>
            </div>

            {decisionMode === "return" ? (
              <div className="space-y-2">
                <Label htmlFor="decision-note">Decision Note</Label>
                <Textarea
                  id="decision-note"
                  rows={6}
                  value={decisionNote}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  placeholder="Optional note for the requester."
                />
              </div>
            ) : null}

            <Button className="w-full" size="sm" onClick={() => openConfirmation(decisionMode)}>
              {decisionMode === "approve" ? "Approve and Continue" : "Return for Revision"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {confirmMode === "approve" ? "Approval" : "Return"}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          {confirmMode === "return" ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Decision Note</p>
              <p className="mt-1">{decisionNote || "No revision note added."}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // BACKEND TODO: submit the chosen approval outcome to the workflow service and emit an audit trail event.
                setConfirmOpen(false)
              }}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StageWorkspaceShell>
  )
}
