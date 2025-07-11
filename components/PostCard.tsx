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
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-3 mobile-card overflow-hidden">
      <CardHeader className="flex flex-row gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        {/* Avatar Section */}
        <div className="flex justify-center items-start flex-shrink-0">
          <Link href={`/profile/${post.author.username}`} className="block">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ring-1 sm:ring-2 ring-slate-100 dark:ring-slate-700 hover:ring-slate-200 dark:hover:ring-slate-600 transition-all">
              <AvatarImage src={post.author.image || ""} />
              <AvatarFallback className="text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-700">
                {post.author.username?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col grow min-w-0 space-y-1.5 sm:space-y-2">
          {/* Header with name, username, and time */}
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <Link href={`/profile/${post.author.username}`} className="min-w-0 flex-1 group">
                  <CardTitle className="text-xs sm:text-sm lg:text-base font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.author.name}
                  </CardTitle>
                </Link>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Link href={`/profile/${post.author.username}`} className="hover:underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  @{post.author.username}
                </Link>
                <span className="mx-1">·</span>
                <FormatTimeAgo createdAt={post.createdAt} />
              </CardDescription>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-start gap-0.5 sm:gap-1 flex-shrink-0">
              {dbUserId !== post.authorId && (
                <Link href={`/chat?user=${post.authorId}`}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full min-h-[28px] min-w-[28px] sm:min-h-[32px] sm:min-w-[32px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
              )}
              {dbUserId === post.authorId && <DeletePostButton postId={post.id} />}
            </div>
          </div>
          
          {/* Post content */}
          <div className="text-xs sm:text-sm lg:text-base leading-relaxed text-slate-900 dark:text-slate-100">
            <TextComponent content={post.content} />
          </div>
        </div>
      </CardHeader>
      
      {/* Post image */}
      {post.image && (
        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
          <div className="rounded-lg sm:rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <Image
              src={post.image}
              alt="Post image"
              className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300"
              width={600}
              height={400}
              priority={false}
            />
          </div>
        </CardContent>
      )}
      
      {/* Footer with actions and comments */}
      <CardFooter className="flex flex-col items-start gap-3 sm:gap-4 px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
        {/* Action buttons */}
        <div className="flex items-center gap-4 sm:gap-6 w-full">
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
        
        {/* Comments section */}
        <div className="w-full">
          <CommentSection
            comments={post.comments}
            dbUserId={dbUserId}
            thisPostId={post.id}
          />
        </div>
      </CardFooter>
    </Card>
  );
};
