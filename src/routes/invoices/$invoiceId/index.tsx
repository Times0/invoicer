import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { InvoiceActions } from "@/components/InvoiceActions";
import { InvoiceDetails } from "@/components/InvoiceDetails";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/$invoiceId/")({
  component: RouteComponent,
});

type DialogType = "finalize" | "cancel" | "pay" | null;

function RouteComponent() {
  const { invoiceId } = Route.useParams();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const invoice = useQuery(api.invoices.get, {
    id: invoiceId as Id<"invoices">,
  });

  const company = useQuery(
    api.companies.get,
    invoice ? { id: invoice.companyId } : "skip"
  );

  const finalizeInvoice = useMutation(api.invoices.finalize);
  const cancelInvoice = useMutation(api.invoices.cancel);
  const payInvoice = useMutation(api.invoices.pay);
  const generatePDF = useAction(api.invoices.generatePDF);

  // Cleanup PDF URL when dialog closes
  useEffect(() => {
    if (!previewDialogOpen && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [previewDialogOpen, pdfUrl]);

  const handleFinalize = async () => {
    if (!invoice) return;

    setIsProcessing(true);
    try {
      await finalizeInvoice({
        id: invoice._id,
      });
      toast.success("Invoice finalized successfully", {
        description: `Invoice ${invoice.invoiceNumber} is now finalized and ready to send.`,
      });
      setActiveDialog(null);
    } catch (error) {
      console.error("Failed to finalize invoice:", error);
      toast.error("Failed to finalize invoice", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    setIsProcessing(true);
    try {
      await cancelInvoice({ id: invoice._id });
      toast.success("Invoice cancelled", {
        description: `Invoice ${invoice.invoiceNumber} has been cancelled.`,
      });
      setActiveDialog(null);
    } catch (error) {
      console.error("Failed to cancel invoice:", error);
      toast.error("Failed to cancel invoice", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!invoice) return;
    setIsProcessing(true);
    try {
      await payInvoice({ id: invoice._id });
      toast.success("Invoice marked as paid", {
        description: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
      });
      setActiveDialog(null);
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error);
      toast.error("Failed to mark invoice as paid", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendEmail = () => {
    toast.info("Coming soon", {
      description:
        "Email sending functionality will be implemented with n8n integration.",
    });
  };

  const handleSeeDocument = async () => {
    if (!invoice) {
      toast.error("Unable to generate document", {
        description: "Invoice data is not available.",
      });
      return;
    }
    try {
      const pdfBuffer = await generatePDF({ invoiceId: invoice._id });
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error("Failed to open document:", error);
      toast.error("Failed to open document", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

  const handleDownload = async () => {
    if (!invoice) {
      toast.error("Unable to download document", {
        description: "Invoice data is not available.",
      });
      return;
    }
    try {
      const pdfBuffer = await generatePDF({ invoiceId: invoice._id });

      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded", {
        description: `Invoice ${invoice.invoiceNumber} has been downloaded.`,
      });
    } catch (error) {
      console.error("Failed to download document:", error);
      toast.error("Failed to download document", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    }
  };

  // Loading state
  if (invoice === undefined || (invoice && company === undefined)) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "default";
      case "finalized":
        return "secondary";
      case "paid":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

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
              <Badge variant={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">Invoice Details</p>
          </div>
        </div>

        <InvoiceActions
          status={invoice.status}
          onFinalize={() => setActiveDialog("finalize")}
          onCancel={() => setActiveDialog("cancel")}
          onMarkAsPaid={() => setActiveDialog("pay")}
          onSendEmail={handleSendEmail}
          onSeeDocument={handleSeeDocument}
          onDownload={handleDownload}
          isProcessing={isProcessing}
        />
      </div>

      {/* Invoice Details */}
      <InvoiceDetails invoice={invoice} company={company ?? undefined} />

      {/* Finalize Confirmation Dialog */}
      <ConfirmationDialog
        open={activeDialog === "finalize"}
        onOpenChange={(open) => setActiveDialog(open ? "finalize" : null)}
        onConfirm={handleFinalize}
        title="Finalize Invoice"
        description={`Are you sure you want to finalize invoice ${invoice.invoiceNumber}? Once finalized, the invoice will be locked and ready to send to the client. You won't be able to edit the invoice details after finalization.`}
        confirmText="Finalize Invoice"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={activeDialog === "cancel"}
        onOpenChange={(open) => setActiveDialog(open ? "cancel" : null)}
        onConfirm={handleCancel}
        title="Cancel Invoice"
        description={`Are you sure you want to cancel invoice ${invoice.invoiceNumber}? This action will mark the invoice as cancelled. Cancelled invoices cannot be sent to clients or marked as paid.`}
        confirmText="Cancel Invoice"
        variant="destructive"
        isLoading={isProcessing}
      />

      {/* Mark as Paid Confirmation Dialog */}
      <ConfirmationDialog
        open={activeDialog === "pay"}
        onOpenChange={(open) => setActiveDialog(open ? "pay" : null)}
        onConfirm={handlePay}
        title="Mark Invoice as Paid"
        description={`Are you sure you want to mark invoice ${invoice.invoiceNumber} as paid? This indicates that payment has been received from the client.`}
        confirmText="Mark as Paid"
        variant="success"
        isLoading={isProcessing}
      />

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        pdfUrl={pdfUrl}
        title={`Invoice ${invoice.invoiceNumber}`}
      />
    </div>
  );
}
