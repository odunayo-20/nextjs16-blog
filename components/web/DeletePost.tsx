"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteBlogAction } from "@/app/action";

export function DeletePost({ postId }: { postId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        
        startTransition(async () => {
            try {
                await deleteBlogAction(postId);
                router.push("/blog");
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <Button 
            variant="destructive" 
            size="sm" 
            disabled={isPending} 
            onClick={handleDelete}
        >
            <Trash2 className="size-4 mr-2" />
            {isPending ? "Deleting..." : "Delete"}
        </Button>
    );
}