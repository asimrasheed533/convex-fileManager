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
