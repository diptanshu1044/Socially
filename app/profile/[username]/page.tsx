import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import ProfilePageClient from "@/components/ProfilePageClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  console.log(user);
  if (!user) return {};
  return {
    title: `Profile - ${user.name || user.username}`,
    description: `Profile page for ${user.name || user.username}`,
  };
}

// Use Next.js built-in types for dynamic routes
export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
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
