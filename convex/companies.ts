import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fetch all companies
export const list = query(async ({ db }) => {
  return await db.query("companies").collect();
});

// Get "my company" (the company marked as the invoice issuer)
export const getMyCompany = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await db
    .query("companies")
    .filter((q) =>
      q.and(
        q.eq(q.field("userId"), identity.subject),
        q.eq(q.field("isMyCompany"), true)
      )
    )
    .first();
});

// Get a single company by ID
export const get = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add a new company
export const add = mutation({
  args: {
    name: v.string(),
    siret: v.string(),
    email: v.string(),
    address: v.string(),
    city: v.string(),
    zip: v.string(),
    website: v.string(),
    isMyCompany: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // If marking this as "my company", unset it on all other companies for this user
    if (args.isMyCompany) {
      const existingCompanies = await ctx.db
        .query("companies")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), identity.subject),
            q.eq(q.field("isMyCompany"), true)
          )
        )
        .collect();

      for (const company of existingCompanies) {
        await ctx.db.patch(company._id, { isMyCompany: false });
      }
    }

    return await ctx.db.insert("companies", {
      userId: identity?.subject,
      name: args.name,
      siret: args.siret,
      email: args.email,
      address: args.address,
      city: args.city,
      zip: args.zip,
      website: args.website,
      isMyCompany: args.isMyCompany,
    });
  },
});

// Edit/update a company
export const edit = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    siret: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    zip: v.optional(v.string()),
    website: v.optional(v.string()),
    isMyCompany: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const company = await ctx.db.get(args.id);
    if (!company) {
      throw new Error("Company not found");
    }
    if (company.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // If marking this as "my company", unset it on all other companies for this user
    if (args.isMyCompany === true) {
      const existingCompanies = await ctx.db
        .query("companies")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), identity.subject),
            q.eq(q.field("isMyCompany"), true),
            q.neq(q.field("_id"), args.id)
          )
        )
        .collect();

      for (const otherCompany of existingCompanies) {
        await ctx.db.patch(otherCompany._id, { isMyCompany: false });
      }
    }

    const { id, ...fields } = args;
    const updateFields: Record<string, string | boolean | undefined> = {};
    for (const key in fields) {
      if (fields[key as keyof typeof fields] !== undefined) {
        updateFields[key] = fields[key as keyof typeof fields];
      }
    }
    await ctx.db.patch(id, updateFields);
  },
});

// Remove a company
export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const company = await ctx.db.get(args.id);
    if (!company) {
      throw new Error("Company not found");
    }
    if (company.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});
