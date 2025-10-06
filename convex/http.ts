// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { generateInvoicePDF } from "./pdfGenerator";

const requireUser = async (ctx: any, req: Request) => {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const userId = await ctx.runQuery(api.apiKeys.verifyApiKey, {
    apiKey: token,
  });

  if (!userId) return null;
  return userId;
};

const postInvoice = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { invoiceNumber, companyId, currency, total, status, timestamps } =
    body ?? {};
  if (!invoiceNumber || !companyId || !currency || typeof total !== "number") {
    return new Response("Missing required fields", { status: 400 });
  }

  const { invoiceId } = await ctx.runMutation(api.invoices.createInvoice, {
    userId,
    invoiceNumber,
    companyId,
    currency,
    total,
    status,
    timestamps,
  });

  return Response.json({ invoiceId });
});

const getInvoices = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const companyId = url.searchParams.get("companyId") || undefined;

  const invoices = await ctx.runQuery(api.invoices.listInvoices, {
    userId,
    limit,
    companyId: companyId as any,
  });
  return Response.json({ invoices });
});

// Duplicate last invoice for a company
const duplicateInvoice = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { companyId, invoiceNumber } = body ?? {};
  if (!companyId) {
    return new Response("Missing companyId", { status: 400 });
  }

  try {
    const result = await ctx.runMutation(api.invoices.duplicateLastInvoice, {
      userId,
      companyId,
      invoiceNumber,
    });
    return Response.json(result);
  } catch (error: any) {
    return new Response(error.message, { status: 400 });
  }
});

// Change invoice status
const changeInvoiceStatus = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // Extract invoiceId from query params
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("id");

  if (!invoiceId) {
    return new Response("Missing invoiceId", { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { status } = body ?? {};
  if (!status) {
    return new Response("Missing status", { status: 400 });
  }

  if (!["draft", "finalized", "paid", "cancelled"].includes(status)) {
    return new Response("Invalid status", { status: 400 });
  }

  try {
    const result = await ctx.runMutation(api.invoices.changeStatus, {
      userId,
      invoiceId: invoiceId as any,
      status,
    });
    return Response.json(result);
  } catch (error: any) {
    return new Response(error.message, { status: 400 });
  }
});

// Create a company
const postCompany = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { name, siret, email, address, city, zip, website, isMyCompany } =
    body ?? {};
  if (!name || !siret || !email || !address || !city || !zip || !website) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { companyId } = await ctx.runMutation(api.companies.createCompany, {
    userId,
    name,
    siret,
    email,
    address,
    city,
    zip,
    website,
    isMyCompany,
  });

  return Response.json({ companyId });
});

// Get companies
const getCompanies = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  const companies = await ctx.runQuery(api.companies.listCompanies, {
    userId,
    companyId: companyId as any,
  });
  return Response.json({ companies });
});

const getInvoicePDF = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // Extract invoiceId from query params
  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("id");

  if (!invoiceId) {
    return new Response("Missing invoiceId", { status: 400 });
  }

  try {
    // Fetch the invoice
    const invoice = await ctx.runQuery(api.invoices.get, {
      id: invoiceId as any,
    });

    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    // Verify the invoice belongs to the user
    if (invoice.userId !== userId) {
      return new Response("Unauthorized", { status: 403 });
    }

    // Fetch the company (the invoice recipient)
    const company = await ctx.runQuery(api.companies.get, {
      id: invoice.companyId,
    });

    if (!company) {
      return new Response("Company not found", { status: 404 });
    }

    // Fetch "my company" (the invoice issuer)
    const companies = await ctx.runQuery(api.companies.listCompanies, {
      userId,
    });

    console.log(companies);
    const myCompany = companies.find((c) => c.isMyCompany);

    console.log(myCompany);

    // Generate PDF
    const pdfBuffer = generateInvoicePDF({
      invoice: {
        _creationTime: invoice._creationTime,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        currency: invoice.currency,
        total: invoice.total,
      },
      clientCompany: {
        name: company.name,
        siret: company.siret,
        email: company.email,
        address: company.address,
        city: company.city,
        zip: company.zip,
        website: company.website,
      },
      myCompany: myCompany
        ? {
            name: myCompany.name,
            siret: myCompany.siret,
            email: myCompany.email,
            address: myCompany.address,
            city: myCompany.city,
            zip: myCompany.zip,
            website: myCompany.website,
          }
        : undefined,
    });

    // Return PDF as downloadable file
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return new Response(error.message || "Error generating PDF", {
      status: 500,
    });
  }
});

const router = httpRouter();

// Invoice routes
router.route({ path: "/api/invoices", method: "POST", handler: postInvoice });
router.route({ path: "/api/invoices", method: "GET", handler: getInvoices });
router.route({
  path: "/api/invoices/duplicate",
  method: "POST",
  handler: duplicateInvoice,
});
router.route({
  path: "/api/invoices/status",
  method: "PATCH",
  handler: changeInvoiceStatus,
});
router.route({
  path: "/api/invoices/pdf",
  method: "GET",
  handler: getInvoicePDF,
});

// Company routes
router.route({ path: "/api/companies", method: "POST", handler: postCompany });
router.route({ path: "/api/companies", method: "GET", handler: getCompanies });

export default router;
