"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { toggleFollow } from "@/actions/user.action";
import { isFollowing as isUserFollowing } from "@/actions/profile.action";

export const FollowButton = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFollowing = async () => {
      try {
        setIsLoading(true);
        const res = await isUserFollowing(userId);
        setIsFollowing(res); // Directly set the boolean result
      } catch (e) {
        console.error("Error checking follow status:", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkFollowing();
  }, [userId]); // Added userId as dependency

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await toggleFollow(userId);
      setIsFollowing((prev) => !prev); // Toggle the follow state
      toast.success(
        `Successfully ${isFollowing ? "unfollowed" : "followed"} user`,
      );
    } catch (e) {
      toast.error("Failed to follow/unfollow user");
      console.log("Error toggling follow:", e);
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
      {isLoading && <Loader2Icon className="size-4 animate-spin" />}
      {isFollowing === null ? "" : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
