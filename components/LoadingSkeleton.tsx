import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const LoadingSkeleton = () => {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mb-4">
      <CardHeader className="flex flex-row gap-3 px-4 py-4">
        <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
        <div className="flex gap-2 flex-col grow">
          <div className="flex gap-2 items-center">
            <Skeleton className="h-4 w-24 md:w-32" />
            <Skeleton className="h-3 w-16 md:w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Skeleton className="w-full h-48 md:h-64 rounded-xl" />
      </CardContent>
      <div className="px-4 pb-4">
        <div className="flex gap-6">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </Card>
  );
};
