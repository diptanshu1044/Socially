import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import ProfilePageClient from "@/components/ProfilePageClient";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  const user = await getProfileByUsername(params.username);
  console.log(user);
  if (!user) return null;
  return {
    title: `Profile - ${user.name || user.username}`,
    description: `Profile page for ${user.name || user.username}`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await getProfileByUsername(username);
  if (!user) return notFound();

  const [posts, likedPosts, isUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isUserFollowing={isUserFollowing}
    />
  );
}

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;
type LikedPosts = Awaited<ReturnType<typeof getUserLikedPosts>>;
type IsFollowing = Awaited<ReturnType<typeof isFollowing>>;

export type ProfilePageClientProps = {
  user: User;
  posts: Posts;
  likedPosts: LikedPosts;
  isUserFollowing: IsFollowing;
};
