import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTodo = query({
  handler: async (ctx) => {
    const todos = await ctx.db.query("todo").collect();
    return todos.reverse();
  },
});

export const createTodo = mutation({
  args: {
    task: v.string(),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("todo", {
      task: args.task,
      completed: args.completed ?? false,
      createdAt: new Date().toISOString(),
    });
  },
});
