import { getRandomUsers } from "@/actions/user.action";
import { FollowButton } from "./FollowButton";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export async function WhoToFollow() {
  const users = await getRandomUsers();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Who to follow</h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/chat?user=${user.id}`}>
                <Button size="sm" variant="outline">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </Link>
              <FollowButton userId={user.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
