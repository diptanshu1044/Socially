import { getRandomUsers } from "@/actions/user.action";
import { FollowButton } from "./FollowButton";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export async function WhoToFollow() {
  const users = await getRandomUsers();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 lg:p-6 mobile-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
        <h3 className="text-base lg:text-lg font-semibold">Who to follow</h3>
      </div>
      <div className="space-y-3 lg:space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="text-xs lg:text-sm">
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs lg:text-sm truncate">{user.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
              <FollowButton userId={user.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
