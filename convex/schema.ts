import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,

    profiles: defineTable({
        userId: v.id("users"),
        username: v.optional(v.string()),
        avatar_url: v.optional(v.union(v.string(), v.null())),
        score: v.number(),
        isAdmin: v.boolean(),
    }).index("by_userId", ["userId"]),

    questions: defineTable({
        authorId: v.id("users"),
        title: v.string(),
        code: v.optional(v.string()),
        tags: v.array(v.string()),
        user: v.optional(v.string()),
        active: v.boolean(),
        answer: v.optional(v.string()),
        type: v.string(), // 'post' or 'doubt'
        votes: v.number(),
        downvotes: v.number(),
    }).index("by_authorId", ["authorId"])
        .index("by_type", ["type"])
        .index("by_active", ["active"]),

    comments: defineTable({
        questionId: v.id("questions"),
        authorId: v.id("users"),
        text: v.string(),
        authorName: v.optional(v.string()),
    }).index("by_questionId", ["questionId"])
        .index("by_authorId", ["authorId"]),

    votes: defineTable({
        userId: v.id("users"),
        postId: v.id("questions"),
        voteType: v.number(), // 1 or -1
    }).index("by_user_and_post", ["userId", "postId"])
        .index("by_postId", ["postId"])
        .index("by_userId", ["userId"]),

    savedPosts: defineTable({
        userId: v.id("users"),
        questionId: v.id("questions"),
    }).index("by_user_and_post", ["userId", "questionId"])
        .index("by_userId", ["userId"])
});
