import { Card, CardContent } from "@/components/ui/card";
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
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { getFaviconUrl, getStatusColor, getStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface InvoiceDetailsProps {
  invoice: Doc<"invoices">;
  company?: Doc<"companies">;
}

export function InvoiceDetails({ invoice, company }: InvoiceDetailsProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const faviconUrl = company?.website ? getFaviconUrl(company.website) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "finalized":
        return <FileText className="h-4 w-4" />;
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Summary Card with Status */}
      <Card className="overflow-hidden">
        <div className={cn("h-2", getStatusColor(invoice.status))} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Hash className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <Badge className={cn("gap-1.5", getStatusColor(invoice.status))}>
              {getStatusIcon(invoice.status)}
              {getStatusLabel(invoice.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Amount</span>
              </div>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(invoice.total, invoice.currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {invoice.currency}
              </p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-lg font-semibold">
                {format(new Date(invoice._creationTime), "MMM dd, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(invoice._creationTime), "HH:mm")}
              </p>
            </div>

            {invoice.paidAt && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Paid</span>
                </div>
                <p className="text-lg font-semibold">
                  {format(new Date(invoice.paidAt), "MMM dd, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(invoice.paidAt), "HH:mm")}
                </p>
              </div>
            )}

            {invoice.finalizedAt && !invoice.paidAt && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Finalized</span>
                </div>
                <p className="text-lg font-semibold">
                  {format(new Date(invoice.finalizedAt), "MMM dd, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(invoice.finalizedAt), "HH:mm")}
                </p>
              </div>
            )}

            {invoice.cancelledAt && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Cancelled</span>
                </div>
                <p className="text-lg font-semibold">
                  {format(new Date(invoice.cancelledAt), "MMM dd, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(invoice.cancelledAt), "HH:mm")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Information Card */}
      {company && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              {faviconUrl ? (
                <div className="flex-shrink-0">
                  <img
                    src={faviconUrl}
                    alt={company.name}
                    className="w-16 h-16 rounded-lg border-2 border-border object-cover shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    className="hidden w-16 h-16 rounded-lg border-2 border-border items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
                    style={{ display: "none" }}
                  >
                    <Building className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-border flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <Building className="h-8 w-8 text-primary/60" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1">{company.name}</h3>
                {company.siret && (
                  <p className="text-sm text-muted-foreground">
                    SIRET: {company.siret}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm font-medium truncate">
                    {company.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Address
                  </p>
                  <p className="text-sm font-medium">{company.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {company.city} {company.zip}
                  </p>
                </div>
              </div>

              {company.website && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Website
                    </p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline truncate block"
                    >
                      {company.website}
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
