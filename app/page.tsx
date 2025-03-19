import { getUser, syncUser } from "@/actions/user.action";
import { CreatePost } from "@/components/CreatePost";
import { Navbar } from "@/components/Navbar";
import { ProfileCard } from "@/components/ProfileCard";
import { WhoToFollow } from "@/components/WhoToFollow";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const user = await getUser(userId);
  if (!user) await syncUser();
  return (
    <div>
      <Navbar />
      <div className="flex p-8 gap-8 justify-center">
        <ProfileCard />
        <div className="w-1/3">
          <CreatePost />
        </div>
        <div className="w-1/4">
          <WhoToFollow />
        </div>
      </div>
    </div>
  );
}
