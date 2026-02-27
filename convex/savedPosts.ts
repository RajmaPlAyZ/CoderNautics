import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const savePost = mutation({
    args: { questionId: v.id("questions") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const savedPostId = await ctx.db.insert("savedPosts", {
            userId,
            questionId: args.questionId,
        });

        return savedPostId;
    }
});

export const unsavePost = mutation({
    args: { savedPostId: v.id("savedPosts") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const savedPost = await ctx.db.get(args.savedPostId);
        if (!savedPost || savedPost.userId !== userId) throw new Error("Unauthorized");

        await ctx.db.delete(args.savedPostId);
    }
});

export const getSavedPosts = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const savedPosts = await ctx.db
            .query("savedPosts")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        return savedPosts.map(post => ({
            ...post,
            id: post._id,
            savedAt: new Date(post._creationTime).toISOString(),
        }));
    }
});

export const isPostSaved = query({
    args: { questionId: v.id("questions") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return false;

        const savedPost = await ctx.db
            .query("savedPosts")
            .withIndex("by_user_and_post", (q) => q.eq("userId", userId).eq("questionId", args.questionId))
            .first();

        return !!savedPost;
    }
});

export const getSavedPostsWithData = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const savedPosts = await ctx.db
            .query("savedPosts")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        const postsWithData = await Promise.all(
            savedPosts.map(async (savedPost) => {
                const post = await ctx.db.get(savedPost.questionId);
                if (!post) return null;

                const user = await ctx.db.get(post.authorId);
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
                    .first();

                return {
                    ...post,
                    id: post._id,
                    savedPostId: savedPost._id, // To allow unsaving
                    date: new Date(post._creationTime).toISOString(),
                    user: {
                        username: profile?.username || user?.name || user?.email,
                        avatar_url: profile?.avatar_url || user?.image || null,
                    }
                };
            })
        );

        return postsWithData.filter(p => p !== null);
    }
});
