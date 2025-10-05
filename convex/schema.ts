import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const statusValidator = v.union(
  v.literal("draft"),
  v.literal("validated"),
  v.literal("paid"),
  v.literal("cancelled")
);

export default defineSchema({
  companies: defineTable({
    name: v.string(),
    siret: v.string(),
    email: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    website: v.string(),
  }),
  invoices: defineTable({
    invoiceNumber: v.string(),
    clientId: v.id("companies"), // Reference to client company
    status: statusValidator,
    currency: v.string(),
    total: v.number(),
  }),
});
