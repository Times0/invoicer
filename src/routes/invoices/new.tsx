import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { InvoiceForm } from "@/components/InvoiceForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/invoices/new")({
  component: NewInvoice,
});

function NewInvoice() {
  const navigate = useNavigate();
  const addInvoice = useMutation(api.invoices.add);
  const companies = useQuery(api.companies.list);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    invoiceNumber: string;
    companyId: Id<"companies">;
    status: string;
    currency: string;
    total: number;
  }) => {
    try {
      setIsSubmitting(true);
      await addInvoice({
        invoiceNumber: data.invoiceNumber,
        companyId: data.companyId,
        status: data.status,
        currency: data.currency,
        total: data.total,
      });
      navigate({ to: "/invoices" });
    } catch (error) {
      console.error("Failed to create invoice:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (companies === undefined) {
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
            <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
            <p className="text-muted-foreground">
              Create a new invoice for your client
            </p>
          </div>
        </div>

        <InvoiceForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Invoice"
          companies={companies}
        />
      </div>
    </div>
  );
}
