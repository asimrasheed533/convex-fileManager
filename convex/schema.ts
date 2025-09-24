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

  invites: defineTable({
    code: v.string(),
    createdBy: v.id('users'),
    invitedUser: v.optional(v.id('users')),
    isUsed: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
    chat: v.id('chats'),
  })
    .index('by_code', ['code'])
    .index('by_chat', ['chat']),

  chats: defineTable({
    name: v.optional(v.string()),
    createdBy: v.id('users'),
    participants: v.array(
      v.object({
        userId: v.id('users'),
        status: v.union(v.literal('pending'), v.literal('accepted')),
        invitedAt: v.optional(v.number()),
        joinedAt: v.optional(v.number()),
        role: v.optional(v.string()),
      }),
    ),
    participantIds: v.array(v.id('users')),
    createdAt: v.number(),
  })
    .index('by_participantIds', ['participantIds'])
    .index('by_createdBy', ['createdBy']),

  messages: defineTable({
    chatId: v.id('chats'),
    sender: v.id('users'),
    content: v.string(),
    createdAt: v.number(),
    deliveredTo: v.array(v.id('users')),
    seenBy: v.array(v.id('users')),
    status: v.optional(v.string()),
    messageType: v.optional(v.string()),
  }).index('by_chat', ['chatId']),

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
    isPublic: v.boolean(),
    originalFile: v.optional(v.id('files')),
  })
    .index('by_folder', ['folder'])
    .index('by_user', ['user']),
});
