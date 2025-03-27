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

export interface PostCardProps {
  post: NewPost;
  dbUserId: string | null;
}

export const PostCard = ({ post, dbUserId }: PostCardProps) => {
  return (
    <Card className="my-2 md:my-4 px-1 md:px-4 py-4 md:py-6">
      <CardHeader className="flex flex-row gap-2 md:gap-4 px-2 md:px-6">
        <div className="flex justify-center items-center">
          <Avatar>
            <AvatarImage src={post.author.image || ""} />
            <AvatarFallback>
              {post.author.username?.[0].toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex gap-1 md:gap-4 flex-col grow">
          <div className="flex gap-2 items-center">
            <CardTitle>{post.author.name}</CardTitle>
            <CardDescription className="max-h-[1.25rem] md:h-auto overflow-y-hidden md:overflow-auto">
              @{post.author.username} ·{" "}
              {<FormatTimeAgo createdAt={post.createdAt} />}
            </CardDescription>
          </div>
          <div>
            <TextComponent content={post.content} />
          </div>
        </div>
        {dbUserId === post.authorId && <DeletePostButton postId={post.id} />}
      </CardHeader>
      {post.image && (
        <CardContent className="flex justify-center items-center">
          <Image
            src={post.image}
            alt="Post image"
            className={`w-full h-auto object-cover`}
          />
        </CardContent>
      )}
      <CardFooter className="flex flex-col items-start gap-2 px-0">
        <div className="flex gap-4 pb-3 ml-10 md:ml-14">
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
