import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { paginationOptsValidator } from "convex/server";

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db.query("questions").order("desc").collect();

        return Promise.all(
            posts.map(async (post) => {
                const user = await ctx.db.get(post.authorId);
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
                    .first();

                return {
                    ...post,
                    id: post._id,
                    date: new Date(post._creationTime).toISOString(),
                    user: {
                        username: profile?.username || user?.name || user?.email,
                        avatar_url: profile?.avatar_url || user?.image || null,
                    }
                };
            })
        );
    },
});

export const getFilteredPosts = query({
    args: { filter: v.string() },
    handler: async (ctx, args) => {
        let posts;
        if (args.filter === "Active") {
            posts = await ctx.db.query("questions").withIndex("by_active", (q) => q.eq("active", true)).order("desc").collect();
        } else if (args.filter === "Doubts") {
            posts = await ctx.db.query("questions").withIndex("by_type", (q) => q.eq("type", "doubt")).order("desc").collect();
        } else {
            posts = await ctx.db.query("questions").order("desc").collect();
        }

        let filteredPosts = posts;
        if (args.filter === "Unanswered") {
            filteredPosts = posts.filter(p => !p.answer || p.answer.trim() === "");
        }

        return Promise.all(
            filteredPosts.map(async (post) => {
                const user = await ctx.db.get(post.authorId);
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
                    .first();

                return {
                    ...post,
                    id: post._id,
                    date: new Date(post._creationTime).toISOString(),
                    user: {
                        username: profile?.username || user?.name || user?.email,
                        avatar_url: profile?.avatar_url || user?.image || null,
                    }
                };
            })
        );
    }
});

export const getById = query({
    args: { id: v.id("questions") },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.id);
        if (!post) return null;

        const user = await ctx.db.get(post.authorId);
        const profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
            .first();

        return {
            ...post,
            id: post._id,
            date: new Date(post._creationTime).toISOString(),
            user: {
                username: profile?.username || user?.name || user?.email,
                avatar_url: profile?.avatar_url || user?.image || null,
            }
        };
    }
});

export const getByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const posts = await ctx.db
            .query("questions")
            .withIndex("by_authorId", (q) => q.eq("authorId", args.userId))
            .order("desc")
            .collect();

        return Promise.all(
            posts.map(async (post) => {
                const user = await ctx.db.get(post.authorId);
                const profile = await ctx.db
                    .query("profiles")
                    .withIndex("by_userId", (q) => q.eq("userId", post.authorId))
                    .first();

                return {
                    ...post,
                    id: post._id,
                    date: new Date(post._creationTime).toISOString(),
                    user: {
                        username: profile?.username || user?.name || user?.email,
                        avatar_url: profile?.avatar_url || user?.image || null,
                    }
                };
            })
        );
    }
});

export const addPost = mutation({
    args: {
        title: v.string(),
        code: v.optional(v.string()),
        answer: v.optional(v.string()),
        tags: v.optional(v.array(v.string()))
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const postId = await ctx.db.insert("questions", {
            authorId: userId,
            title: args.title,
            code: args.code,
            answer: args.answer,
            tags: args.tags || [],
            votes: 0,
            downvotes: 0,
            active: true,
            type: "post",
        });

        // Award points
        let profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
        if (profile) {
            await ctx.db.patch(profile._id, { score: profile.score + 10 });
        }

        return postId;
    }
});

export const addDoubt = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        tags: v.optional(v.array(v.string()))
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const postId = await ctx.db.insert("questions", {
            authorId: userId,
            title: args.title,
            answer: args.description, // Dubouts store description in answer
            tags: args.tags || [],
            votes: 0,
            downvotes: 0,
            active: true,
            type: "doubt",
        });

        // Award points
        let profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
        if (profile) {
            await ctx.db.patch(profile._id, { score: profile.score + 10 });
        }

        return postId;
    }
});

export const deletePost = mutation({
    args: { id: v.id("questions") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");
        if (post.authorId !== userId) throw new Error("Unauthorized");

        // Also delete associated comments, votes, savedPosts (Cascade delete equivalent)
        const comments = await ctx.db.query("comments").withIndex("by_questionId", q => q.eq("questionId", args.id)).collect();
        for (const comment of comments) await ctx.db.delete(comment._id);

        const votes = await ctx.db.query("votes").withIndex("by_postId", q => q.eq("postId", args.id)).collect();
        for (const vote of votes) await ctx.db.delete(vote._id);

        // For savedPosts, we need to filter client-side as we don't have a direct index on questionId alone
        const savedPosts = await ctx.db.query("savedPosts").collect();
        for (const saved of savedPosts.filter(s => s.questionId === args.id)) {
            await ctx.db.delete(saved._id);
        }

        await ctx.db.delete(args.id);
    }
});

export const updatePostStatus = mutation({
    args: { id: v.id("questions"), active: v.boolean() },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");
        if (post.authorId !== userId) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, { active: args.active });
    }
});

export const addAnswerToDoubt = mutation({
    args: { id: v.id("questions"), answer: v.string() },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");

        await ctx.db.patch(args.id, { answer: args.answer });

        // Award points to the answerer
        let profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
        if (profile) {
            await ctx.db.patch(profile._id, { score: profile.score + 15 });
        }
    }
});

export const updatePost = mutation({
    args: {
        id: v.id("questions"),
        title: v.optional(v.string()),
        code: v.optional(v.string()),
        answer: v.optional(v.string()),
        tags: v.optional(v.array(v.string()))
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");
        // For posts, only author can edit. For doubts, maybe others? Check current logic.
        // If type === 'post' check author. But simpler to just let client enforce for now,
        // or enforce here:
        if (post.type === 'post' && post.authorId !== userId) {
            throw new Error("Unauthorized");
        }

        const updates: any = {};
        if (args.title !== undefined) updates.title = args.title;
        if (args.code !== undefined) updates.code = args.code;
        if (args.answer !== undefined) updates.answer = args.answer;
        if (args.tags !== undefined) updates.tags = args.tags;

        await ctx.db.patch(args.id, updates);
    }
});
