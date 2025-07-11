"use client";
import { SendIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useUser } from "@clerk/nextjs";
import { FormatTimeAgo } from "./FormatTimeAgo";
import { useState } from "react";
import { createComment } from "@/actions/post.action";
import { toast } from "sonner";
import { useCommentStore } from "@/store/comment.store";
import { Separator } from "./ui/separator";
import Link from "next/link";

interface CommentSectionProps {
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    postId: string;
    author: {
      id: string;
      username: string;
      image: string | null;
      name: string | null;
    };
  }[];
  dbUserId: string | null;
  thisPostId: string;
}

export const CommentSection = ({
  comments,
  thisPostId,
}: CommentSectionProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const { user } = useUser();

  const handleComment = async () => {
    setIsCommenting(true);
    try {
      const res = await createComment(postId, newComment);
      if (res?.success) {
        toast.success("Commented Successfully");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to comment");
    } finally {
      setIsCommenting(false);
      setNewComment("");
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId],
    );
  };

  const renderCommentContent = (
    comment: CommentSectionProps["comments"][number],
  ) => {
    const isExpanded = expandedComments.includes(comment.id);
    const MAX_LENGTH = 150; // Adjust this as needed
    const isLongComment = comment.content.length > MAX_LENGTH;

    return (
      <div className="space-y-1">
        <div className="max-w-[250px] lg:max-w-[300px] xl:max-w-[400px] break-words">
          {isExpanded
            ? comment.content
            : isLongComment
              ? `${comment.content.slice(0, MAX_LENGTH)}`
              : comment.content}
        </div>
        {isLongComment && (
          <div>
            <Button
              variant="link"
              className="text-blue-500 p-0 h-auto block text-xs lg:text-sm"
              onClick={() => toggleCommentExpansion(comment.id)}
            >
              {isExpanded ? "See Less" : "See More"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const { showCommentSection, postId } = useCommentStore();

  return (
    <>
      {showCommentSection && postId === thisPostId && (
        <>
          <Separator className="my-2" />
          <div className="w-full space-y-3">
            {/* Comments list */}
            <div className="flex flex-col gap-2 sm:gap-3">
              {comments.length > 0 &&
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 sm:gap-3 px-2 sm:px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 ring-1 ring-slate-200 dark:ring-slate-700">
                        <AvatarImage src={comment.author.image || ""} />
                        <AvatarFallback className="text-xs font-medium bg-slate-100 dark:bg-slate-700">
                          {comment.author.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <Link href={`/profile/${comment.author.username}`} className="group">
                          <span className="text-xs sm:text-sm lg:text-base font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {comment.author.name}
                          </span>
                        </Link>
                        <span className="text-gray-500 text-xs">
                          @{comment.author.username} · <FormatTimeAgo createdAt={comment.createdAt} />
                        </span>
                      </div>
                      {renderCommentContent(comment)}
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Comment input */}
            <div className="flex gap-2 sm:gap-3 px-2 sm:px-3 py-2">
              <Avatar className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                <AvatarImage src={user ? user.imageUrl : ""} />
                <AvatarFallback className="text-xs font-medium bg-slate-100 dark:bg-slate-700">
                  {user && user.username ? user.username[0].toUpperCase() : "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  className="w-full bg-transparent h-12 sm:h-16 lg:h-20 resize-none text-xs sm:text-sm lg:text-base border-0 focus:ring-0 focus:outline-none p-0 min-h-[48px] sm:min-h-[64px] lg:min-h-[80px]"
                  onChange={(e) => setNewComment(e.target.value)}
                  value={newComment}
                />
                <div className="flex justify-end">
                  <Button 
                    disabled={isCommenting || !newComment.trim()} 
                    onClick={handleComment} 
                    className="h-7 sm:h-8 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium min-h-[28px] sm:min-h-[32px] bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SendIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    {isCommenting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
