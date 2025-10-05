import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  Mail,
  MapPin,
  Globe,
  Building,
  Calendar,
  Hash,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

interface InvoiceDetailsProps {
  invoice: Doc<"invoices">;
  client?: Doc<"companies">;
}

export function InvoiceDetails({ invoice, client }: InvoiceDetailsProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Invoice Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Invoice Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(invoice.total, invoice.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(invoice._creationTime), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="text-lg font-semibold">{invoice.currency}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information Card */}
      {client && (
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="text-lg font-semibold">{client.name}</p>
                  {client.siret && (
                    <p className="text-sm text-muted-foreground mt-1">
                      SIRET: {client.siret}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-base">{client.address}</p>
                  <p className="text-base">
                    {client.city}, {client.state} {client.zip}
                  </p>
                </div>
              </div>
              {client.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-primary hover:underline"
                    >
                      {client.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
