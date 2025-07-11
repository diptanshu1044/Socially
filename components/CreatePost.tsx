"use client";

import { SignedIn, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, SmileIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

export const CreatePost = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);
      if (result?.success) {
        // reset the form
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);

        toast.success("Post created successfully");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SignedIn>
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mobile-card">
        <CardContent className="p-4 lg:p-6">
          <div className="space-y-4">
            <div className="flex space-x-3 lg:space-x-4">
              <Avatar className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
                <AvatarImage src={user?.imageUrl} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder="What's happening?"
                  className="min-h-[80px] lg:min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-sm lg:text-base bg-transparent placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isPosting}
                />
              </div>
            </div>

            {(showImageUpload || imageUrl) && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900">
                <ImageUpload
                  endpoint="postImage"
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url);
                    if (!url) setShowImageUpload(false);
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full h-10 w-10 p-0 min-h-[40px] min-w-[40px]"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  disabled={isPosting}
                >
                  <ImageIcon className="size-5" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 rounded-full h-10 w-10 p-0 min-h-[40px] min-w-[40px]"
                  disabled={isPosting}
                >
                  <SmileIcon className="size-5" />
                </Button>
              </div>
              
              <Button
                className="flex items-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full px-4 lg:px-6 py-2 h-10 min-h-[40px]"
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || isPosting}
              >
                {isPosting ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Posting...</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4 mr-2" />
                    <span className="hidden sm:inline">Post</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SignedIn>
  );
};
