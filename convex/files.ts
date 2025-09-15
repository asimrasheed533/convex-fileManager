import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const uploadfile = mutation({
  args: {
    name: v.string(),
    user: v.id('users'),
    folder: v.union(v.id('folders'), v.null()),
    storageId: v.id('_storage'),
    size: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.insert('files', {
      ...args,
      isPublic: false,
    });

    return file;
  },
});

export const getFiles = query({
  args: { folder: v.union(v.id('folders'), v.null()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('files')
      .withIndex('by_folder', (q) => q.eq('folder', args.folder))
      .collect();
  },
});
