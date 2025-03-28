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
import { Link as LinkIcon, MapPin, Pencil } from "lucide-react";
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
      <div className="flex justify-center md:justify-start items-center md:items-start md:sticky md:top-24">
        <UnAuthenticatedSidebar />
      </div>
    );

  return (
    <Card className="h-[25.5rem] max-w-[23rem] md:w-[21rem] p-8  md:sticky md:top-24 relative">
      <CardHeader className="flex flex-col justify-center items-center">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.image as string} />
          <AvatarFallback>{user?.name?.split(" ")[0][0] ?? ""}</AvatarFallback>
        </Avatar>
        <Link
          href={`/profile/${user.username}`}
          className="absolute top-3 right-3"
        >
          <Button className="mt-2" variant="ghost">
            <Pencil className=" opacity-60 w-6 h-6" />
          </Button>
        </Link>
        <CardTitle className="text-xl pt-3">{user?.name}</CardTitle>
        <CardDescription className="flex flex-col justify-center items-center">
          <h4 className="text-lg">{user?.username}</h4>
          <p className="">{user?.bio ? user?.bio : "No Bio"}</p>
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="flex justify-between items-center font-light">
        <CardAction>Followers: {user?._count.following}</CardAction>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <CardAction>Following: {user?._count.followers}</CardAction>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col items-center gap-4 font-light">
        <CardAction className="flex justify-center items-center gap-1">
          <MapPin className="text-gray-100" />
          {user.location ? user.location : "No location"}
        </CardAction>
        <CardAction className="flex justify-center items-center gap-1">
          <LinkIcon className="text-gray-100" />
          <Link
            className="font-light"
            href={user?.website ? user?.website : ""}
            target="_blank"
          >
            {user.website ? user.website : "No website"}
          </Link>
        </CardAction>
      </CardFooter>
    </Card>
  );
};

const UnAuthenticatedSidebar = () => (
  <Card className="w-full md:sticky md:top-24 relative max-w-[25rem] md:max-w-[18rem] h-64">
    <CardHeader>
      <CardTitle className="text-center text-xl font-semibold">
        Welcome Back!
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-center text-muted-foreground mb-4">
        Login to access your profile and connect with others.
      </p>
      <SignInButton mode="modal">
        <Button className="w-full" variant="outline">
          Login
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button className="w-full mt-2" variant="default">
          Sign Up
        </Button>
      </SignUpButton>
    </CardContent>
  </Card>
);
