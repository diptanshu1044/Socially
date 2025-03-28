import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen text-gray-100">
      <div className="flex flex-col md:flex-row p-4 md:p-8 gap-8 justify-center items-center md:items-start">
        {/* Profile Card Skeleton */}
        <Card className="w-full md:w-1/4 animate-pulse border-gray-700 sticky top-24">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4 bg-gray-700" />
              <Skeleton className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <Skeleton className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
              <Skeleton className="h-10 bg-gray-700 rounded w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Skeleton */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Create Post Skeleton */}
          <Card className="animate-pulse border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 bg-gray-700 rounded-full" />
                <Skeleton className="h-10 bg-gray-700 rounded flex-grow" />
              </div>
              <Skeleton className="h-10 bg-gray-700 rounded w-full" />
            </CardContent>
          </Card>

          {/* Posts Skeleton */}
          {[1, 2, 3].map((item) => (
            <Card key={item} className="animate-pulse border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-10 w-10 bg-gray-700 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 bg-gray-700 rounded w-40" />
                    <Skeleton className="h-3 bg-gray-700 rounded w-24" />
                  </div>
                </div>
                <Skeleton className="h-48 bg-gray-700 rounded mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 bg-gray-700 rounded w-full" />
                  <Skeleton className="h-4 bg-gray-700 rounded w-3/4" />
                </div>
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-8 bg-gray-700 rounded w-1/4" />
                  <Skeleton className="h-8 bg-gray-700 rounded w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Who to Follow Skeleton */}
        <Card className="hidden md:block md:w-1/4 md:sticky md:top-24 animate-pulse border-gray-700">
          <CardContent className="p-4">
            <Skeleton className="h-6 bg-gray-700 rounded w-1/2 mb-4" />
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-10 w-10 bg-gray-700 rounded-full" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 bg-gray-700 rounded w-3/4" />
                  <Skeleton className="h-3 bg-gray-700 rounded w-1/2" />
                </div>
                <Skeleton className="h-8 bg-gray-700 rounded w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
