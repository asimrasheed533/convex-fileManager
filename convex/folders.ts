import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createFolder = mutation({
  args: {
    name: v.string(),
    userId: v.id('users'),
    parentFolderId: v.union(v.id('folders'), v.null()),
  },
  handler: async (ctx, { name, userId, parentFolderId }) => {
    await ctx.db.insert('folders', {
      name,
      user: userId,
      isPublic: false,
      parent: parentFolderId,
    });
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id('folders'),
  },
  handler: async (ctx, { folderId }) => {
    const subFolders = await ctx.db
      .query('folders')
      .withIndex('by_parent', (q) => q.eq('parent', folderId))
      .collect();

    if (subFolders.length > 0) {
      throw new Error('Cannot delete: Folder contains subfolders');
    }
    const files = await ctx.db
      .query('files')
      .withIndex('by_folder', (q) => q.eq('folder', folderId))
      .collect();

    if (files.length > 0) {
      throw new Error('Cannot delete: Folder contains files');
    }
    await ctx.db.delete(folderId);
  },
});
