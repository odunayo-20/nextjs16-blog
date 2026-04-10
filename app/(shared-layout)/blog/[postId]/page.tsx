// "use client";

import { buttonVariants } from "@/components/ui/button-variants";
import { Separator } from "@/components/ui/separator";
import CommentSection from "@/components/web/CommentSection";
import { DeletePost } from "@/components/web/DeletePost";
import { PostPresence } from "@/components/web/PostPresence";
import { SharePost } from "@/components/web/SharedPost";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getPostById, getPosts } from "@/convex/posts";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { get } from "http";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { title } from "process";


interface PostIdRouteProps {
    params: Promise<{
        postId: Id<"posts">;

    }>
}

// export async function generateMetaData({
//     params,
// }: PostIdRouteProps) : Promise<Metadata>{
//     const { postId } = await params;

//     const post = await fetchQuery(api.posts.getPostById, { postId: postId});

//     if(!post){
//         return {
//             title: "Post not found"
//         }
//     }


//     return {
//         title: post.title,
//         description: post.body
//     }
// }


// app/blog/[postId]/page.tsx


export async function generateMetadata({ params }: PostIdRouteProps): Promise<Metadata> {
    const { postId } = await params;

    const post = await fetchQuery(api.posts.getPostById, { postId });

    if (!post) {
        return {
            title: "Post not found",
            description: "This post does not exist",
        };
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://nextjs16-blog-azure.vercel.app";

    const url = `${baseUrl}/blog/${postId}`;

    return {
        title: post.title,
        description: post.body.substring(0, 160),

        openGraph: {
            title: post.title,
            description: post.body.substring(0, 160),
            url: url,
            siteName: "Blog Pro",
            type: "article",
            images: [
                {
                    url: post.imageUrl || `${baseUrl}/default-og.png`, // VERY IMPORTANT
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.body.substring(0, 160),
            images: [post.imageUrl || `${baseUrl}/default-og.png`],
        },
    };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {

    const { postId } = await params;

    const token = await getToken();

    const [post, preloadedComments, userId] = await Promise.all([
        await fetchQuery(api.posts.getPostById, { postId }),
        await preloadQuery(api.comments.getCommentsByPostId, {
            postId: postId,
        }),
        await fetchQuery(api.presence.getUserId, {}, { token }),

    ]);


    if (!post) {
        return (
            <div>
                <h1 className="text-6xl font-extrabold text-red-500 py-20">No Post Found</h1>
            </div>
        );

    }


    // Check if current user is the author
    const isAuthor = userId === post.authorId;

    // Construct the URL (In production, replace with your actual domain)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nextjs16-blog-azure.vercel.app";
    const postUrl = `${baseUrl}/blog/${post._id}`;
    return (
        <div className='max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative'>

<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
    
    {/* Back Button */}
    <Link 
        className={buttonVariants({ variant: "ghost" })} 
        href="/blog"
    >
        <ArrowLeft className="size-4" /> 
        <span className="ml-1">Back to Blog</span>
    </Link>

    {/* Actions */}
    <div className="flex flex-wrap items-center gap-2">
        {isAuthor && (
            <>
                <Link
                    href={`/blog/${post._id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                    Edit
                </Link>

                <DeletePost postId={post._id} />
            </>
        )}

        <SharePost title={post.title} url={postUrl} />
    </div>
</div>

            <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-sm">
                <Image src={post.imageUrl ?? "https://plus.unsplash.com/premium_photo-1731917385487-0c38e0530fbf?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} alt={post.title} fill className="object-cover hover:scale-105 transition-transform duration-500 object-top" />
            </div>

            <div className="space-y-4 flex flex-col">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">{post.title}</h1>

                <div className="flex items-center gap-2">

                    <p className="text-lg text-muted-foreground">Posted on:{" "} {new Date(post._creationTime).toLocaleDateString("en-US")}</p>

                    {
                        userId &&

                        <PostPresence roomId={post._id} userId={userId} />
                    }

                </div>
            </div>

            <Separator className="my-8" />

            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">{post.body}</p>

            <Separator className="my-8" />

            <CommentSection preloadedComments={preloadedComments} />
        </div>
    );
}