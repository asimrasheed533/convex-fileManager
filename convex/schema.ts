import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_email', ['email']),
  folders: defineTable({
    name: v.string(),
    owner: v.string(),
    parent: v.union(v.id('folders'), v.null()),
    path: v.array(v.string()),
  }).index('by_owner', ['owner', 'parent']),
  files: defineTable({
    name: v.string(),
    owner: v.string(),
    folder: v.union(v.id('folders'), v.null()),
    storageId: v.id('_storage'),
    size: v.number(),
    mimeType: v.string(),
    isPublic: v.boolean(),
    type: v.string(),
  })
    .index('by_folder', ['folder'])
    .index('by_owner', ['owner'])
    .index('by_name_owner', ['name', 'owner']),
});
