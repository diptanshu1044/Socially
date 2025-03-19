import { FollowButton } from "./FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export interface FollowUserProps {
  id: string;
  name: string;
  imageUrl: string;
  username: string;
  followers: number;
}

export const FollowUser = ({
  id,
  name,
  imageUrl,
  username,
  followers,
}: FollowUserProps) => {
  return (
    <Card className="flex flex-row px-4 py-2 justify-between border-0">
      <div className="grow flex flex-row">
        <div className="flex justify-center items-center">
          <Avatar>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <CardHeader className="grow">
          <CardTitle>{name}</CardTitle>
          <CardDescription>
            {username}
            <br />
            {followers} followers
          </CardDescription>
        </CardHeader>
      </div>
      <FollowButton userId={id} />
    </Card>
  );
};
