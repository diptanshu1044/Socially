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
        <div className="max-w-[300px] md:max-w-[400px] break-words">
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
              className="text-blue-500 p-0 h-auto block"
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
                      <Avatar>
                        <AvatarImage src={comment.author.image || ""} />
                        <AvatarFallback>
                          {comment.author.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <div>
                        <Link href={`/profile/${comment.author.username}`}>
                          <span>{comment.author.name}&nbsp;&nbsp;</span>
                          <span className="text-gray-500">
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
              <Avatar>
                <AvatarImage src={user ? user.imageUrl : ""} />
                <AvatarFallback>
                  {user && user.username ? user.username[0].toUpperCase() : "P"}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Write a comment..."
                className="grow w-full bg-transparent h-20 resize-none"
                onChange={(e) => setNewComment(e.target.value)}
                value={newComment}
              />
            </div>
            <div className="flex flex-row-reverse px-3 py-2">
              <Button disabled={isCommenting} onClick={handleComment}>
                <SendIcon />
                Comment
                {isCommenting && "ing..."}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
