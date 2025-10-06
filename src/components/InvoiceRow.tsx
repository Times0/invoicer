import { Link } from "@tanstack/react-router";
import {
  FileText,
  Mail,
  MapPin,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { getFaviconUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Company {
  _id: string;
  name: string;
  email?: string;
  website?: string;
  city?: string;
  state?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  companyId: string;
}

interface InvoiceRowProps {
  invoice: Invoice;
  company: Company | undefined;
  onEdit: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "text-green-600 bg-green-50 border-green-200";
    case "sent":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "overdue":
      return "text-red-600 bg-red-50 border-red-200";
    case "draft":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "cancelled":
      return "text-orange-600 bg-orange-50 border-orange-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export function InvoiceRow({
  invoice,
  company,
  onEdit,
  onDelete,
}: InvoiceRowProps) {
  const faviconUrl = company?.website ? getFaviconUrl(company.website) : null;

  return (
    <div className="flex items-center gap-4 p-5 bg-card border rounded-lg hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
      {/* Client Icon */}
      <Link
        to="/invoices/$invoiceId"
        params={{ invoiceId: invoice._id }}
        className="flex-shrink-0"
      >
        {faviconUrl ? (
          <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-muted bg-muted flex items-center justify-center">
            <img
              src={faviconUrl}
              alt={company?.name}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <FileText className="hidden w-8 h-8 text-muted-foreground" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg border-2 border-muted bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </Link>

      {/* Invoice & Client Info */}
      <Link
        to="/invoices/$invoiceId"
        params={{ invoiceId: invoice._id }}
        className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Left: Invoice Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(invoice.total, invoice.currency)}
          </div>
        </div>

        {/* Center: Client Details */}
        <div className="space-y-1 md:col-span-2">
          <div className="font-medium text-base flex items-center gap-2">
            {company?.website ? (
              <Link
                to={
                  company.website.startsWith("http")
                    ? company.website
                    : `https://${company.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {company.name || "Unknown Company"}
                <ExternalLink className="h-3 w-3 text-muted-foreground ml-1" />
              </Link>
            ) : (
              <span>{company?.name || "Unknown Company"}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {company?.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{company.email}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions Dropdown */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onEdit(invoice._id);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(invoice._id);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
