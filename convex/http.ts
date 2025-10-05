// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const requireUser = async (ctx: any, req: Request) => {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  console.log("token", token);

  const userId = await ctx.runQuery(api.apiKeys.verifyApiKey, {
    apiKey: token,
  });

  console.log("userId", userId);
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

  const { invoiceNumber, clientId, currency, total, status, timestamps } =
    body ?? {};
  if (!invoiceNumber || !clientId || !currency || typeof total !== "number") {
    return new Response("Missing required fields", { status: 400 });
  }

  const { invoiceId } = await ctx.runMutation(api.invoices.createInvoice, {
    userId,
    invoiceNumber,
    clientId,
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
  const clientId = url.searchParams.get("clientId") || undefined;

  const invoices = await ctx.runQuery(api.invoices.listInvoices, {
    userId,
    limit,
    clientId: clientId as any,
  });
  return Response.json({ invoices });
});

// Duplicate last invoice for a client
const duplicateInvoice = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { clientId, invoiceNumber } = body ?? {};
  if (!clientId) {
    return new Response("Missing clientId", { status: 400 });
  }

  try {
    const result = await ctx.runMutation(api.invoices.duplicateLastInvoice, {
      userId,
      clientId,
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

  // Extract invoiceId from URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const invoiceId = pathParts[pathParts.length - 2]; // .../invoices/:id/status

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

// Create a client/company
const postClient = httpAction(async (ctx, req) => {
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

// Get clients/companies
const getClients = httpAction(async (ctx, req) => {
  const userId = await requireUser(ctx, req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const companies = await ctx.runQuery(api.companies.listCompanies, {
    userId,
  });
  return Response.json({ companies });
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
  path: "/api/invoices/:id/status",
  method: "PATCH",
  handler: changeInvoiceStatus,
});

// Client routes
router.route({ path: "/api/clients", method: "POST", handler: postClient });
router.route({ path: "/api/clients", method: "GET", handler: getClients });

export default router;
