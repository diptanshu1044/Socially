"use client";

import  ModeToggle  from "@/components/ModeToggle";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Bell, MessageCircle, Home, Menu, Settings, LogOut, User as UserIcon, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getUnreadNotificationsCount, getUnreadMessagesCount } from "@/actions/notification.action";
import notificationSocketService from "@/lib/socket-notifications";
import { useAuth } from "@clerk/nextjs";

export function Navbar() {
  const { user } = useUser();
  const { userId, getToken } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          // Fetch user details to get username
          const userResponse = await fetch(`/api/users/${data.userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (user) {
      fetchCurrentUser();
    }
  }, [user]);

  // Fetch initial notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        console.log('🔍 Fetching initial notification count for user:', userId);
        const count = await getUnreadNotificationsCount();
        console.log('📊 Initial notification count:', count);
        setNotificationCount(count);
      } catch (error) {
        console.error('❌ Error fetching notification count:', error);
      }
    };

    if (userId) {
      fetchNotificationCount();
    }
  }, [userId]);

  // Socket connection and real-time updates
  useEffect(() => {
    const connectSocket = async () => {
      if (userId) {
        try {
          console.log('🔌 Connecting to socket for user:', userId);
          const token = await getToken();
          if (token) {
            await notificationSocketService.connect(userId, token);
            console.log('✅ Socket connection initiated for user:', userId);
          }
        } catch (error) {
          console.error('❌ Failed to connect to socket:', error);
        }
      }
    };

    connectSocket();

    // Set up socket event listeners for notification count
    const handleNewNotification = (notification: any) => {
      console.log('🔔 New notification received in Navbar:', notification);
      setNotificationCount(prev => {
        const newCount = prev + 1;
        console.log('📊 Updated notification count in Navbar:', newCount);
        return newCount;
      });
    };

    const handleNotificationsRead = (data: { notificationIds: string[] }) => {
      console.log('✅ Notifications marked as read in Navbar:', data.notificationIds.length);
      setNotificationCount(prev => {
        const newCount = Math.max(0, prev - data.notificationIds.length);
        console.log('📊 Updated notification count after read in Navbar:', newCount);
        return newCount;
      });
    };

    const handleNotificationDeleted = (data: { notificationId: string }) => {
      // We don't need to update count here as it's handled by the notifications page
      console.log('🗑️ Notification deleted in Navbar:', data.notificationId);
    };

    const handleNotificationsCount = (data: { unreadCount: number }) => {
      console.log('📊 Notifications count update from socket in Navbar:', data.unreadCount);
      setNotificationCount(data.unreadCount);
    };

    // Set up socket event listeners for message count
    const handleNewMessage = (message: any) => {
      console.log('💬 New message received in Navbar:', message);
      // Only increment if the message is not from the current user
      if (message.senderId !== userId) {
        setMessageCount(prev => {
          const newCount = prev + 1;
          console.log('📱 Updated message count in Navbar:', newCount);
          return newCount;
        });
      }
    };

    const handleMessagesRead = (data: { conversationId: string, messageIds: string[] }) => {
      console.log('✅ Messages marked as read in Navbar:', data.messageIds.length);
      // Decrement by the number of messages that were read
      setMessageCount(prev => {
        const newCount = Math.max(0, prev - data.messageIds.length);
        console.log('📱 Updated message count after read in Navbar:', newCount);
        return newCount;
      });
    };

    // Add event listeners
    notificationSocketService.on('new-notification', handleNewNotification);
    notificationSocketService.on('notifications-read', handleNotificationsRead);
    notificationSocketService.on('notification-deleted', handleNotificationDeleted);
    notificationSocketService.on('notifications-count', handleNotificationsCount);
    notificationSocketService.on('new-message', handleNewMessage);
    notificationSocketService.on('messages-read', handleMessagesRead);

    // Debug socket connection
    notificationSocketService.on('socket-connected', () => {
      console.log('🔌 Navbar: Socket connected successfully');
      // Fetch notification count again after socket connects
      const fetchCount = async () => {
        try {
          const count = await getUnreadNotificationsCount();
          console.log('📊 Notification count after socket connect:', count);
          setNotificationCount(count);
        } catch (error) {
          console.error('❌ Error fetching count after socket connect:', error);
        }
      };
      fetchCount();
    });

    notificationSocketService.on('socket-disconnected', () => {
      console.log('🔌 Navbar: Socket disconnected');
    });

    notificationSocketService.on('socket-error', (error) => {
      console.error('🔌 Navbar: Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      notificationSocketService.off('new-notification', handleNewNotification);
      notificationSocketService.off('notifications-read', handleNotificationsRead);
      notificationSocketService.off('notification-deleted', handleNotificationDeleted);
      notificationSocketService.off('notifications-count', handleNotificationsCount);
      notificationSocketService.off('new-message', handleNewMessage);
      notificationSocketService.off('messages-read', handleMessagesRead);
      notificationSocketService.off('socket-connected', () => {});
      notificationSocketService.off('socket-disconnected', () => {});
      notificationSocketService.off('socket-error', () => {});
    };
  }, [userId, getToken]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch unread messages count
        const unreadMessagesCount = await getUnreadMessagesCount();
        console.log('📱 Unread messages count:', unreadMessagesCount);
        setMessageCount(unreadMessagesCount);
        
        // Also refresh notification count periodically
        if (userId) {
          const notificationCount = await getUnreadNotificationsCount();
          console.log('🔄 Periodic notification count refresh:', notificationCount);
          setNotificationCount(notificationCount);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const handleNavigation = () => {
    setSheetOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-40">
        <div className="container-mobile">
          <div className="flex justify-between items-center h-20">
            {/* Left side - Socially logo */}
            <div className="flex items-center justify-center">
              <Link href="/" className="flex items-center justify-center">
                <h1 className="text-2xl font-bold">Socially</h1>
              </Link>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/find-friends">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="relative">
                  <MessageCircle className="w-4 h-4" />
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </Link>

              <ModeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                    <UserIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={currentUser ? `/profile/${currentUser.username}` : "#"} className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                      {notificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/chat" className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                      {messageCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                          {messageCount > 9 ? '9+' : messageCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/find-friends" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Find Friends</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 safe-padding">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left side - Mode toggle */}
          <div className="flex items-center">
            <ModeToggle />
          </div>

          {/* Center - Socially logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/">
              <h1 className="text-lg font-bold">Socially</h1>
            </Link>
          </div>

          {/* Right side - Menu button */}
          <div className="flex items-center">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col space-y-1">
                      <h2 className="text-lg font-semibold">{user?.fullName || 'User'}</h2>
                      <p className="text-sm text-muted-foreground">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-2">
                    <Link href="/" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                    <Link href={currentUser ? `/profile/${currentUser.username}` : "#"} onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <UserIcon className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link href="/chat" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                      <MessageCircle className="w-5 h-5" />
                      <span>Messages</span>
                      {messageCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                          {messageCount > 9 ? '9+' : messageCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/notifications" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                      {notificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/find-friends" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Users className="w-5 h-5" />
                      <span>Find Friends</span>
                    </Link>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                    <Link href="/settings" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
                      <LogOut className="w-5 h-5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 safe-padding">
        <div className="flex items-center justify-around py-3">
          <Link href="/" className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] justify-center">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          
          <Link href="/chat" className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative min-h-[44px] min-w-[44px] justify-center">
            <MessageCircle className="w-6 h-6 mb-1" />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {messageCount > 9 ? '9+' : messageCount}
              </span>
            )}
            <span className="text-xs">Chat</span>
          </Link>
          
          <Link href="/notifications" className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative min-h-[44px] min-w-[44px] justify-center">
            <Bell className="w-6 h-6 mb-1" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
            <span className="text-xs">Alerts</span>
          </Link>
          
          <Link href="/find-friends" className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] justify-center">
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs">Find Friends</span>
          </Link>
          
          <Link href={currentUser ? `/profile/${currentUser.username}` : "#"} className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] justify-center">
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
}
