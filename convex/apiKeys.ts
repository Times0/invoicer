// convex/lib/apiAuth.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { sha256 } from "./lib/crypto"; // implement with WebCrypto or a small util

export const verifyApiKey = query({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    const keyHash = await sha256(apiKey);
    const rec = await ctx.db
      .query("apiKeys")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash))
      .first();
    if (!rec || rec.revoked) return null;
    return rec.userId as string;
  },
});

export const create = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    // Check if an API key already exists for this user
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    // Generate the raw API key (this is what the user will see and use)
    const rawApiKey = crypto.randomUUID();
    // Hash it for storage
    const keyHash = await sha256(rawApiKey);

    if (existing) {
      // Replace the existing key (update)
      await ctx.db.patch(existing._id, {
        keyHash,
        revoked: false,
      });
    } else {
      // Insert a new key
      await ctx.db.insert("apiKeys", {
        userId: identity.subject,
        keyHash,
        revoked: false,
      });
    }
    // Return the raw key (not the hash) to the user
    return rawApiKey;
  },
});
