import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, FileText, Download } from "lucide-react";

interface InvoiceActionsProps {
  onValidate: () => void;
  onSendEmail: () => void;
  onSeeDocument: () => void;
  onDownload: () => void;
  isValidating?: boolean;
  canValidate?: boolean;
}

export function InvoiceActions({
  onValidate,
  onSendEmail,
  onSeeDocument,
  onDownload,
  isValidating = false,
  canValidate = true,
}: InvoiceActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {canValidate && (
        <Button
          onClick={onValidate}
          disabled={isValidating}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle />
          {isValidating ? "Validating..." : "Validate"}
        </Button>
      )}
      <Button onClick={onSendEmail} size="lg" variant="outline">
        <Mail />
        Send Email
      </Button>
      <Button onClick={onSeeDocument} size="lg" variant="outline">
        <FileText />
        See Document
      </Button>
      <Button onClick={onDownload} size="lg" variant="outline">
        <Download />
        Download
      </Button>
    </div>
  );
}
