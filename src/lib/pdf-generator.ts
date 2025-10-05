import { jsPDF } from "jspdf";
import type { Doc } from "../../convex/_generated/dataModel";
import { format } from "date-fns";

interface GenerateInvoicePDFOptions {
  invoice: Doc<"invoices">;
  client: Doc<"companies">;
  myCompany?: Doc<"companies">;
}

export function generateInvoicePDF({
  invoice,
  client,
  myCompany,
}: GenerateInvoicePDFOptions): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Set font sizes
  const titleSize = 24;
  const headingSize = 16;
  const normalSize = 11;
  const smallSize = 9;

  let yPos = 20;

  // Title
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });

  yPos += 15;

  // Invoice Number and Status
  doc.setFontSize(headingSize);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoiceNumber, 20, yPos);

  // Status badge (right aligned)
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "normal");
  const statusText = invoice.status.toUpperCase();
  const statusWidth = doc.getTextWidth(statusText);
  doc.setTextColor(100, 100, 100);
  doc.text(statusText, pageWidth - 20 - statusWidth, yPos);
  doc.setTextColor(0, 0, 0);

  yPos += 15;

  // Invoice Details Section
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", 20, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(smallSize);
  doc.text(
    `Date: ${format(new Date(invoice._creationTime), "MMMM dd, yyyy")}`,
    20,
    yPos
  );
  yPos += 5;
  doc.text(`Currency: ${invoice.currency}`, 20, yPos);
  yPos += 10;

  // My Company Information Section (From)
  if (myCompany) {
    doc.setFontSize(normalSize);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 20, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(smallSize);
    doc.text(myCompany.name, 20, yPos);
    yPos += 5;

    if (myCompany.siret) {
      doc.text(`SIRET: ${myCompany.siret}`, 20, yPos);
      yPos += 5;
    }

    doc.text(myCompany.address, 20, yPos);
    yPos += 5;
    doc.text(`${myCompany.city}, ${myCompany.zip}`, 20, yPos);
    yPos += 5;
    doc.text(myCompany.email, 20, yPos);
    yPos += 5;

    if (myCompany.website) {
      doc.text(myCompany.website, 20, yPos);
      yPos += 5;
    }

    yPos += 10;
  }

  // Client Information Section
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(smallSize);
  doc.text(client.name, 20, yPos);
  yPos += 5;

  if (client.siret) {
    doc.text(`SIRET: ${client.siret}`, 20, yPos);
    yPos += 5;
  }

  doc.text(client.address, 20, yPos);
  yPos += 5;
  doc.text(`${client.city}, ${client.zip}`, 20, yPos);
  yPos += 5;
  doc.text(client.email, 20, yPos);
  yPos += 5;

  if (client.website) {
    doc.text(client.website, 20, yPos);
    yPos += 5;
  }

  yPos += 10;

  // Line Items Header (simplified - in real app you'd have line items)
  doc.setFontSize(normalSize);
  doc.setFont("helvetica", "bold");
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 7;

  doc.text("Description", 20, yPos);
  doc.text("Amount", pageWidth - 60, yPos, { align: "right" });
  yPos += 7;

  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Line Items (placeholder)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(smallSize);
  doc.text("Invoice Total", 20, yPos);
  const totalFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: invoice.currency,
  }).format(invoice.total);
  doc.text(totalFormatted, pageWidth - 60, yPos, { align: "right" });
  yPos += 10;

  // Total Section
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 7;

  doc.setFontSize(headingSize);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", 20, yPos);
  doc.text(totalFormatted, pageWidth - 60, yPos, { align: "right" });

  // Footer
  doc.setFontSize(smallSize);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.text("Thank you for your business!", pageWidth / 2, footerY, {
    align: "center",
  });

  return doc;
}

export function downloadInvoicePDF(options: GenerateInvoicePDFOptions) {
  const doc = generateInvoicePDF(options);
  doc.save(`invoice-${options.invoice.invoiceNumber}.pdf`);
}

export function generateInvoicePDFUrl(
  options: GenerateInvoicePDFOptions
): string {
  const doc = generateInvoicePDF(options);
  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
}

export function openInvoicePDFInNewTab(
  options: GenerateInvoicePDFOptions
): void {
  const url = generateInvoicePDFUrl(options);
  window.open(url, "_blank");
}
