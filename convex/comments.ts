import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getByQuestionId = query({
    args: { questionId: v.id("questions") },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_questionId", (q) => q.eq("questionId", args.questionId))
            .order("desc")
            .collect();

        return comments.map(comment => ({
            ...comment,
            id: comment._id,
            createdAt: new Date(comment._creationTime).toISOString(),
        }));
    }
});

export const addComment = mutation({
    args: {
        questionId: v.id("questions"),
        text: v.string(),
        authorName: v.string()
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        const commentId = await ctx.db.insert("comments", {
            questionId: args.questionId,
            authorId: userId,
            text: args.text,
            authorName: args.authorName,
        });

        return commentId;
    }
});
