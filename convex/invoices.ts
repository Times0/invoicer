import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { statusValidator } from "./schema";
import { generateInvoicePDF } from "./pdfGenerator";
import { api } from "./_generated/api";

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// Get a single invoice by ID
export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add a new invoice
export const add = mutation({
  args: {
    invoiceNumber: v.string(),
    companyId: v.id("companies"),
    currency: v.string(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.insert("invoices", {
      userId: identity.subject,
      companyId: args.companyId,
      invoiceNumber: args.invoiceNumber,
      status: "draft",
      currency: args.currency,
      total: args.total,
    });
  },
});

// Edit/update an invoice
export const edit = mutation({
  args: {
    id: v.id("invoices"),
    invoiceNumber: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    status: v.optional(statusValidator),
    currency: v.optional(v.string()),
    total: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const invoice = await ctx.db.get(args.id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    if (invoice.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    const { id, ...fields } = args;
    // Filter out undefined fields
    const updateFields: Record<string, any> = {};
    for (const key in fields) {
      const value = fields[key as keyof typeof fields];
      if (value !== undefined) {
        updateFields[key] = value;
      }
    }
    await ctx.db.patch(id, updateFields);
  },
});

// Update invoice status
export const updateStatus = mutation({
  args: {
    id: v.id("invoices"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const finalize = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      finalizedAt: Date.now(),
      status: "finalized",
    });
  },
});

export const cancel = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      cancelledAt: Date.now(),
      status: "cancelled",
    });
  },
});

export const pay = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { paidAt: Date.now(), status: "paid" });
  },
});

// Remove an invoice
export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Create invoice (for n8n integration - accepts userId directly)
export const create = mutation({
  args: {
    userId: v.string(),
    companyId: v.id("companies"),
    currency: v.string(),
    total: v.number(),
    status: v.optional(statusValidator),
    invoiceNumber: v.optional(v.string()),
    finalize: v.optional(v.boolean()),
    finalizedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, companyId, currency, total, finalize, ...rest } = args;

    // Generate invoice number if not provided
    const invoiceNumber = rest.invoiceNumber || `INV-${Date.now()}`;

    // Determine status
    let status = rest.status || "draft";
    let finalizedAt = rest.finalizedAt;

    if (finalize && status === "draft") {
      status = "finalized";
      finalizedAt = Date.now();
    }

    const invoiceId = await ctx.db.insert("invoices", {
      userId,
      companyId,
      invoiceNumber,
      currency,
      total,
      status,
      finalizedAt,
      paidAt: rest.paidAt,
      cancelledAt: rest.cancelledAt,
    });

    return { id: invoiceId, invoiceNumber };
  },
});

export const createInvoice = mutation({
  args: {
    userId: v.string(),
    invoiceNumber: v.string(),
    companyId: v.id("companies"),
    currency: v.string(),
    total: v.number(),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("finalized"),
        v.literal("paid"),
        v.literal("cancelled")
      )
    ),
    timestamps: v.optional(
      v.object({
        finalizedAt: v.optional(v.number()),
        paidAt: v.optional(v.number()),
        cancelledAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const status = args.status ?? "draft";

    // Optional: ensure invoice numbers are unique per user
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_invoiceNumber", (q) =>
        q.eq("invoiceNumber", args.invoiceNumber)
      )
      .first();
    if (existing)
      throw new Error("Invoice number already exists for this user.");

    const invoiceId = await ctx.db.insert("invoices", {
      userId: args.userId,
      companyId: args.companyId,
      invoiceNumber: args.invoiceNumber,
      status,
      currency: args.currency,
      total: args.total,
      finalizedAt: args.timestamps?.finalizedAt,
      paidAt: args.timestamps?.paidAt,
      cancelledAt: args.timestamps?.cancelledAt,
    });
    return { invoiceId };
  },
});

export const listInvoices = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    companyId: v.optional(v.id("companies")),
  },
  handler: async (ctx, { userId, limit, companyId }) => {
    let query = ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (companyId) {
      query = query.filter((q) => q.eq(q.field("companyId"), companyId));
    }

    const res = await query.take(limit ?? 50);
    return res;
  },
});

// Duplicate the last invoice for a specific company
export const duplicateLastInvoice = mutation({
  args: {
    userId: v.string(),
    companyId: v.id("companies"),
    invoiceNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the last invoice for this company
    const lastInvoice = await ctx.db
      .query("invoices")
      .withIndex("by_user_company", (q) =>
        q.eq("userId", args.userId).eq("companyId", args.companyId)
      )
      .order("desc")
      .first();
    if (!lastInvoice) {
      throw new Error("No previous invoice found for this company");
    }

    // Generate new invoice number if not provided
    const invoiceNumber = args.invoiceNumber || `INV-${Date.now()}`;

    // Create a new invoice with the same details but as draft
    const newInvoiceId = await ctx.db.insert("invoices", {
      userId: args.userId,
      companyId: args.companyId,
      invoiceNumber,
      currency: lastInvoice.currency,
      total: lastInvoice.total,
      status: "draft",
    });

    return { invoiceId: newInvoiceId, invoiceNumber };
  },
});

// Change invoice status (for n8n integration)
export const changeStatus = mutation({
  args: {
    userId: v.string(),
    invoiceId: v.id("invoices"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    // Verify the invoice belongs to the user
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    if (invoice.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    const updates: any = { status: args.status };

    // Set the appropriate timestamp based on status
    switch (args.status) {
      case "finalized":
        updates.finalizedAt = Date.now();
        break;
      case "paid":
        updates.paidAt = Date.now();
        break;
      case "cancelled":
        updates.cancelledAt = Date.now();
        break;
    }

    await ctx.db.patch(args.invoiceId, updates);
    return { success: true };
  },
});

// Generate PDF for an invoice (for authenticated users in the frontend)
export const generatePDF = action({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Fetch the invoice
    const invoice = await ctx.runQuery(api.invoices.get, {
      id: args.invoiceId,
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify the invoice belongs to the user
    if (invoice.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Fetch the company
    const company = await ctx.runQuery(api.companies.get, {
      id: invoice.companyId,
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // Fetch "my company" (the invoice issuer)
    const myCompany = await ctx.runQuery(api.companies.getMyCompany);

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

    return pdfBuffer;
  },
});
