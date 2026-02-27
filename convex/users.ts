import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Gets the current authenticated user and their profile data.
 */
export const current = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return null;
        }

        // Get auth user details
        const user = await ctx.db.get(userId);
        if (!user) {
            return null;
        }

        // Get profile details
        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        // Return merged data
        return {
            ...user,
            profileId: profile?._id,
            username: profile?.username || user.name || user.email,
            avatar_url: profile?.avatar_url || user.image,
            score: profile?.score || 0,
            isAdmin: profile?.isAdmin || false,
        };
    },
});

/**
 * Updates the username for the current user's profile.
 */
export const updateUsername = mutation({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, { username: args.username });
        } else {
            await ctx.db.insert("profiles", {
                userId,
                username: args.username,
                score: 0,
                isAdmin: false,
            });
        }
    },
});

/**
 * Gets the leaderboard (users ordered by score).
 */
export const getLeaderboard = query({
    args: {},
    handler: async (ctx) => {
        const profiles = await ctx.db.query("profiles").order("desc").take(50);
        // Sort by score manually since we can't index on score directly without a custom index
        profiles.sort((a, b) => b.score - a.score);

        return Promise.all(
            profiles.map(async (profile) => {
                const user = await ctx.db.get(profile.userId);
                return {
                    id: profile.userId,
                    username: profile.username || user?.name || "Unknown",
                    avatar_url: profile.avatar_url || user?.image,
                    score: profile.score,
                };
            })
        );
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const adminProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isAdmin) throw new Error("Unauthorized");

        const users = await ctx.db.query("users").collect();
        const profiles = await ctx.db.query("profiles").collect();

        return users.map(user => {
            const profile = profiles.find(p => p.userId === user._id);
            return {
                id: user._id,
                email: user.email,
                name: user.name,
                username: profile?.username || user.name || user.email,
                avatar_url: profile?.avatar_url || user.image,
                isAdmin: profile?.isAdmin || false,
                score: profile?.score || 0,
                emailVerified: user.emailVerificationTime !== undefined,
                disabled: false, // Convex auth doesn't have a direct 'disabled' flag by default unless added to schema
            };
        });
    }
});

export const updateUserRole = mutation({
    args: { targetUserId: v.id("users"), isAdmin: v.boolean() },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const adminProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isAdmin) throw new Error("Unauthorized");

        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", args.targetUserId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, { isAdmin: args.isAdmin });
        } else {
            await ctx.db.insert("profiles", {
                userId: args.targetUserId,
                score: 0,
                isAdmin: args.isAdmin,
            });
        }
    }
});

export const deleteUser = mutation({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const adminProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!adminProfile?.isAdmin) throw new Error("Unauthorized");

        // Delete associated data (this is a simplified cascade delete)
        const profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", args.targetUserId)).first();
        if (profile) await ctx.db.delete(profile._id);

        const posts = await ctx.db.query("questions").withIndex("by_authorId", (q) => q.eq("authorId", args.targetUserId)).collect();
        for (const post of posts) await ctx.db.delete(post._id);

        const comments = await ctx.db.query("comments").withIndex("by_authorId", (q) => q.eq("authorId", args.targetUserId)).collect();
        for (const comment of comments) await ctx.db.delete(comment._id);

        const votes = await ctx.db.query("votes").withIndex("by_userId", (q) => q.eq("userId", args.targetUserId)).collect();
        for (const vote of votes) await ctx.db.delete(vote._id);

        const savedPosts = await ctx.db.query("savedPosts").withIndex("by_userId", (q) => q.eq("userId", args.targetUserId)).collect();
        for (const savedPost of savedPosts) await ctx.db.delete(savedPost._id);

        // Finally delete the user
        await ctx.db.delete(args.targetUserId);
    }
});
