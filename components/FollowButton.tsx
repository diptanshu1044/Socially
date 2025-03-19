"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { toggleFollow } from "@/actions/user.action";

export const FollowButton = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleFollow = async (e) => {
    setIsLoading(true);
    console.log(`Following ${userId}`);
    try {
      await toggleFollow(userId);
      toast.success("User followed successfully");
    } catch (e) {
      console.log(e);
      toast.error("Failed to follow user");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      disabled={isLoading}
      variant="secondary"
      className="m-auto"
      onClick={handleFollow}
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
};
