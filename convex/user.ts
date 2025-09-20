import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getCurrentUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user;
  },
});

export const signup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, { name, email, password }) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (existing) {
      throw new Error('User already exists with this email');
    }

    const existingUsername = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    if (existingUsername) throw new Error('Email already taken');

    await ctx.db.insert('users', {
      name,
      email,
      password: password,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = password === user.password;

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    return user._id;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    return user;
  },
});
