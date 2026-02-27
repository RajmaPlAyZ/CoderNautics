import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getVoteForPost = query({
    args: { postId: v.id("questions") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const vote = await ctx.db
            .query("votes")
            .withIndex("by_user_and_post", (q) => q.eq("userId", userId).eq("postId", args.postId))
            .first();

        if (!vote) return null;

        return {
            ...vote,
            id: vote._id,
            type: vote.voteType === 1 ? 'upvote' : 'downvote',
        };
    }
});

export const recordVote = mutation({
    args: {
        postId: v.id("questions"),
        type: v.string() // 'upvote' or 'downvote'
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const voteType = args.type === 'upvote' ? 1 : -1;

        await ctx.db.insert("votes", {
            userId,
            postId: args.postId,
            voteType
        });

        // Update post votes count
        const post = await ctx.db.get(args.postId);
        if (post) {
            await ctx.db.patch(args.postId, {
                votes: post.votes + voteType
            });

            // Award points to post author for upvotes
            if (args.type === 'upvote' && post.authorId) {
                let profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", post.authorId)).first();
                if (profile) {
                    await ctx.db.patch(profile._id, { score: profile.score + 1 });
                }
            }
        }
    }
});

export const updateVote = mutation({
    args: {
        voteId: v.id("votes"),
        postId: v.id("questions"),
        newType: v.string(),
        oldType: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const vote = await ctx.db.get(args.voteId);
        if (!vote || vote.userId !== userId) throw new Error("Unauthorized");

        const newVoteType = args.newType === 'upvote' ? 1 : -1;
        await ctx.db.patch(args.voteId, { voteType: newVoteType });

        // Update post votes count
        const post = await ctx.db.get(args.postId);
        if (post) {
            const diff = args.oldType === 'upvote' && args.newType === 'downvote' ? -2 :
                args.oldType === 'downvote' && args.newType === 'upvote' ? 2 : 0;

            await ctx.db.patch(args.postId, {
                votes: post.votes + diff
            });

            // Award/remove points from post author
            if (diff !== 0 && post.authorId) {
                let profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", post.authorId)).first();
                if (profile) {
                    await ctx.db.patch(profile._id, { score: profile.score + diff });
                }
            }
        }
    }
});

export const removeVote = mutation({
    args: {
        voteId: v.id("votes"),
        postId: v.id("questions"),
        type: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const vote = await ctx.db.get(args.voteId);
        if (!vote || vote.userId !== userId) throw new Error("Unauthorized");

        await ctx.db.delete(args.voteId);

        // Update post votes count
        const post = await ctx.db.get(args.postId);
        if (post) {
            const diff = args.type === 'upvote' ? -1 : 1;
            await ctx.db.patch(args.postId, {
                votes: post.votes + diff
            });

            // Remove/award points from post author
            if (post.authorId) {
                let profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", post.authorId)).first();
                if (profile) {
                    await ctx.db.patch(profile._id, { score: profile.score + diff });
                }
            }
        }
    }
});
