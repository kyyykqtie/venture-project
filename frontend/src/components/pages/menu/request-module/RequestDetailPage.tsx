import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, FileCheck2, Printer } from "lucide-react"

import { ModulePageShell, RequestDetailWorkspace, RequestPdfPreview, WorkflowProgressTracker, getRequest } from "./workflow"

export function RequestDetailPage() {
  const { requestId } = useParams()
  const request = getRequest(requestId)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handlePrintPdf = () => {
    // BACKEND TODO: replace window.print() with a generated PDF artifact or dedicated print route once document storage is available.
    window.print()
  }

  return (
    <ModulePageShell
      title={`${request.id} | ${request.title}`}
      description="This detail hub keeps the request context, stage progression, and next actions in one workspace."
      action={
        <>
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-4" />
                Live PDF Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Live PDF Preview</DialogTitle>
                <DialogDescription>
                  This preview stays in sync with the request record and will later be fed by the create request draft payload.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <RequestPdfPreview request={request} />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrintPdf}>
                    <Printer className="mr-2 size-4" />
                    Print PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handlePrintPdf}>
            <Printer className="mr-2 size-4" />
            Print PDF
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link to={`/requests/${request.id}/approval`}>Open Approval</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/requests/${request.id}/purchase-order`}>
              <FileCheck2 className="mr-2 size-4" />
              Generate PO
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link to={`/requests/${request.id}/purchase-order/view`}>View PO</Link>
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <WorkflowProgressTracker stage={request.stage} />
        <RequestDetailWorkspace request={request} />
      </div>
    </ModulePageShell>
  )
}
