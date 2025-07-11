import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="container-mobile py-4 space-y-4">
          <div className="mobile-card">
            <CardHeader className="flex flex-row gap-3 px-0 py-0">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex gap-2 flex-col grow">
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Skeleton className="w-full h-48 rounded-xl" />
            </CardContent>
            <div className="px-0 pb-0">
              <div className="flex gap-6">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:block xl:hidden">
        <div className="container-mobile py-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="mobile-card">
              <CardHeader className="flex flex-row gap-3 px-0 py-0">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex gap-2 flex-col grow">
                  <div className="flex gap-2 items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <Skeleton className="w-full h-64 rounded-xl" />
              </CardContent>
              <div className="px-0 pb-0">
                <div className="flex gap-6">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="container-mobile py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar */}
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
            
            {/* Main Content */}
            <div className="col-span-6">
              <div className="mobile-card">
                <CardHeader className="flex flex-row gap-3 px-0 py-0">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex gap-2 flex-col grow">
                    <div className="flex gap-2 items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <Skeleton className="w-full h-64 rounded-xl" />
                </CardContent>
                <div className="px-0 pb-0">
                  <div className="flex gap-6">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-16" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar */}
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
};
