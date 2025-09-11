import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const signup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, { name, email, password }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("User already exists with this email");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await ctx.db.insert("users", {
      name,
      email,
      passwordHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, message: "User registered successfully" };
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  },
});
