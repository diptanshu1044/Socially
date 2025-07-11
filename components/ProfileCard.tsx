import {
  Card,
  CardTitle,
  CardAction,
  CardFooter,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@clerk/nextjs/server";
import { getUser } from "@/actions/user.action";
import { Link as LinkIcon, MapPin, Pencil, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

type User = Awaited<ReturnType<typeof getUser>> & {
  _count?: {
    following: number;
    followers: number;
  };
};

export const ProfileCard = async () => {
  const { userId } = await auth();
  const user: User = await getUser(userId);
  if (!user)
    return (
      <div className="flex justify-center lg:justify-start items-center lg:items-start">
        <UnAuthenticatedSidebar />
      </div>
    );

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800 mobile-card">
      <CardHeader className="flex flex-col justify-center items-center text-center pb-4">
        <div className="relative">
          <Avatar className="h-14 w-14 lg:h-16 lg:w-16 xl:h-20 xl:w-20">
            <AvatarImage src={user?.image as string} />
            <AvatarFallback className="text-sm lg:text-lg">
              {user?.name?.split(" ")[0][0] ?? ""}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/profile/${user.username}`}
            className="absolute -top-1 -right-1"
          >
            <Button className="h-6 w-6 lg:h-8 lg:w-8 rounded-full p-0 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 min-h-[24px] min-w-[24px] lg:min-h-[32px] lg:min-w-[32px]">
              <Pencil className="w-3 h-3 lg:w-4 lg:h-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </Link>
        </div>
        <CardTitle className="text-base lg:text-lg xl:text-xl pt-3 font-semibold">{user?.name}</CardTitle>
        <CardDescription className="flex flex-col justify-center items-center text-slate-600 dark:text-slate-400">
          <h4 className="text-sm lg:text-base font-medium text-slate-900 dark:text-slate-100">@{user?.username}</h4>
          <p className="text-xs lg:text-sm mt-1 max-w-xs line-clamp-2">{user?.bio ? user?.bio : "No bio yet"}</p>
        </CardDescription>
      </CardHeader>
      
      <Separator className="bg-slate-200 dark:bg-slate-700" />
      
      <CardContent className="flex justify-between items-center font-light py-4">
        <div className="text-center">
          <div className="text-base lg:text-lg font-semibold text-slate-900 dark:text-slate-100">{user?._count?.followers || 0}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-base lg:text-lg font-semibold text-slate-900 dark:text-slate-100">{user?._count?.following || 0}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Following</div>
        </div>
      </CardContent>
      
      <Separator className="bg-slate-200 dark:bg-slate-700" />
      
      <CardFooter className="flex flex-col items-center gap-3 py-4">
        {user.location && (
          <CardAction className="flex justify-center items-center gap-2 text-xs lg:text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="truncate">{user.location}</span>
          </CardAction>
        )}
        {user.website && (
          <CardAction className="flex justify-center items-center gap-2 text-xs lg:text-sm">
            <LinkIcon className="w-3 h-3 lg:w-4 lg:h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
            <Link
              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {user.website}
            </Link>
          </CardAction>
        )}
      </CardFooter>
    </Card>
  );
};

const UnAuthenticatedSidebar = () => (
  <Card className="w-full border-0 shadow-sm bg-white dark:bg-slate-800 mobile-card">
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <User className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
      </div>
      <CardTitle className="text-lg lg:text-xl font-semibold">
        Welcome to Socially!
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-center text-slate-600 dark:text-slate-400 text-xs lg:text-sm">
        Join our community to connect with friends and share your moments.
      </p>
      <div className="space-y-3">
        <SignInButton mode="modal">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 min-h-[44px]" variant="default">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full min-h-[44px]" variant="outline">
            Create Account
          </Button>
        </SignUpButton>
      </div>
    </CardContent>
  </Card>
);
