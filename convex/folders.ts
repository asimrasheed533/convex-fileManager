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

export const deleteFolder = mutation({
  args: {
    id: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const folder = await ctx.db.get(args.id);
    if (!folder) {
      throw new Error("Folder not found");
    }

    // Get all files in this folder
    const files = await ctx.db
      .query("files")
      .withIndex("by_folder", (q) => q.eq("folder", args.id))
      .collect();

    // Delete all files in this folder
    for (const file of files) {
      // Delete file from storage if it has a storageId
      if (file.storageId) {
        await ctx.storage.delete(file.storageId);
      }

      // Delete file record from database
      await ctx.db.delete(file._id);
    }

    // Get all subfolders
    const subfolders = await ctx.db
      .query("folders")
      .withIndex("by_owner", (q) =>
        q.eq("owner", folder.owner).eq("parent", args.id)
      )
      .collect();

    // Recursively delete all subfolders
    // for (const subfolder of subfolders) {
    //   await ctx.runMutation(deleteFolder, { id: subfolder._id });
    // }

    // Finally delete the folder itself
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
