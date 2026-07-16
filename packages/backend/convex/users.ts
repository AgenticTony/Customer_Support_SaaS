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

    // Require an active organization. The `org_id` claim comes from the Clerk
    // `convex` JWT template (`"org_id": "{{org.id}}"`). Convex surfaces custom
    // claims under their original snake_case key (not camelCased like its known
    // standard claims), so we read `identity.org_id`. It is untyped on the
    // Convex side, hence the cast. This gates writes; later chapters scope the
    // stored records and reads by this id.
    const orgId = identity.org_id as string;
    if (!orgId) {
      throw new Error("Missing organization");
    }

    await ctx.db.insert("users", { name: "Antonio" });
  },
});
