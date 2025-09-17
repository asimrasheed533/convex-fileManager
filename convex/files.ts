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
    const folders = await ctx.db
      .query('folders')
      .withIndex('by_parent', (q) => q.eq('parent', args.folder))
      .collect();

    const files = await ctx.db
      .query('files')
      .withIndex('by_folder', (q) => q.eq('folder', args.folder))
      .collect();

    return [
      ...folders.map((folder) => ({
        ...folder,
        type: 'folder' as const,
      })),
      ...files.map((file) => ({
        ...file,
        type: 'file' as const,
      })),
    ];
  },
});

export const getFile = query({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new Error('File not found');
    }
    const fileUrl = await ctx.storage.getUrl(file.storageId);

    return {
      ...file,
      fileUrl,
    };
  },
});

export const editFile = mutation({
  args: {
    fileId: v.id('files'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error('File not found');
    }
    await ctx.db.patch(args.fileId, { name: args.name });
    const updatedFile = await ctx.db.get(args.fileId);
    return updatedFile;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error('File not found');
    }
    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.fileId);
    return true;
  },
});
