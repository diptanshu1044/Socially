"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon, HeartIcon } from "lucide-react";

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="container-mobile py-4 space-y-4">
          {/* Profile Card - Mobile */}
          <div className="mobile-card">
            <div className="flex flex-col items-center text-center">
              {/* Avatar Skeleton */}
              <Skeleton className="w-20 h-20 rounded-full" />

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
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button Skeleton */}
              <Skeleton className="w-full mt-4 h-10" />

              {/* Additional Info Skeleton */}
              <div className="w-full mt-6 space-y-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-3 w-3/4 mx-auto" />
                ))}
              </div>
            </div>
          </div>

          {/* Posts and Likes Tabs - Mobile */}
          <div className="mobile-card">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="posts"
                  className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                   data-[state=active]:bg-transparent px-4 font-semibold text-sm min-h-[44px]"
                >
                  <FileTextIcon className="size-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="likes"
                  className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                   data-[state=active]:bg-transparent px-4 font-semibold text-sm min-h-[44px]"
                >
                  <HeartIcon className="size-4" />
                  Likes
                </TabsTrigger>
              </TabsList>

              {/* Posts Skeleton */}
              <div className="mt-6 space-y-4">
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
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:block xl:hidden">
        <div className="container-mobile py-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Card - Tablet */}
            <div className="mobile-card">
              <div className="flex flex-col items-center text-center">
                {/* Avatar Skeleton */}
                <Skeleton className="w-24 h-24 rounded-full" />

                {/* Name and Username Skeleton */}
                <div className="mt-4 space-y-2 w-full">
                  <Skeleton className="h-8 w-1/2 mx-auto" />
                  <Skeleton className="h-5 w-1/3 mx-auto" />
                </div>

                {/* Bio Skeleton */}
                <Skeleton className="mt-2 h-5 w-3/4" />

                {/* Profile Stats Skeleton */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex flex-col items-center space-y-2"
                      >
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-4 w-14" />
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
            </div>

            {/* Posts and Likes Tabs - Tablet */}
            <div className="mobile-card">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="posts"
                    className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                     data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
                  >
                    <FileTextIcon className="size-4" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="likes"
                    className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                     data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
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
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="container-mobile py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Profile */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <div className="mobile-card">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar Skeleton */}
                    <Skeleton className="w-24 h-24 rounded-full" />

                    {/* Name and Username Skeleton */}
                    <div className="mt-4 space-y-2 w-full">
                      <Skeleton className="h-8 w-1/2 mx-auto" />
                      <Skeleton className="h-5 w-1/3 mx-auto" />
                    </div>

                    {/* Bio Skeleton */}
                    <Skeleton className="mt-2 h-5 w-3/4" />

                    {/* Profile Stats Skeleton */}
                    <div className="w-full mt-6">
                      <div className="flex justify-between mb-4">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="flex flex-col items-center space-y-2"
                          >
                            <Skeleton className="h-5 w-10" />
                            <Skeleton className="h-4 w-14" />
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
                </div>
              </div>
            </div>
            
            {/* Main Content - Posts and Likes */}
            <div className="col-span-6">
              <div className="mobile-card">
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger
                      value="posts"
                      className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                       data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
                    >
                      <FileTextIcon className="size-4" />
                      Posts
                    </TabsTrigger>
                    <TabsTrigger
                      value="likes"
                      className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                       data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
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
            
            {/* Right Sidebar - Empty for now */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <div className="mobile-card">
                  <div className="text-center py-8">
                    <Skeleton className="h-6 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePageSkeleton;
