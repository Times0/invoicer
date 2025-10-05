import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { statusValidator } from "./schema";

// Fetch all invoices
export const list = query(async ({ db }) => {
  return await db.query("invoices").collect();
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
