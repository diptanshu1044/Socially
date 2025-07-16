"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FollowButton } from "@/components/FollowButton";
import { UserPlus, MapPin, FileText } from "lucide-react";
import Link from "next/link";

interface UserCardProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
    bio: string | null;
    location: string | null;
    _count: {
      followers: number;
      following: number;
      posts: number;
    };
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <Link href={`/profile/${user.username}`} className="flex-shrink-0">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="text-lg">
            {user.name ? user.name[0] : user.username[0]}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${user.username}`} className="block">
              <h3 className="font-semibold text-base truncate">
                {user.name || user.username}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{user.username}
              </p>
            </Link>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* Location */}
            {user.location && (
              <div className="flex items-center mt-2">
                <MapPin className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {user.location}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {user._count.followers} followers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {user._count.posts} posts
                </span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <div className="flex-shrink-0">
            <FollowButton userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 