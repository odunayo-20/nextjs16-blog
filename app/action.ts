"use server";

import z from "zod";
import { postSchema } from "./schemas/blog";
import { fetchMutation } from "convex/nextjs";
import { api } from "../convex/_generated/api";
import { redirect } from "next/navigation";
import { getToken } from "../lib/auth-server";
import { error } from "console";
import { revalidatePath, updateTag } from "next/cache";
import { Id } from "@/convex/_generated/dataModel";

export async function createBlogAction(values: z.infer<typeof postSchema>) {
    const parsed = postSchema.safeParse(values);
    if (!parsed.success) {
        throw new Error(parsed.error.message);
    }

    const token = await getToken();

    try {
        const imageUrl = await fetchMutation(
            api.posts.generateImageUploadUrl,
            {},
            { token }
        );

        const uploadResult = await fetch(imageUrl, {
            method: "POST",
            headers: {
                "Content-Type": parsed.data.image?.type || "application/octet-stream",
            },
            body: parsed.data.image,
        });

        if (!uploadResult.ok) {
            return {
                error: "Failed to upload image"
            };
        }

        const { storageId } = await uploadResult.json();

        await fetchMutation(api.posts.createPost, {
            body: parsed.data.content,
            title: parsed.data.title,
            imageStorageId: storageId,
        }, { token });



    } catch {
        return {
            error: "Failed to upload image"
        };
    }

    updateTag("blog");

    return redirect('/blog');
}


// next.config.js - You might still want to bump this to 5mb or 10mb for long text
// but NOT for large images.

// Server Action
export async function updateBlogAction(values: { 
  postId: string; 
  title: string; 
  content: string; 
  imageStorageId?: string 
}) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  // Only perform the database update here
  await fetchMutation(
    api.posts.updatePost,
    {
      postId: values.postId as Id<"posts">,
      title: values.title,
      body: values.content,
      ...(values.imageStorageId ? { imageStorageId: values.imageStorageId as Id<"_storage"> } : {}),
    },
    { token }
  );

  revalidatePath("/blog");
  return { success: true };
}

export async function deleteBlogAction(postId: string) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  await fetchMutation(
    api.posts.deletePost,
    { postId: postId as Id<"posts"> },
    { token }
  );

  revalidatePath("/blog");
  return { success: true };
}