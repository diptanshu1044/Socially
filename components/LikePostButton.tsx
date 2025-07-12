"use client";

import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { toggleLike } from "@/actions/post.action";

export const LikePostButton = ({
  likes,
  postLikes,
  dbUserId,
  postId,
}: {
  likes: number;
  postLikes: { userId: string }[];
  dbUserId: string | null;
  postId: string;
}) => {
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [hasLiked, setHasLiked] = useState<boolean>(
    postLikes.some((like) => like.userId === dbUserId),
  );
  const [optimisticLikes, setOptimisticLikes] = useState<number>(likes);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
      await toggleLike(postId);
      toast.success(`${!hasLiked ? "Liked" : "Unliked"} Successfully`);
    } catch (e) {
      console.log(e);
      setOptimisticLikes(likes);
      setHasLiked(postLikes.some((like) => like.userId === dbUserId));
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLike}
      disabled={isLiking}
      className={`gap-1.5 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-full transition-all duration-200 min-h-[32px] sm:min-h-[40px] ${
        hasLiked 
          ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
          : "text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
      }`}
    >
      <Heart 
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${hasLiked ? "fill-red-500" : ""}`} 
      /> 
      <span className="text-xs font-medium">{optimisticLikes}</span>
    </Button>
  );
};
