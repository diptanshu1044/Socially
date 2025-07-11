import { getPosts } from "@/actions/post.action";
import { getDbUserId, getUser, syncUser } from "@/actions/user.action";
import { CreatePost } from "@/components/CreatePost";
import { PostFeed } from "@/components/PostFeed";
import { ProfileCard } from "@/components/ProfileCard";
import { WhoToFollow } from "@/components/WhoToFollow";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const user = await getUser(userId);
  if (!user) await syncUser();
  const dbUserId = await getDbUserId();

  const initialPosts = await getPosts({ page: 1, limit: 10 });

  return (
    <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="container-mobile py-4 space-y-4">
          {/* Profile Section - Mobile */}
          <div className="mobile-card">
            <ProfileCard />
          </div>
          
          {/* Create Post - Mobile */}
          <div className="mobile-card">
            <CreatePost />
          </div>
          
          {/* Posts Feed - Mobile */}
          <div className="space-y-4">
            <PostFeed
              initialPosts={initialPosts.posts}
              initialHasMore={initialPosts.hasMore}
              dbUserId={dbUserId}
            />
          </div>
        </div>
        
        {/* Floating Action Button for Mobile */}
        <FloatingActionButton />
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:block xl:hidden">
        <div className="container-mobile py-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Section - Tablet */}
            <div className="mobile-card">
              <ProfileCard />
            </div>
            
            {/* Main Content - Tablet */}
            <div className="space-y-6">
              <div className="mobile-card">
                <CreatePost />
              </div>
              <PostFeed
                initialPosts={initialPosts.posts}
                initialHasMore={initialPosts.hasMore}
                dbUserId={dbUserId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="container-mobile py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Profile */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <ProfileCard />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="col-span-6 space-y-6">
              <CreatePost />
              <PostFeed
                initialPosts={initialPosts.posts}
                initialHasMore={initialPosts.hasMore}
                dbUserId={dbUserId}
              />
            </div>
            
            {/* Right Sidebar - Who to Follow */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <WhoToFollow />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
