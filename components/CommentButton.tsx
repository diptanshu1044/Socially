"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useCommentStore } from "@/store/comment.store";

interface CommentButtonProps {
  commentCount: number;
  thisPostId: string;
  dbUserId: string | null;
}

export const CommentButton = ({
  commentCount,
  thisPostId,
}: CommentButtonProps) => {
  const { postId, setPostId, showCommentSection, setShowCommentSection } =
    useCommentStore();

  const handleComment = () => {
    setShowCommentSection(!showCommentSection);
    setPostId(thisPostId);
  };

  return (
    <Button
      className="text-muted-foreground gap-2 hover:text-white"
      variant="ghost"
      onClick={handleComment}
    >
      <MessageCircle
        className={`size-5 ${thisPostId === postId && showCommentSection ? "fill-gray-200 text-gray-200" : ""}`}
      />{" "}
      {commentCount}
    </Button>
  );
};
