import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        // Return a URL that clients can use to upload a file to Convex Storage
        return await ctx.storage.generateUploadUrl();
    }
});

export const saveAvatarUrl = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");

        let profile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        const avatarUrl = await ctx.storage.getUrl(args.storageId);

        if (profile) {
            // Update existing profile
            await ctx.db.patch(profile._id, { avatar_url: avatarUrl });
        } else {
            // Create profile if it doesn't exist
            await ctx.db.insert("profiles", {
                userId,
                avatar_url: avatarUrl,
                score: 0,
                isAdmin: false,
            });
        }

        return avatarUrl;
    }
});
