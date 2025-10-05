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

  const invoices = await ctx.runQuery(api.invoices.listInvoices, {
    userId,
    limit,
  });
  return Response.json({ invoices });
});

const router = httpRouter();
router.route({ path: "/api/invoices", method: "POST", handler: postInvoice });
router.route({ path: "/api/invoices", method: "GET", handler: getInvoices });

export default router;
