import { getRandomUsers } from "@/actions/user.action";
import { FollowUser } from "./FollowUser";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const WhoToFollow = async () => {
  const randomUsers = await getRandomUsers();
  return (
    <Card className="w-full sticky top-24">
      <CardHeader>
        <CardTitle> Who to follow </CardTitle>
      </CardHeader>
      <CardContent>
        {randomUsers.map((user, index) => (
          <FollowUser
            key={index}
            id={user.id}
            name={user.name || ""}
            username={user.username}
            imageUrl={user.image || ""}
            followers={user._count.following}
          />
        ))}
      </CardContent>
    </Card>
  );
};
