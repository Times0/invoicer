import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Mail,
  FileText,
  Download,
  XCircle,
  DollarSign,
} from "lucide-react";

interface InvoiceActionsProps {
  status: "draft" | "finalized" | "paid" | "cancelled";
  onFinalize?: () => void;
  onCancel?: () => void;
  onMarkAsPaid?: () => void;
  onSendEmail: () => void;
  onSeeDocument: () => void;
  onDownload: () => void;
  isProcessing?: boolean;
}

export function InvoiceActions({
  status,
  onFinalize,
  onCancel,
  onMarkAsPaid,
  onSendEmail,
  onSeeDocument,
  onDownload,
  isProcessing = false,
}: InvoiceActionsProps) {
  const canFinalize = status === "draft";
  const canCancel = status === "draft" || status === "finalized";
  const canMarkAsPaid = status === "finalized";
  const canSendEmail = status === "finalized" || status === "paid";

  return (
    <div className="flex flex-wrap gap-3">
      {/* Primary Actions */}
      {canFinalize && onFinalize && (
        <Button
          onClick={onFinalize}
          disabled={isProcessing}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle />
          {isProcessing ? "Processing..." : "Finalize Invoice"}
        </Button>
      )}

      {canMarkAsPaid && onMarkAsPaid && (
        <Button
          onClick={onMarkAsPaid}
          disabled={isProcessing}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <DollarSign />
          {isProcessing ? "Processing..." : "Mark as Paid"}
        </Button>
      )}

      {/* Document Actions */}
      {canSendEmail && (
        <Button onClick={onSendEmail} size="lg" variant="outline">
          <Mail />
          Send Email
        </Button>
      )}

      <Button onClick={onSeeDocument} size="lg" variant="outline">
        <FileText />
        See Document
      </Button>

      <Button onClick={onDownload} size="lg" variant="outline">
        <Download />
      </Button>

      {/* Destructive Action */}
      {canCancel && onCancel && (
        <Button
          onClick={onCancel}
          disabled={isProcessing}
          size="lg"
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
          <XCircle />
          Cancel Invoice
        </Button>
      )}
    </div>
  );
}
