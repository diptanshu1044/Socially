import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsSkeleton() {
  // array of 5 items
  const skeletonItems = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="container-mobile py-4 space-y-4">
          <div className="mobile-card">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {skeletonItems.map((index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border-b">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="pl-6 space-y-2">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:block xl:hidden">
        <div className="container-mobile py-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="mobile-card">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[calc(100vh-240px)] overflow-y-auto">
                  {skeletonItems.map((index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border-b">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="pl-6 space-y-2">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="container-mobile py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Empty for now */}
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
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    {skeletonItems.map((index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border-b">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                          <div className="pl-6 space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
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
