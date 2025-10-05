import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "./ui/spinner";
import type { Doc } from "../../convex/_generated/dataModel";
import { CompanyCombobox } from "./ui/combobox/combobox-companies";

interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string;
  currency: string;
  total: number;
}

interface InvoiceFormProps {
  initialData?: InvoiceFormData;
  onSubmit: (data: InvoiceFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
  companies?: Array<Doc<"companies">>;
}

export function InvoiceForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  onDelete,
  isDeleting = false,
  companies = [],
}: InvoiceFormProps) {
  const form = useForm({
    defaultValues: {
      invoiceNumber: initialData?.invoiceNumber ?? "",
      clientId: initialData?.clientId ?? "",
      currency: initialData?.currency ?? "EUR",
      total: initialData?.total ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.clientId) {
        throw new Error("Client is required");
      }
      await onSubmit({
        invoiceNumber: value.invoiceNumber,
        clientId: value.clientId,
        currency: value.currency,
        total: value.total,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="invoiceNumber"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Invoice number is required" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Invoice Number *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="INV-001"
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="clientId"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Client is required" : undefined,
              }}
            >
              {(field) => {
                // Find the selected company object for the combobox
                const selectedCompany =
                  companies.find((c) => c._id === field.state.value) ||
                  ({} as Doc<"companies">);
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Client *</Label>
                    <CompanyCombobox
                      options={companies}
                      value={selectedCompany}
                      onValueChange={(val: Doc<"companies">) =>
                        field.handleChange(val._id)
                      }
                      placeholder="Select a client..."
                      buttonClassName="w-full"
                      contentClassName="w-full"
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                );
              }}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="currency"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Currency is required" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Currency *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      name={field.name}
                      aria-invalid={field.state.meta.errors.length > 0}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Field
            name="total"
            validators={{
              onChange: ({ value }) =>
                value < 0 ? "Total must be positive" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Total *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) => {
                    const total = parseFloat(e.target.value) || 0;
                    field.handleChange(total);
                  }}
                  onBlur={field.handleBlur}
                  placeholder="0.00"
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? "Deleting..." : "Delete Invoice"}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || isDeleting}>
            {(isSubmitting || isDeleting) && <Spinner />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
