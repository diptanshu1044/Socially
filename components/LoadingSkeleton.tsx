import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen text-gray-100">
      <div className="flex flex-col md:flex-row p-4 md:p-8 gap-8 justify-center items-center md:items-start">
        {/* Profile Card Skeleton */}
        <div className="w-full md:w-1/4 animate-pulse">
          <div className="bg-gray-800 shadow-md rounded-lg p-6 border border-gray-700">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 bg-gray-700 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Create Post Skeleton */}
          <div className="bg-gray-800 shadow-md rounded-lg p-4 animate-pulse border border-gray-700">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
              <div className="h-10 bg-gray-700 rounded flex-grow"></div>
            </div>
            <div className="h-10 bg-gray-700 rounded w-full"></div>
          </div>

          {/* Posts Skeleton */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-gray-800 shadow-md rounded-lg p-4 animate-pulse border border-gray-700"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-40"></div>
                  <div className="h-3 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
              <div className="h-48 bg-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Who to Follow Skeleton */}
        <div className="hidden md:block md:w-1/4 md:sticky md:top-24 animate-pulse">
          <div className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700">
            <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
