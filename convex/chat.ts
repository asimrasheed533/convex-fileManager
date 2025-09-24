import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createGroup = mutation({
  args: {
    name: v.optional(v.string()),
    createBy: v.id('users'),
    initialParticipants: v.optional(v.array(v.id('users'))),
  },
  handler: async (ctx, args) => {
    const { name, createBy, initialParticipants } = args;

    if (name) {
      const existing = await ctx.db
        .query('chats')
        .filter((q) => q.eq(q.field('name'), name))
        .unique();

      if (existing) {
        throw new Error('Group name must be unique.');
      }
    }

    const participantsList = [
      {
        userId: createBy,
        status: 'accepted' as const,
        invitedAt: Date.now(),
        joinedAt: Date.now(),
        role: 'admin',
      },

      ...(initialParticipants || []).map((userId) => ({
        userId,
        status: 'pending' as const,
        invitedAt: Date.now(),
        role: 'member',
      })),
    ];

    const chatId = await ctx.db.insert('chats', {
      name,
      createdBy: createBy,
      participants: participantsList,
      participantIds: participantsList.map((p) => p.userId),
      createdAt: Date.now(),
    });

    return chatId;
  },
});

export const getUserGroups = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('chats')
      .filter((q) => q.eq(q.field('participantIds'), [userId]))
      .collect();
  },
});
