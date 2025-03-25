import { getPosts } from "@/actions/post.action";
import { getDbUserId, getUser, syncUser } from "@/actions/user.action";
import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { ProfileCard } from "@/components/ProfileCard";
import { WhoToFollow } from "@/components/WhoToFollow";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const user = await getUser(userId);
  if (!user) await syncUser();
  const dbUserId = await getDbUserId();

  const posts = await getPosts();

  return (
    <div>
      <div className="flex p-8 gap-8 justify-center">
        <ProfileCard />
        <div className="w-1/3">
          <CreatePost />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))}
        </div>
        <div className="w-1/4">
          <WhoToFollow />
        </div>
      </div>
    </div>
  );
}
