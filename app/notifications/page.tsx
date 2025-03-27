"use client";
import {
  getNotifications,
  markNotificationsAsRead,
} from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="mx-10 my-10 rounded-lg">
        <NotificationsSkeleton />
      </div>
    );
  return (
    <>
      <div className="space-y-4 mx-10 my-10 rounded-lg">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <span className="text-sm text-muted-foreground">
                {notifications.filter((n) => !n.read).length} unread
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[calc(100vh-18rem)] overflow-y-auto">
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
                    <Avatar className="mt-1">
                      <AvatarImage
                        src={notification.creator.image ?? "/avatar.png"}
                      />
                      <AvatarFallback>
                        {notification.creator.name
                          ? notification.creator.name[0]
                          : notification.creator.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <span>
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
                              <p>{notification.post.content}</p>
                              {notification.post.image && (
                                <Image
                                  src={notification.post.image}
                                  alt="Post content"
                                  className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
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
        </Card>
      </div>
    </>
  );
}
