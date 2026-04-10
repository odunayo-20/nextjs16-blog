import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import EditPostForm  from "@/components/web/EditPostForm";
import { redirect } from "next/navigation";

export default async function EditPostPage({ 
  params 
}: { 
  params: Promise<{ postId: Id<"posts"> }> 
}) {
  const { postId } = await params;
  const post = await fetchQuery(api.posts.getPostById, { postId });

  if (!post) redirect("/blog");

  const initialData = {
      _id: post._id,
      title: post.title,
      content: post.body, 
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
     
      <EditPostForm initialData={initialData} />
    </div>
  );
}