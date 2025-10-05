// convex/schema.ts
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
  }).index("by_user", ["userId"]),

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
  })
    .index("by_user", ["userId"])
    .index("by_user_invoiceNumber", ["userId", "invoiceNumber"]),

  apiKeys: defineTable({
    userId: v.string(),
    keyHash: v.string(),
    revoked: v.optional(v.boolean()),
  })
    .index("by_keyHash", ["keyHash"])
    .index("by_userId", ["userId"]),
});
