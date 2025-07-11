"use client";

import { ProfilePageClientProps } from "@/app/profile/[username]/page";
import { updateProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import { PostCard } from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

function ProfilePageClient({
  isUserFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });

  if (!user) return null;

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user ? user.id : "");
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.log("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="container-mobile py-4 space-y-4">
          {/* Profile Card - Mobile */}
          <div className="mobile-card">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.image ?? "/avatar.png"} />
              </Avatar>
              <h1 className="mt-4 text-xl font-bold">
                {user.name ?? user.username}
              </h1>
              <p className="text-muted-foreground text-sm">@{user.username}</p>
              <p className="mt-2 text-sm">{user.bio}</p>

              {/* Profile Stats - Mobile */}
              <div className="w-full mt-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="font-semibold text-sm">
                      {user._count.following.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Following
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <div className="font-semibold text-sm">
                      {user._count.followers.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Followers
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  <div>
                    <div className="font-semibold text-sm">
                      {user._count.posts.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              {!currentUser ? (
                <SignInButton mode="modal">
                  <Button className="w-full mt-4 min-h-[44px]">Follow</Button>
                </SignInButton>
              ) : isOwnProfile ? (
                <Button
                  className="w-full mt-4 min-h-[44px]"
                  onClick={() => setShowEditDialog(true)}
                >
                  <EditIcon className="size-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="w-full mt-4 space-y-2">
                  <Button
                    className="w-full min-h-[44px]"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                  <Link href={`/chat?user=${user.id}`}>
                    <Button className="w-full min-h-[44px]" variant="outline">
                      <MessageCircle className="size-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                </div>
              )}

              {/* Location & Website - Mobile */}
              <div className="w-full mt-6 space-y-2 text-xs">
                {user.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPinIcon className="size-4 mr-2" />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center text-muted-foreground">
                    <LinkIcon className="size-4 mr-2" />
                    <a
                      href={
                        user.website.startsWith("http")
                          ? user.website
                          : `https://${user.website}`
                      }
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-muted-foreground">
                  <CalendarIcon className="size-4 mr-2" />
                  Joined {formattedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Posts and Likes Tabs - Mobile */}
          <div className="mobile-card">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="posts"
                  className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                   data-[state=active]:bg-transparent px-4 font-semibold text-sm min-h-[44px]"
                >
                  <FileTextIcon className="size-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="likes"
                  className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                   data-[state=active]:bg-transparent px-4 font-semibold text-sm min-h-[44px]"
                >
                  <HeartIcon className="size-4" />
                  Likes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6">
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard key={post.id} post={post} dbUserId={user.id} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts yet
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="likes" className="mt-6">
                <div className="space-y-4">
                  {likedPosts.length > 0 ? (
                    likedPosts.map((post) => (
                      <PostCard key={post.id} post={post} dbUserId={user.id} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No liked posts to show
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:block xl:hidden">
        <div className="container-mobile py-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Card - Tablet */}
            <div className="mobile-card">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
                  {user.name ?? user.username}
                </h1>
                <p className="text-muted-foreground text-base">@{user.username}</p>
                <p className="mt-2 text-base">{user.bio}</p>

                {/* Profile Stats - Tablet */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="font-semibold text-base">
                        {user._count.following.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Following
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold text-base">
                        {user._count.followers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Followers
                      </div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold text-base">
                        {user._count.posts.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Tablet */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4 min-h-[44px]">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button
                    className="w-full mt-4 min-h-[44px]"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <EditIcon className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="w-full mt-4 space-y-2">
                    <Button
                      className="w-full min-h-[44px]"
                      onClick={handleFollow}
                      disabled={isUpdatingFollow}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Link href={`/chat?user=${user.id}`}>
                      <Button className="w-full min-h-[44px]" variant="outline">
                        <MessageCircle className="size-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Location & Website - Tablet */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http")
                            ? user.website
                            : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Posts and Likes Tabs - Tablet */}
            <div className="mobile-card">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="posts"
                    className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                     data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
                  >
                    <FileTextIcon className="size-4" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="likes"
                    className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                     data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
                  >
                    <HeartIcon className="size-4" />
                    Likes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6">
                  <div className="space-y-6">
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard key={post.id} post={post} dbUserId={user.id} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No posts yet
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="likes" className="mt-6">
                  <div className="space-y-6">
                    {likedPosts.length > 0 ? (
                      likedPosts.map((post) => (
                        <PostCard key={post.id} post={post} dbUserId={user.id} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No liked posts to show
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
                <div className="mobile-card">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.image ?? "/avatar.png"} />
                    </Avatar>
                    <h1 className="mt-4 text-2xl font-bold">
                      {user.name ?? user.username}
                    </h1>
                    <p className="text-muted-foreground text-base">@{user.username}</p>
                    <p className="mt-2 text-base">{user.bio}</p>

                    {/* Profile Stats - Desktop */}
                    <div className="w-full mt-6">
                      <div className="flex justify-between mb-4">
                        <div>
                          <div className="font-semibold text-base">
                            {user._count.following.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Following
                          </div>
                        </div>
                        <Separator orientation="vertical" />
                        <div>
                          <div className="font-semibold text-base">
                            {user._count.followers.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Followers
                          </div>
                        </div>
                        <Separator orientation="vertical" />
                        <div>
                          <div className="font-semibold text-base">
                            {user._count.posts.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">Posts</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Desktop */}
                    {!currentUser ? (
                      <SignInButton mode="modal">
                        <Button className="w-full mt-4 min-h-[44px]">Follow</Button>
                      </SignInButton>
                    ) : isOwnProfile ? (
                      <Button
                        className="w-full mt-4 min-h-[44px]"
                        onClick={() => setShowEditDialog(true)}
                      >
                        <EditIcon className="size-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="w-full mt-4 space-y-2">
                        <Button
                          className="w-full min-h-[44px]"
                          onClick={handleFollow}
                          disabled={isUpdatingFollow}
                          variant={isFollowing ? "outline" : "default"}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                        <Link href={`/chat?user=${user.id}`}>
                          <Button className="w-full min-h-[44px]" variant="outline">
                            <MessageCircle className="size-4 mr-2" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* Location & Website - Desktop */}
                    <div className="w-full mt-6 space-y-2 text-sm">
                      {user.location && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPinIcon className="size-4 mr-2" />
                          {user.location}
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center text-muted-foreground">
                          <LinkIcon className="size-4 mr-2" />
                          <a
                            href={
                              user.website.startsWith("http")
                                ? user.website
                                : `https://${user.website}`
                            }
                            className="hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {user.website}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <CalendarIcon className="size-4 mr-2" />
                        Joined {formattedDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content - Posts and Likes */}
            <div className="col-span-6">
              <div className="mobile-card">
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger
                      value="posts"
                      className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                       data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
                    >
                      <FileTextIcon className="size-4" />
                      Posts
                    </TabsTrigger>
                    <TabsTrigger
                      value="likes"
                      className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                       data-[state=active]:bg-transparent px-6 font-semibold text-base min-h-[44px]"
                    >
                      <HeartIcon className="size-4" />
                      Likes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="posts" className="mt-6">
                    <div className="space-y-6">
                      {posts.length > 0 ? (
                        posts.map((post) => (
                          <PostCard key={post.id} post={post} dbUserId={user.id} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No posts yet
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="likes" className="mt-6">
                    <div className="space-y-6">
                      {likedPosts.length > 0 ? (
                        likedPosts.map((post) => (
                          <PostCard key={post.id} post={post} dbUserId={user.id} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No liked posts to show
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Right Sidebar - Empty for now */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <div className="mobile-card">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      View posts and likes from this user
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) =>
                  setEditForm({ ...editForm, website: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default ProfilePageClient;
