"use client";

import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Optional: if you use sonner or similar for notifications

interface SharePostProps {
  title: string;
  url: string;
}

export function SharePost({ title, url }: SharePostProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Check if the browser supports the native Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this post: ${title}`,
          url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleShare}
      className="flex items-center gap-2"
    >
      {copied ? (
        <Check className="size-4 text-green-500" />
      ) : (
        <Share2 className="size-4" />
      )}
      {copied ? "Copied!" : "Share Post"}
    </Button>
  );
}