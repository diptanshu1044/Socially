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
          <Separator />
          <div className="w-full">
            <div className="flex flex-col gap-2">
              {comments.length > 0 &&
                comments.map((comment) => (
                  <div key={comment.id} className="flex px-3 py-2 gap-3">
                    <Link href={`/profile/${comment.author.username}`}>
                      <Avatar className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
                        <AvatarImage src={comment.author.image || ""} />
                        <AvatarFallback className="text-xs lg:text-sm">
                          {comment.author.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div>
                        <Link href={`/profile/${comment.author.username}`}>
                          <span className="text-sm lg:text-base font-medium">{comment.author.name}&nbsp;&nbsp;</span>
                          <span className="text-gray-500 text-xs lg:text-sm">
                            @{comment.author.username} &nbsp;·&nbsp;{"  "}
                            {<FormatTimeAgo createdAt={comment.createdAt} />}
                          </span>
                        </Link>
                      </div>
                      {renderCommentContent(comment)}
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex gap-3 px-3 py-2">
              <Avatar className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
                <AvatarImage src={user ? user.imageUrl : ""} />
                <AvatarFallback className="text-xs lg:text-sm">
                  {user && user.username ? user.username[0].toUpperCase() : "P"}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Write a comment..."
                className="grow w-full bg-transparent h-16 lg:h-20 resize-none text-sm lg:text-base"
                onChange={(e) => setNewComment(e.target.value)}
                value={newComment}
              />
            </div>
            <div className="flex flex-row-reverse px-3 py-2">
              <Button disabled={isCommenting} onClick={handleComment} className="min-h-[40px]">
                <SendIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Comment</span>
                {isCommenting && <span className="hidden sm:inline">ing...</span>}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
