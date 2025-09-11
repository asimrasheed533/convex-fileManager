import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createFolder = mutation({
  args: {
    name: v.string(),
    owner: v.id("users"),
    parent: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("folders", {
      name: args.name,
      owner: args.owner,
      parent: args.parent,
      path: [],
    });
  },
});

export const getFolders = query({
  args: { owner: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("folders")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner))
      .collect();
  },
});

export const createFile = mutation({
  args: {
    name: v.string(),
    owner: v.id("users"),
    folder: v.union(v.id("folders"), v.null()),
    storageId: v.id("_storage"),
    size: v.number(),
    mimeType: v.string(),
    isPublic: v.boolean(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", args);
  },
});
export const getFiles = query({
  args: { folder: v.union(v.id("folders"), v.null()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_folder", (q) => q.eq("folder", args.folder))
      .collect();
  },
});

export const deleteFile = mutation({
  args: {
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Delete the file from storage if it has a storageId
    if (file.storageId) {
      await ctx.storage.delete(file.storageId);
    }
    
    // Delete the file record from the database
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
