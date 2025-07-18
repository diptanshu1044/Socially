"use client";
import {
  getNotifications,
  markNotificationsAsRead,
} from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type Notification = Notifications[number];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <HeartIcon className="size-4 text-red-500" />;
    case "COMMENT":
      return <MessageCircleIcon className="size-4 text-blue-500" />;
    case "FOLLOW":
      return <UserPlusIcon className="size-4 text-green-500" />;
    default:
      return null;
  }
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notifications = await getNotifications();
        setNotifications(notifications);

        const unReadIds = notifications.filter((n) => !n.read).map((n) => n.id);
        if (unReadIds.length > 0) {
          await markNotificationsAsRead(unReadIds);
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container-mobile py-4">
          <NotificationsSkeleton />
        </div>
      </div>
    );
    
  return (
    <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="container-mobile py-4 space-y-4">
          <div className="mobile-card">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {notifications.filter((n) => !n.read).length} unread
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 border-b hover:bg-muted/25 transition-colors ${
                        !notification.read ? "bg-muted/50" : ""
                      }`}
                    >
                      <Avatar className="mt-1 flex-shrink-0">
                        <AvatarImage
                          src={notification.creator.image ?? "/avatar.png"}
                        />
                        <AvatarFallback>
                          {notification.creator.name
                            ? notification.creator.name[0]
                            : notification.creator.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getNotificationIcon(notification.type)}
                          <span className="text-sm">
                            <span className="font-medium">
                              {notification.creator.name ??
                                notification.creator.username}
                            </span>{" "}
                            {notification.type === "FOLLOW"
                              ? "started following you"
                              : notification.type === "LIKE"
                                ? "liked your post"
                                : "commented on your post"}
                          </span>
                        </div>

                        {notification.post &&
                          (notification.type === "LIKE" ||
                            notification.type === "COMMENT") && (
                            <div className="pl-6 space-y-2">
                              <div className="text-xs text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                                <p className="line-clamp-2">{notification.post.content}</p>
                                {notification.post.image && (
                                  <Image
                                    src={notification.post.image}
                                    alt="Post content"
                                    className="mt-2 rounded-md w-full max-w-[150px] h-auto object-cover"
                                    width={200}
                                    height={200}
                                  />
                                )}
                              </div>

                              {notification.type === "COMMENT" &&
                                notification.comment && (
                                  <div className="text-xs p-2 bg-accent/50 rounded-md">
                                    {notification.comment.content}
                                  </div>
                                )}
                            </div>
                          )}

                        <p className="text-xs text-muted-foreground pl-6">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:block xl:hidden">
        <div className="container-mobile py-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="mobile-card">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {notifications.filter((n) => !n.read).length} unread
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[calc(100vh-240px)] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                          !notification.read ? "bg-muted/50" : ""
                        }`}
                      >
                        <Avatar className="mt-1 flex-shrink-0">
                          <AvatarImage
                            src={notification.creator.image ?? "/avatar.png"}
                          />
                          <AvatarFallback>
                            {notification.creator.name
                              ? notification.creator.name[0]
                              : notification.creator.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getNotificationIcon(notification.type)}
                            <span className="text-base">
                              <span className="font-medium">
                                {notification.creator.name ??
                                  notification.creator.username}
                              </span>{" "}
                              {notification.type === "FOLLOW"
                                ? "started following you"
                                : notification.type === "LIKE"
                                  ? "liked your post"
                                  : "commented on your post"}
                            </span>
                          </div>

                          {notification.post &&
                            (notification.type === "LIKE" ||
                              notification.type === "COMMENT") && (
                              <div className="pl-6 space-y-2">
                                <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                                  <p className="line-clamp-2">{notification.post.content}</p>
                                  {notification.post.image && (
                                    <Image
                                      src={notification.post.image}
                                      alt="Post content"
                                      className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                                      width={200}
                                      height={200}
                                    />
                                  )}
                                </div>

                                {notification.type === "COMMENT" &&
                                  notification.comment && (
                                    <div className="text-sm p-2 bg-accent/50 rounded-md">
                                      {notification.comment.content}
                                    </div>
                                  )}
                              </div>
                            )}

                          <p className="text-sm text-muted-foreground pl-6">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="container-mobile py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Empty for now */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <div className="mobile-card">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {notifications.filter((n) => !n.read).length} unread notifications
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="col-span-6">
              <div className="mobile-card">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {notifications.filter((n) => !n.read).length} unread
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                            !notification.read ? "bg-muted/50" : ""
                          }`}
                        >
                          <Avatar className="mt-1 flex-shrink-0">
                            <AvatarImage
                              src={notification.creator.image ?? "/avatar.png"}
                            />
                            <AvatarFallback>
                              {notification.creator.name
                                ? notification.creator.name[0]
                                : notification.creator.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getNotificationIcon(notification.type)}
                              <span className="text-base">
                                <span className="font-medium">
                                  {notification.creator.name ??
                                    notification.creator.username}
                                </span>{" "}
                                {notification.type === "FOLLOW"
                                  ? "started following you"
                                  : notification.type === "LIKE"
                                    ? "liked your post"
                                    : "commented on your post"}
                              </span>
                            </div>

                            {notification.post &&
                              (notification.type === "LIKE" ||
                                notification.type === "COMMENT") && (
                                <div className="pl-6 space-y-2">
                                  <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                                    <p className="line-clamp-2">{notification.post.content}</p>
                                    {notification.post.image && (
                                      <Image
                                        src={notification.post.image}
                                        alt="Post content"
                                        className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                                        width={200}
                                        height={200}
                                      />
                                    )}
                                  </div>

                                  {notification.type === "COMMENT" &&
                                    notification.comment && (
                                      <div className="text-sm p-2 bg-accent/50 rounded-md">
                                        {notification.comment.content}
                                      </div>
                                    )}
                                </div>
                              )}

                            <p className="text-sm text-muted-foreground pl-6">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </CardContent>
              </div>
            </div>
            
            {/* Right Sidebar - Empty for now */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <div className="mobile-card">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                    <p className="text-sm text-muted-foreground">
                      Mark all as read, filter notifications, etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
