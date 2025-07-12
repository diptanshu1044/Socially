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

  const isActive = thisPostId === postId && showCommentSection;

  return (
    <Button
      className={`gap-1.5 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 rounded-full transition-all duration-200 min-h-[32px] sm:min-h-[40px] ${
        isActive
          ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          : "text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
      }`}
      variant="ghost"
      onClick={handleComment}
    >
      <MessageCircle
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${isActive ? "fill-blue-500" : ""}`}
      />
      <span className="text-xs font-medium">{commentCount}</span>
    </Button>
  );
};
