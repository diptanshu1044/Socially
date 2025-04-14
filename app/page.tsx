import { getPosts } from "@/actions/post.action";
import { getDbUserId, getUser, syncUser } from "@/actions/user.action";
import { CreatePost } from "@/components/CreatePost";
import { PostFeed } from "@/components/PostFeed";
import { ProfileCard } from "@/components/ProfileCard";
import { WhoToFollow } from "@/components/WhoToFollow";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const user = await getUser(userId);
  if (!user) await syncUser();
  const dbUserId = await getDbUserId();

  const initialPosts = await getPosts({ page: 1, limit: 10 });

  return (
    <div>
      <div className="flex flex-col md:flex-row p-4 md:p-8 gap-8 justify-center items-center md:items-start">
        <ProfileCard />
        <div className="w-full md:w-1/3">
          <CreatePost />
          <PostFeed
            initialPosts={initialPosts.posts}
            initialHasMore={initialPosts.hasMore}
            dbUserId={dbUserId}
          />
        </div>
        <div className="hidden md:block md:w-1/4 md:sticky md:top-24">
          <WhoToFollow />
        </div>
      </div>
    </div>
  );
}
