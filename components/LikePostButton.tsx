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
      className={`text-muted-foreground gap-2 ${
        hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
      }`}
    >
      <Heart fill={hasLiked ? "red" : ""} /> {optimisticLikes}
    </Button>
  );
};
