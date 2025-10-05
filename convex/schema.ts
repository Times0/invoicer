import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const statusValidator = v.union(
  v.literal("draft"),
  v.literal("finalized"),
  v.literal("paid"),
  v.literal("cancelled")
);

export default defineSchema({
  companies: defineTable({
    userId: v.string(),
    name: v.string(),
    siret: v.string(),
    email: v.string(),
    address: v.string(),
    city: v.string(),
    zip: v.string(),
    website: v.string(),
    isMyCompany: v.optional(v.boolean()),
  }),

  invoices: defineTable({
    userId: v.string(),
    invoiceNumber: v.string(),
    clientId: v.id("companies"),
    status: statusValidator,
    currency: v.string(),
    total: v.number(),
    finalizedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  }),
});
