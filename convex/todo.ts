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

export const updateTodo = mutation({
  args: { id: v.id("todo"), task: v.string() },
  handler: async (ctx, { id, task }) => {
    await ctx.db.patch(id, { task });
  },
});

export const toggleTodo = mutation({
  args: { id: v.id("todo"), completed: v.boolean() },
  handler: async (ctx, { id, completed }) => {
    await ctx.db.patch(id, { completed });
  },
});

// export const deleteTodo = mutation{(
//     args: { id: v.id("todo") },
//     handler: async(ctx, {id})=>{
//         await ctx.db.delete(id)
//     }

// )}
