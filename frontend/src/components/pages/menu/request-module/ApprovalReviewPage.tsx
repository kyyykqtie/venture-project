import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, OctagonAlert } from "lucide-react"
import { usePermissions } from "@/context/AuthContext"

import { ModulePageShell, statusTone, useRequest } from "./workflow"
import { DepartmentBadge, type DepartmentName } from "@/components/ui/Badges"

type DecisionMode = "approve" | "return"



function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value)
}


function formatDateDisplay(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function parseCurrencyValue(value: string) {
  const numeric = Number(value.replace(/[^\d.-]/g, ""))
  return Number.isFinite(numeric) ? numeric : 0
}

export function ApprovalReviewPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { request, isLoading, error } = useRequest(requestId)
  const { hasPermission } = usePermissions()

  const [decisionMode, setDecisionMode] = useState<DecisionMode>("approve")
  const [decisionNote, setDecisionNote] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <ModulePageShell title="Loading…" description="Fetching request details.">
        <div className="p-6 text-sm text-muted-foreground">Loading request…</div>
      </ModulePageShell>
    )
  }

  if (error || !request) {
    return (
      <ModulePageShell title="Request Not Found" description="This request could not be loaded.">
        <div className="p-6 text-sm text-destructive">{error ?? "Request not found."}</div>
      </ModulePageShell>
    )
  }

  const isInitialStage = request.status === "submitted" || request.status === "pending_initial_approval"
  const isFinalStage = request.status === "pending_final_approval"
  const canActInitial = isInitialStage && hasPermission("approve_request_initial")
  const canActFinal = isFinalStage && hasPermission("approve_request_final")
  const canAct = canActInitial || canActFinal
  const isTerminal = request.status === "approved" || request.status === "declined"

  const endpoint = canActInitial
    ? `/purchase-requests/${request.id}/approve/initial`
    : `/purchase-requests/${request.id}/approve/final`

  const submitDecision = async (decision: "approve" | "decline") => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, remarks: decisionNote || undefined }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? "Failed to submit decision")
      }
      setConfirmOpen(false)
      navigate(`/requests/${request.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit decision")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmLabel = decisionMode === "approve" ? "Approve and Continue" : "Return for Revision"
  const confirmDescription =
    decisionMode === "approve"
      ? "Confirm that this request can proceed to the next workflow stage."
      : "Confirm that the request should be returned to the requester for revision."

  return (
    <ModulePageShell
      title="Approval Review"
      description="Review the request summary, then approve it or return it with a revision note."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Request Summary</CardTitle>
                <CardDescription>{request.requestNumber} — {request.title}</CardDescription>
              </div>
              <Badge variant={statusTone("Awaiting Approval")}>
                {isFinalStage ? "Pending Final Approval" : "Pending Initial Approval"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Request Number</p>
                <p className="mt-1 font-semibold">{request.requestNumber}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                <div className="mt-2">
                  {request.departmentName ? (
                    <DepartmentBadge department={request.departmentName as DepartmentName} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Requested By</p>
                <p className="mt-1 font-semibold">{request.requestedByName ?? request.requestedByUserId}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
                <p className="mt-1 font-semibold">{formatCurrency(parseCurrencyValue(request.budget))}</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Date Needed</p>
                <p className="mt-1 font-semibold">{formatDateDisplay(request.dateNeeded ?? "Not specified")}</p>
              </div>
            </div>

            <Separator />

            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              Line items are not yet stored as structured data on the backend — itemized detail will appear here once that's added to the schema.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Approval Actions</CardTitle>
            <CardDescription>Select the decision path, then confirm the action before the workflow continues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {isTerminal ? (
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                This request has reached a final state ({request.status === "approved" ? "Final Approved" : "Declined"}) and no further action is available here.
              </div>
            ) : !canAct ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                You do not have permission to act on this request at its current stage.
              </div>
            ) : (
              <>
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
                      Approve ({canActFinal ? "Final" : "Initial"})
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
                    <Label htmlFor="decision-note">Decision Note (required to decline)</Label>
                    <Textarea
                      id="decision-note"
                      rows={6}
                      value={decisionNote}
                      onChange={(event) => setDecisionNote(event.target.value)}
                      placeholder="Reason for returning this request."
                    />
                  </div>
                ) : null}

                <Button className="w-full" size="sm" onClick={() => setConfirmOpen(true)}>
                  {decisionMode === "approve" ? "Approve and Continue" : "Return for Revision"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {decisionMode === "approve" ? "Approval" : "Return"}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          {decisionMode === "return" ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Decision Note</p>
              <p className="mt-1">{decisionNote || "No revision note added."}</p>
            </div>
          ) : null}
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={() => submitDecision(decisionMode === "approve" ? "approve" : "decline")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModulePageShell>
  )
}