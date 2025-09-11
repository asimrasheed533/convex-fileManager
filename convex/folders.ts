import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createFolder = mutation({
  args: {
    name: v.string(),
    owner: v.id("users"),
    parent: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("folders", {
      name: args.name,
      owner: args.owner,
      parent: args.parent,
      path: [],
    });
    return id;
  },
});

export const listFolders = query({
  args: {
    owner: v.id("users"),
    parent: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_owner", (q) =>
        q.eq("owner", args.owner).eq("parent", args.parent)
      )
      .collect();
  },
});
