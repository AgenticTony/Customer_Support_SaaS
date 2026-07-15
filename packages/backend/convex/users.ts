import { mutation, query } from "./_generated/server";

export const getMany = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("users").collect(),
});

export const add = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Custom claim added to the Clerk `convex` JWT template: `"org_id": "{{org.id}}"`.
    // It is untyped on the Convex side, so we cast. Every org-scoped record will
    // store and be compared against this id — this check is the multi-tenant gate.
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new Error("Missing organization");
    }

    await ctx.db.insert("users", { name: "Antonio" });
  },
});
