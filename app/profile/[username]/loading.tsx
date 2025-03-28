"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon, HeartIcon } from "lucide-react";

export function ProfilePageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto my-8">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-6/10 max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar Skeleton */}
                <Skeleton className="w-24 h-24 rounded-full" />

                {/* Name and Username Skeleton */}
                <div className="mt-4 space-y-2 w-full">
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                  <Skeleton className="h-4 w-1/3 mx-auto" />
                </div>

                {/* Bio Skeleton */}
                <Skeleton className="mt-2 h-4 w-3/4" />

                {/* Profile Stats Skeleton */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex flex-col items-center space-y-2"
                      >
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button Skeleton */}
                <Skeleton className="w-full mt-4 h-10" />

                {/* Additional Info Skeleton */}
                <div className="w-full mt-6 space-y-2">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-4 w-3/4 mx-auto" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Skeleton */}
        <Tabs defaultValue="posts" className="w-full p-4">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          {/* Posts Skeleton */}
          <div className="mt-6 space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <Skeleton className="h-40 w-full" />
              </div>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default ProfilePageSkeleton;
