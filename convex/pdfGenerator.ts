import { jsPDF } from "jspdf";

// ============================================================================
// THEME CONFIGURATION - Customize your invoice colors here
// ============================================================================
const THEME = {
  // Primary accent color (minimal usage for subtle highlights)
  primary: { r: 30, g: 30, b: 30 }, // Almost black

  // Text colors
  textPrimary: { r: 0, g: 0, b: 0 }, // Black
  textSecondary: { r: 100, g: 100, b: 100 }, // Medium gray
  textMuted: { r: 160, g: 160, b: 160 }, // Light gray

  // Status colors (subtle)
  statusDraft: { r: 120, g: 120, b: 120 }, // Gray
  statusFinalized: { r: 70, g: 130, b: 180 }, // Steel blue
  statusPaid: { r: 60, g: 130, b: 80 }, // Forest green
  statusCancelled: { r: 140, g: 70, b: 70 }, // Muted red

  // Border colors
  borderLight: { r: 230, g: 230, b: 230 }, // Very light gray
  borderMedium: { r: 180, g: 180, b: 180 }, // Medium gray
  borderDark: { r: 100, g: 100, b: 100 }, // Dark gray
} as const;

interface Invoice {
  _creationTime: number;
  invoiceNumber: string;
  status: "draft" | "finalized" | "paid" | "cancelled";
  currency: string;
  total: number;
}

interface Company {
  name: string;
  siret?: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  website?: string;
}

interface GenerateInvoicePDFOptions {
  invoice: Invoice;
  clientCompany: Company;
  myCompany?: Company;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function generateInvoicePDF({
  invoice,
  clientCompany,
  myCompany,
}: GenerateInvoicePDFOptions): ArrayBuffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;

  // Font sizes
  const titleSize = 22;
  const headingSize = 12;
  const normalSize = 10;
  const smallSize = 9;

  let yPos = margin + 10;

