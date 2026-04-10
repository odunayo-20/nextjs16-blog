import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { Doc } from "./_generated/dataModel";


// server or convex functions to handle posts related operations
// Create a new post with the given title and body
export const createPost = mutation({
  args: { title: v.string(), body: v.string(), imageStorageId: v.id("_storage") },
  handler: async (ctx, args) => {

    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    const blogArticle = await ctx.db.insert("posts", {
      body: args.body,
      title: args.title,
      authorId: user._id,
      imageStorageId: args.imageStorageId

    });
    return blogArticle;
  },
});


export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order('desc').collect();

    return await Promise.all(
      posts.map(async (post) => {
        const resolvedImageUrl = post.imageStorageId !== undefined ? await ctx.storage.getUrl(post.imageStorageId) : null;

        return {
          ...post,
          imageUrl: resolvedImageUrl,
        };
      })
    );

  }
});



export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  }
});


export const getPostById = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      return null;
    }

    const resolvedImageUrl =
      post?.imageStorageId !== undefined ? await ctx.storage.getUrl(post.imageStorageId) : null;

    return {
      ...post,
      imageUrl: resolvedImageUrl,
    }
  }
});



interface searchResultTypes {
  _id: string;
  title: string;
  body: string;
}

export const searchPosts = query({
  args: {
    term: v.string(),
    limit: v.number(),
  },

  handler: async (ctx, args) => {
    const limit = args.limit;

    const results: Array<searchResultTypes> = [];

    const seen = new Set();

    const pushDocs = async (docs: Array<Doc<"posts">>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue;

        seen.add(doc._id);
        results.push({
          _id: doc._id,
          title: doc.title,
          body: doc.body,
        });
        if (results.length >= limit) break;
      }
    };

    const titleMatches = await ctx.db.query("posts").withSearchIndex("search_title", (q) => q.search("title", args.term)).take(limit);

    await pushDocs(titleMatches);


    if (results.length < limit) {
      const bodyMatches = await ctx.db.query("posts")
        .withSearchIndex("search_body", (q) => q.search("body", args.term))
        .take(limit);

      await pushDocs(bodyMatches)

    }
    return results;

  },


});


// / Mutation to delete a post
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check ownership: assumes your post document has an 'authorId' field
    // which stores the identity.subject (the user's unique ID)
    if (post.authorId !== identity.subject) {
      throw new Error("Unauthorized: You do not own this post");
    }

    // Delete associated image if it exists
    if (post.imageStorageId) {
      try {
        await ctx.storage.delete(post.imageStorageId);
      } catch (error) {
        console.error("Failed to delete image from storage:", error);
      }
    }

    await ctx.db.delete(args.postId);
  },
});


// export const updatePost = mutation({
//   args: {
//     postId: v.id("posts"),
//     title: v.string(),
//     body: v.string(),
//     imageStorageId: v.optional(v.id("_storage")),
//   },
//   handler: async (ctx, args) => {
//     console.log("updatePost called with args:", args);
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       console.error("No identity");
//       throw new Error("Unauthenticated");
//     }

//     const post = await ctx.db.get(args.postId);
//     if (!post) {
//       console.error("Post not found:", args.postId);
//       throw new Error("Post not found");
//     }

//     if (post.authorId !== identity.subject) {
//       console.error("Unauthorized: post author", post.authorId, "user", identity.subject);
//       throw new Error("Unauthorized");
//     }

//     const updateData = {
//       title: args.title,
//       body: args.body,
//       ...(args.imageStorageId ? { imageStorageId: args.imageStorageId } : {}),
//     };
//     console.log("Updating post with:", updateData);

//     await ctx.db.patch(args.postId, updateData);
//     console.log("Post updated successfully");
//   },
// });




export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    title: v.string(),
    body: v.string(),
    imageStorageId: v.optional(v.id("_storage")), // Ensure this matches your schema
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (post.authorId !== identity.subject) throw new Error("Unauthorized");

    // --- ENHANCED DELETE LOGIC ---
    // Delete old image if:
    // 1. User is uploading a NEW image (different from old one), OR
    // 2. User is removing the image entirely (no new image provided)
    if (post.imageStorageId) {
      const isReplacingImage = args.imageStorageId && args.imageStorageId !== post.imageStorageId;
      const isRemovingImage = !args.imageStorageId;

      if (isReplacingImage || isRemovingImage) {
        console.log("Attempting to delete old file from storage...");
        
        try {
          await ctx.storage.delete(post.imageStorageId);
          console.log("Successfully deleted old file from bucket.");
        } catch (storageError) {
          console.error("Failed to delete from storage bucket:", storageError);
          // We don't throw here so the post update still succeeds, 
          // but we'll see the error in the logs.
        }
      }
    }

    const updateData = {
      title: args.title,
      body: args.body,
      // Only include imageStorageId in the patch if a new one was sent
      ...(args.imageStorageId ? { imageStorageId: args.imageStorageId } : {}),
    };

    await ctx.db.patch(args.postId, updateData);
    return { success: true };
  },
});