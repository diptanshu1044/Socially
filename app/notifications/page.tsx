"use client";
import {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationsCount,
  NotificationResponse,
} from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { 
  HeartIcon, 
  MessageCircleIcon, 
  UserPlusIcon, 
  BellIcon, 
  CheckIcon, 
  FilterIcon,
  Trash2Icon,
  Loader2Icon,
  CheckCheckIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

type Notification = NotificationResponse['notifications'][number];

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deletingNotifications, setDeletingNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const result = await getNotifications(1, 20);
        setNotifications(result.notifications);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
        setCurrentPage(1);

        // Mark notifications as read
        const unReadIds = result.notifications.filter((n) => !n.read).map((n) => n.id);
        if (unReadIds.length > 0) {
          await markNotificationsAsRead(unReadIds);
        }

        // Get unread count
        const unreadCount = await getUnreadNotificationsCount();
        setUnreadCount(unreadCount);
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const loadMoreNotifications = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await getNotifications(nextPage, 20);
      
      setNotifications(prev => [...prev, ...result.notifications]);
      setHasMore(result.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load more notifications");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark all notifications as read");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setDeletingNotifications(prev => new Set(prev).add(notificationId));
      const result = await deleteNotification(notificationId);
      
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setTotalCount(prev => prev - 1);
        if (!notifications.find(n => n.id === notificationId)?.read) {
          setUnreadCount(prev => prev - 1);
        }
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete notification");
    } finally {
      setDeletingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

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
          <div className="mobile-card border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellIcon className="size-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                    className="text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <FilterIcon className="size-3 mr-1" />
                    {filter === 'all' ? 'All' : 'Unread'}
                  </Button>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <CheckCheckIcon className="size-3 mr-1" />
                    Mark all as read
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                    <BellIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                    <p className="text-sm">
                      {filter === 'all' ? 'No notifications yet' : 'No unread notifications'}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          !notification.read ? "bg-slate-50 dark:bg-slate-700/30" : ""
                        }`}
                      >
                        <Avatar className="mt-1 flex-shrink-0">
                          <AvatarImage
                            src={notification.creator.image ?? "/avatar.png"}
                          />
                          <AvatarFallback className="text-xs font-medium bg-slate-100 dark:bg-slate-700">
                            {notification.creator.name
                              ? notification.creator.name[0]
                              : notification.creator.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getNotificationIcon(notification.type)}
                            <span className="text-sm text-slate-900 dark:text-slate-100">
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
                                <div className="text-xs text-slate-600 dark:text-slate-400 rounded-md p-2 bg-slate-100 dark:bg-slate-700 mt-2">
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
                                    <div className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-slate-700 dark:text-slate-300">
                                      {notification.comment.content}
                                    </div>
                                  )}
                              </div>
                            )}

                          <div className="flex items-center justify-between pl-6">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                              disabled={deletingNotifications.has(notification.id)}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              {deletingNotifications.has(notification.id) ? (
                                <Loader2Icon className="size-3 animate-spin" />
                              ) : (
                                <Trash2Icon className="size-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {hasMore && (
                      <div className="p-4 text-center">
                        <Button
                          variant="outline"
                          onClick={loadMoreNotifications}
                          disabled={loadingMore}
                          className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2Icon className="size-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </div>
                    )}
                  </>
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
            <div className="mobile-card border-0 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellIcon className="size-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <FilterIcon className="size-4 mr-1" />
                      {filter === 'all' ? 'All' : 'Unread'}
                    </Button>
                    {unreadCount > 0 && (
                      <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <CheckCheckIcon className="size-4 mr-1" />
                      Mark all as read
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[calc(100vh-240px)] overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                      <BellIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                      <p className="text-sm">
                        {filter === 'all' ? 'No notifications yet' : 'No unread notifications'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-4 p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                            !notification.read ? "bg-slate-50 dark:bg-slate-700/30" : ""
                          }`}
                        >
                          <Avatar className="mt-1 flex-shrink-0">
                            <AvatarImage
                              src={notification.creator.image ?? "/avatar.png"}
                            />
                            <AvatarFallback className="text-sm font-medium bg-slate-100 dark:bg-slate-700">
                              {notification.creator.name
                                ? notification.creator.name[0]
                                : notification.creator.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getNotificationIcon(notification.type)}
                              <span className="text-base text-slate-900 dark:text-slate-100">
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
                                  <div className="text-sm text-slate-600 dark:text-slate-400 rounded-md p-2 bg-slate-100 dark:bg-slate-700 mt-2">
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
                                      <div className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-slate-700 dark:text-slate-300">
                                        {notification.comment.content}
                                      </div>
                                    )}
                                </div>
                              )}

                            <div className="flex items-center justify-between pl-6">
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                disabled={deletingNotifications.has(notification.id)}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                {deletingNotifications.has(notification.id) ? (
                                  <Loader2Icon className="size-3 animate-spin" />
                                ) : (
                                  <Trash2Icon className="size-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {hasMore && (
                        <div className="p-4 text-center">
                          <Button
                            variant="outline"
                            onClick={loadMoreNotifications}
                            disabled={loadingMore}
                            className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            {loadingMore ? (
                              <>
                                <Loader2Icon className="size-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
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
            {/* Left Sidebar - Notification Stats */}
            <div className="col-span-3">
              <div className="sticky top-8 space-y-6">
                <div className="mobile-card border-0 shadow-sm bg-white dark:bg-slate-800">
                  <div className="text-center py-6">
                    <BellIcon className="size-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Notifications</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Stay updated with your activity
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{totalCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Unread</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{unreadCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mobile-card border-0 shadow-sm bg-white dark:bg-slate-800">
                  <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setFilter('all')}
                    >
                      <CheckIcon className="size-4 mr-2" />
                      View All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setFilter('unread')}
                    >
                      <FilterIcon className="size-4 mr-2" />
                      Unread Only
                    </Button>
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={handleMarkAllAsRead}
                      >
                        <CheckCheckIcon className="size-4 mr-2" />
                        Mark All as Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="col-span-6">
              <div className="mobile-card border-0 shadow-sm bg-white dark:bg-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellIcon className="size-5 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notifications</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <FilterIcon className="size-4 mr-1" />
                        {filter === 'all' ? 'All' : 'Unread'}
                      </Button>
                      {unreadCount > 0 && (
                        <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <CheckCheckIcon className="size-4 mr-1" />
                        Mark all as read
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                        <BellIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                        <p className="text-sm">
                          {filter === 'all' ? 'No notifications yet' : 'No unread notifications'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start gap-4 p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                              !notification.read ? "bg-slate-50 dark:bg-slate-700/30" : ""
                            }`}
                          >
                            <Avatar className="mt-1 flex-shrink-0">
                              <AvatarImage
                                src={notification.creator.image ?? "/avatar.png"}
                              />
                              <AvatarFallback className="text-sm font-medium bg-slate-100 dark:bg-slate-700">
                                {notification.creator.name
                                  ? notification.creator.name[0]
                                  : notification.creator.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getNotificationIcon(notification.type)}
                                <span className="text-base text-slate-900 dark:text-slate-100">
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
                                    <div className="text-sm text-slate-600 dark:text-slate-400 rounded-md p-2 bg-slate-100 dark:bg-slate-700 mt-2">
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
                                        <div className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-slate-700 dark:text-slate-300">
                                          {notification.comment.content}
                                        </div>
                                      )}
                                  </div>
                                )}

                              <div className="flex items-center justify-between pl-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                  })}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  disabled={deletingNotifications.has(notification.id)}
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  {deletingNotifications.has(notification.id) ? (
                                    <Loader2Icon className="size-3 animate-spin" />
                                  ) : (
                                    <Trash2Icon className="size-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {hasMore && (
                          <div className="p-4 text-center">
                            <Button
                              variant="outline"
                              onClick={loadMoreNotifications}
                              disabled={loadingMore}
                              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              {loadingMore ? (
                                <>
                                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                'Load More'
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </ScrollArea>
                </CardContent>
              </div>
            </div>
            
            {/* Right Sidebar - Notification Types */}
            <div className="col-span-3">
              <div className="sticky top-8">
                <div className="mobile-card border-0 shadow-sm bg-white dark:bg-slate-800">
                  <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <HeartIcon className="size-4 text-red-500" />
                      <span className="text-slate-900 dark:text-slate-100">Likes</span>
                      <span className="ml-auto text-slate-600 dark:text-slate-400">
                        {notifications.filter(n => n.type === 'LIKE').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircleIcon className="size-4 text-blue-500" />
                      <span className="text-slate-900 dark:text-slate-100">Comments</span>
                      <span className="ml-auto text-slate-600 dark:text-slate-400">
                        {notifications.filter(n => n.type === 'COMMENT').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserPlusIcon className="size-4 text-green-500" />
                      <span className="text-slate-900 dark:text-slate-100">Follows</span>
                      <span className="ml-auto text-slate-600 dark:text-slate-400">
                        {notifications.filter(n => n.type === 'FOLLOW').length}
                      </span>
                    </div>
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
