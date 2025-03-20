"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { toggleFollow } from "@/actions/user.action";

export const FollowButton = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(true);

  const handleFollow = async (e) => {
    setIsLoading(true);
    console.log(`Following ${userId}`);
    try {
      const res = await toggleFollow(userId);
      res.follow ? setIsFollowing(true) : setIsFollowing(false);
      toast.success(
        `Successfully ${!res.follow ? "followed" : "unfollowed"} user`,
      );
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
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : isFollowing ? (
        "Follow"
      ) : (
        "Unfollow"
      )}
    </Button>
  );
};
