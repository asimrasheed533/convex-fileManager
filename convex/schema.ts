import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_email', ['email']),

  folders: defineTable({
    name: v.string(),
    user: v.id('users'),
    isPublic: v.boolean(),
    parent: v.union(v.id('folders'), v.null()),
  })
    .index('by_user', ['user'])
    .index('by_parent', ['parent']),

  files: defineTable({
    name: v.string(),
    user: v.id('users'),
    folder: v.union(v.id('folders'), v.null()),
    storageId: v.id('_storage'),
    size: v.number(),
    mimeType: v.string(),
    // version: v.number(),
    isPublic: v.boolean(),
    originalFile: v.optional(v.id('files')),
  })
    .index('by_folder', ['folder'])
    .index('by_user', ['user']),
});
