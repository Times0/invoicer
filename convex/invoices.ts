import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { statusValidator } from "./schema";

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
    clientId: v.id("companies"),
    currency: v.string(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.insert("invoices", {
      userId: identity?.subject,
      invoiceNumber: args.invoiceNumber,
      clientId: args.clientId,
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
    clientId: v.optional(v.id("companies")),
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
    clientId: v.id("companies"),
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
    const { userId, clientId, currency, total, finalize, ...rest } = args;

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
      clientId,
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
    clientId: v.id("companies"),
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
      .withIndex("by_user_invoiceNumber", (q) =>
        q.eq("userId", args.userId).eq("invoiceNumber", args.invoiceNumber)
      )
      .first();
    if (existing)
      throw new Error("Invoice number already exists for this user.");

    const invoiceId = await ctx.db.insert("invoices", {
      userId: args.userId,
      invoiceNumber: args.invoiceNumber,
      clientId: args.clientId,
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
    clientId: v.optional(v.id("companies")),
  },
  handler: async (ctx, { userId, limit, clientId }) => {
    let query = ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (clientId) {
      query = query.filter((q) => q.eq(q.field("clientId"), clientId));
    }

    const res = await query.take(limit ?? 50);
    return res;
  },
});

// Duplicate the last invoice for a specific client
export const duplicateLastInvoice = mutation({
  args: {
    userId: v.string(),
    clientId: v.id("companies"),
    invoiceNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the last invoice for this client
    const lastInvoice = await ctx.db
      .query("invoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .order("desc")
      .first();

    if (!lastInvoice) {
      throw new Error("No previous invoice found for this client");
    }

    // Generate new invoice number if not provided
    const invoiceNumber = args.invoiceNumber || `INV-${Date.now()}`;

    // Create a new invoice with the same details but as draft
    const newInvoiceId = await ctx.db.insert("invoices", {
      userId: args.userId,
      invoiceNumber,
      clientId: args.clientId,
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
