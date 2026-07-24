import { Link, useParams } from "react-router-dom"
import { usePermissions } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { FileCheck2, Printer } from "lucide-react"



import { ModulePageShell, RequestDetailWorkspace, WorkflowProgressTracker, mapApiStatusToStageInfo, useRequest } from "./workflow"



export function RequestDetailPage() {
  const { requestId } = useParams()
  const { request, isLoading, error } = useRequest(requestId)
  // const [previewOpen, setPreviewOpen] = useState(false)
  const { hasPermission } = usePermissions()

  const canSeeApproval = hasPermission("approve_request_initial") || hasPermission("approve_request_final")

  const handlePrintPdf = () => {
    // BACKEND TODO: replace window.print() with a generated PDF artifact or dedicated print route once document storage is available.
    window.print()
  }

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

  const stageInfo = mapApiStatusToStageInfo(request)

  return (
    <ModulePageShell
      title={`${request.requestNumber} | ${request.title}`}
      description="This detail hub keeps the request context, stage progression, and next actions in one workspace."
      action={
        <>
          <Button variant="outline" size="sm" onClick={handlePrintPdf}>
            <Printer className="mr-2 size-4" />
            Print PDF
          </Button>
          {canSeeApproval && (
            <Button variant="outline" asChild size="sm">
              <Link to={`/requests/${request.id}/approval`}>Open Approval</Link>
            </Button>
          )}
          {request.status === "approved" && (
            <Button asChild size="sm">
              <Link to={`/requests/${request.id}/purchase-order`}>
                <FileCheck2 className="mr-2 size-4" />
                Generate PO
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild size="sm">
            <Link to={`/requests/${request.id}/purchase-order/view`}>View PO</Link>
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <WorkflowProgressTracker stage={stageInfo.stage} declinedAt={stageInfo.declinedAt} />
        <RequestDetailWorkspace request={request} />
      </div>
    </ModulePageShell>
  )
}