  // ============================================================================
  // SECTION 1: Header - Clean and minimal
  // ============================================================================
  doc.setTextColor(THEME.textPrimary.r, THEME.textPrimary.g, THEME.textPrimary.b);
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, yPos);

  // Invoice number on the right
  doc.setFontSize(headingSize);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber, pageWidth - margin, yPos, {
    align: "right",
  });

  yPos += 3;

  // Simple line under header
  doc.setDrawColor(THEME.borderDark.r, THEME.borderDark.g, THEME.borderDark.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 12;

  // ============================================================================
  // SECTION 2: Invoice Details & Status - Minimal info row
  // ============================================================================
  doc.setFontSize(smallSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(THEME.textSecondary.r, THEME.textSecondary.g, THEME.textSecondary.b);

  // Date
  const dateText = formatDate(invoice._creationTime);
  doc.text(`Date: ${dateText}`, margin, yPos);

  // Currency
  doc.text(`Currency: ${invoice.currency}`, margin + 70, yPos);

  // Status (right aligned, simple text)
  const statusText = invoice.status.toUpperCase();
  let statusColor: { r: number; g: number; b: number } = THEME.statusDraft;
  if (invoice.status === "paid") statusColor = THEME.statusPaid;
  else if (invoice.status === "finalized") statusColor = THEME.statusFinalized;
  else if (invoice.status === "cancelled") statusColor = THEME.statusCancelled;

  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`Status: ${statusText}`, pageWidth - margin, yPos, { align: "right" });

  yPos += 15;

  // ============================================================================
  // SECTION 3: From (Sender) & Bill To (Receiver) - Clean two column layout
  // ============================================================================
  const companiesStartY = yPos;

  // Left Column: From (My Company)
  if (myCompany) {
    doc.setFontSize(normalSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(THEME.textPrimary.r, THEME.textPrimary.g, THEME.textPrimary.b);
    doc.text("FROM", margin, yPos);
    yPos += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(normalSize);
    doc.text(myCompany.name, margin, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(smallSize);
    doc.setTextColor(THEME.textSecondary.r, THEME.textSecondary.g, THEME.textSecondary.b);

    if (myCompany.siret) {
      doc.text(`SIRET: ${myCompany.siret}`, margin, yPos);
      yPos += 4;
    }

    doc.text(myCompany.address, margin, yPos);
    yPos += 4;
    doc.text(`${myCompany.city}, ${myCompany.zip}`, margin, yPos);
    yPos += 4;
    doc.text(myCompany.email, margin, yPos);
    yPos += 4;

    if (myCompany.website) {
      doc.text(myCompany.website, margin, yPos);
      yPos += 4;
    }
  }

  // Right Column: Bill To (Client)
  yPos = companiesStartY;
  const rightColX = pageWidth / 2 + 10;

  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(THEME.textPrimary.r, THEME.textPrimary.g, THEME.textPrimary.b);
  doc.text("BILL TO", rightColX, yPos);
  yPos += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(normalSize);
  doc.text(clientCompany.name, rightColX, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(smallSize);
  doc.setTextColor(THEME.textSecondary.r, THEME.textSecondary.g, THEME.textSecondary.b);

  if (clientCompany.siret) {
    doc.text(`SIRET: ${clientCompany.siret}`, rightColX, yPos);
    yPos += 4;
  }

  doc.text(clientCompany.address, rightColX, yPos);
  yPos += 4;
  doc.text(`${clientCompany.city}, ${clientCompany.zip}`, rightColX, yPos);
  yPos += 4;
  doc.text(clientCompany.email, rightColX, yPos);
  yPos += 4;

  if (clientCompany.website) {
    doc.text(clientCompany.website, rightColX, yPos);
    yPos += 4;
  }

  yPos = Math.max(yPos, companiesStartY + 45);
  yPos += 15;

  // ============================================================================
  // SECTION 4: Line Items Table - Clean and minimal
  // ============================================================================

  // Table header line
  doc.setDrawColor(THEME.borderDark.r, THEME.borderDark.g, THEME.borderDark.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 7;

  doc.setTextColor(THEME.textPrimary.r, THEME.textPrimary.g, THEME.textPrimary.b);
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin, yPos);
  doc.text("Amount", pageWidth - margin, yPos, { align: "right" });

  yPos += 7;

  // Line under header
  doc.setDrawColor(THEME.borderLight.r, THEME.borderLight.g, THEME.borderLight.b);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Table content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(normalSize);
  doc.setTextColor(THEME.textSecondary.r, THEME.textSecondary.g, THEME.textSecondary.b);
  doc.text("Invoice Total", margin, yPos);

  const totalFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: invoice.currency,
  }).format(invoice.total);

  doc.setTextColor(THEME.textPrimary.r, THEME.textPrimary.g, THEME.textPrimary.b);
  doc.text(totalFormatted, pageWidth - margin, yPos, { align: "right" });

  yPos += 8;

  // ============================================================================
  // SECTION 5: Total Section - Bold and clean
  // ============================================================================

  // Strong line above total
  doc.setDrawColor(THEME.borderDark.r, THEME.borderDark.g, THEME.borderDark.b);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(headingSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(THEME.textPrimary.r, THEME.textPrimary.g, THEME.textPrimary.b);
  doc.text("TOTAL", margin, yPos);
  doc.text(totalFormatted, pageWidth - margin, yPos, { align: "right" });

  yPos += 3;

  // Double line under total
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos + 1.5, pageWidth - margin, yPos + 1.5);

  // ============================================================================
  // SECTION 6: Footer - Simple and understated
  // ============================================================================
  const footerY = pageHeight - 25;

  doc.setDrawColor(THEME.borderLight.r, THEME.borderLight.g, THEME.borderLight.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(smallSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(THEME.textMuted.r, THEME.textMuted.g, THEME.textMuted.b);
  doc.text("Thank you for your business.", pageWidth / 2, footerY, {
    align: "center",
  });

  return doc.output("arraybuffer");
}

