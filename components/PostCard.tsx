import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { TextComponent } from "./TextComponent";
import { DeletePostButton } from "./DeletePostButton";
import { NewPost } from "@/types/post.types";
import { LikePostButton } from "./LikePostButton";
import { FormatTimeAgo } from "./FormatTimeAgo";
import { CommentButton } from "./CommentButton";
import { CommentSection } from "./CommentSection";
import { Button } from "./ui/button";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export interface PostCardProps {
  post: NewPost;
  dbUserId: string | null;
}

export const PostCard = ({ post, dbUserId }: PostCardProps) => {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-4 mobile-card">
      <CardHeader className="flex flex-row gap-3 px-4 py-4 lg:px-6 lg:py-6">
        <div className="flex justify-center items-start flex-shrink-0">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="w-10 h-10 lg:w-12 lg:h-12">
              <AvatarImage src={post.author.image || ""} />
              <AvatarFallback className="text-sm">
                {post.author.username?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <div className="flex gap-2 flex-col grow min-w-0">
          <div className="flex gap-2 items-center flex-wrap">
            <Link href={`/profile/${post.author.username}`} className="min-w-0 flex-1">
              <CardTitle className="text-sm lg:text-base truncate">{post.author.name}</CardTitle>
            </Link>
            <CardDescription className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <Link href={`/profile/${post.author.username}`} className="hover:underline">
                @{post.author.username}
              </Link>
              <span className="mx-1">·</span>
              <FormatTimeAgo createdAt={post.createdAt} />
            </CardDescription>
          </div>
          <div className="text-sm lg:text-base leading-relaxed mt-2">
            <TextComponent content={post.content} />
          </div>
        </div>
        <div className="flex items-start gap-1 flex-shrink-0">
          {dbUserId !== post.authorId && (
            <Link href={`/chat?user=${post.authorId}`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full min-h-[32px] min-w-[32px]">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {dbUserId === post.authorId && <DeletePostButton postId={post.id} />}
        </div>
      </CardHeader>
      
      {post.image && (
        <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
          <div className="rounded-xl overflow-hidden">
            <Image
              src={post.image}
              alt="Post image"
              className="w-full h-auto object-cover"
              width={600}
              height={400}
              priority={false}
            />
          </div>
        </CardContent>
      )}
      
      <CardFooter className="flex flex-col items-start gap-3 px-4 pb-4 lg:px-6 lg:pb-6">
        <div className="flex gap-6 w-full">
          <LikePostButton
            likes={post._count.likes}
            dbUserId={dbUserId}
            postId={post.id}
            postLikes={post.likes}
          />
          <CommentButton
            commentCount={post._count.comments}
            thisPostId={post.id}
            dbUserId={dbUserId}
          />
        </div>
        <CommentSection
          comments={post.comments}
          dbUserId={dbUserId}
          thisPostId={post.id}
        />
      </CardFooter>
    </Card>
  );
};
