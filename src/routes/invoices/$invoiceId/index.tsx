import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { InvoiceActions } from "@/components/InvoiceActions";
import { InvoiceDetails } from "@/components/InvoiceDetails";
import { ValidateInvoiceDialog } from "@/components/ValidateInvoiceDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  downloadInvoicePDF,
  openInvoicePDFInNewTab,
} from "@/lib/pdf-generator";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/invoices/$invoiceId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { invoiceId } = Route.useParams();
  const [showValidateDialog, setShowValidateDialog] = useState(false);

  const invoice = useQuery(api.invoices.get, {
    id: invoiceId as Id<"invoices">,
  });

  const client = useQuery(
    api.companies.get,
    invoice ? { id: invoice.clientId } : "skip"
  );

  const updateStatus = useMutation(api.invoices.updateStatus);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!invoice) return;

    setIsValidating(true);
    try {
      await updateStatus({
        id: invoice._id,
        status: "validated",
      });
      setShowValidateDialog(false);
    } catch (error) {
      console.error("Failed to validate invoice:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSendEmail = () => {
    alert("Email sending functionality to be implemented with n8n integration");
  };

  const handleSeeDocument = () => {
    if (!invoice || !client) return;
    openInvoicePDFInNewTab({ invoice, client });
  };

  const handleDownload = () => {
    if (!invoice || !client) return;
    downloadInvoicePDF({ invoice, client });
  };

  // Loading state
  if (invoice === undefined || (invoice && client === undefined)) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/invoices">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Not found state
  if (invoice === null) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/invoices">
              <ArrowLeft />
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
          <h3 className="text-xl font-semibold mb-2">Invoice not found</h3>
          <p className="text-muted-foreground text-center mb-6">
            The invoice you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link to="/invoices">Back to Invoices</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canValidate = invoice.status === "draft";

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/invoices">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <Badge variant="outline">{invoice.status.toUpperCase()}</Badge>
            </div>
            <p className="text-muted-foreground">Invoice Details</p>
          </div>
        </div>

        <InvoiceActions
          onValidate={() => setShowValidateDialog(true)}
          onSendEmail={handleSendEmail}
          onSeeDocument={handleSeeDocument}
          onDownload={handleDownload}
          isValidating={isValidating}
          canValidate={canValidate}
        />
      </div>

      {/* Invoice Details */}
      <InvoiceDetails invoice={invoice} client={client ?? undefined} />

      {/* Validate Confirmation Dialog */}
      <ValidateInvoiceDialog
        open={showValidateDialog}
        onOpenChange={setShowValidateDialog}
        onConfirm={handleValidate}
        invoiceNumber={invoice.invoiceNumber}
        isValidating={isValidating}
      />
    </div>
  );
}
