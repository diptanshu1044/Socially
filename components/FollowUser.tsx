import { FollowButton } from "./FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";

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
    <Card className="flex flex-row items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 mb-2">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback className="text-sm">
            {name
              ? name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
            @{username}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{followers} followers</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <FollowButton userId={id} />
      </div>
    </Card>
  );
};
