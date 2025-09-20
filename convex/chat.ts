import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createGroup = mutation({
  args: {
    name: v.optional(v.string()),
    createBy: v.id('users'),
    initialParticipants: v.optional(v.array(v.id('users'))),
  },
  handler: async (ctx, args) => {
    const { name, createBy, initialParticipants } = args;
    const participants = [...(initialParticipants || []), createBy].filter(Boolean);

    const chatId = await ctx.db.insert('chats', {
      name,
      participants,
      createdAt: Date.now(),
    });
    return chatId;
  },
});
