import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { InvoiceForm } from "@/components/InvoiceForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { InvoiceStatus } from "convex/schema";

export const Route = createFileRoute("/invoices/$invoiceId/edit")({
  component: EditInvoice,
});

function EditInvoice() {
  const { invoiceId } = Route.useParams();
  const navigate = useNavigate();
  const invoice = useQuery(api.invoices.get, {
    id: invoiceId as Id<"invoices">,
  });
  const companies = useQuery(api.companies.list);
  const editInvoice = useMutation(api.invoices.edit);
  const removeInvoice = useMutation(api.invoices.remove);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data: {
    invoiceNumber: string;
    clientId: string;
    status: InvoiceStatus;
    currency: string;
    total: number;
  }) => {
    try {
      setIsSubmitting(true);
      await editInvoice({
        id: invoiceId as Id<"invoices">,
        invoiceNumber: data.invoiceNumber,
        clientId: data.clientId as Id<"companies">,
        status: data.status,
        currency: data.currency,
        total: data.total,
      });
      navigate({ to: "/invoices" });
    } catch (error) {
      console.error("Failed to update invoice:", error);
      alert("Failed to update invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await removeInvoice({ id: invoiceId as Id<"invoices"> });
      navigate({ to: "/invoices" });
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      alert("Failed to delete invoice. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (invoice === undefined || companies === undefined) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/invoices" })}
            >
              <ArrowLeft />
            </Button>
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (invoice === null) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/invoices" })}
            >
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Invoice Not Found
              </h1>
              <p className="text-muted-foreground">
                The invoice you're looking for doesn't exist
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/invoices" })}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
            <p className="text-muted-foreground">
              Update {invoice.invoiceNumber}'s information
            </p>
          </div>
        </div>

        <InvoiceForm
          initialData={{
            invoiceNumber: invoice.invoiceNumber,
            clientId: invoice.clientId,
            status: invoice.status,
            currency: invoice.currency,
            total: invoice.total,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Invoice"
          onDelete={handleDelete}
          isDeleting={isDeleting}
          companies={companies}
        />
      </div>
    </div>
  );
}
