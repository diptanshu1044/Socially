"use client";

import  ModeToggle  from "@/components/ModeToggle";
import { UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Bell, MessageCircle, Home, User, Search, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface Notification {
  id: string;
  read: boolean;
  type: string;
  message: string;
  createdAt: string;
}

export function Navbar() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch unread notifications
        const notificationsResponse = await fetch('/api/notifications');
        const notificationsData = await notificationsResponse.json();
        const unreadNotifications = notificationsData.notifications?.filter((n: Notification) => !n.read).length || 0;
        setNotificationCount(unreadNotifications);

        // Fetch conversations for message count
        const conversationsResponse = await fetch('/api/conversations');
        const conversationsData = await conversationsResponse.json();
        setMessageCount(conversationsData.conversations?.length || 0);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-xl font-bold">Socially</h1>
              </Link>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="relative">
                  <MessageCircle className="w-4 h-4" />
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </Link>

              <ModeToggle />
              <UserButton />
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
                    <h2 className="text-lg font-semibold">Menu</h2>
                  </div>
                  <div className="flex-1 p-4 space-y-4">
                    <Link href="/" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                    <Link href="/chat" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                      <MessageCircle className="w-5 h-5" />
                      <span>Chat</span>
                      {messageCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {messageCount > 9 ? '9+' : messageCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/notifications" onClick={handleNavigation} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                      {notificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      )}
                    </Link>
                  </div>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <UserButton />
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
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messageCount > 9 ? '9+' : messageCount}
              </span>
            )}
            <span className="text-xs">Chat</span>
          </Link>
          
          <Link href="/notifications" className="flex flex-col items-center py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative min-h-[44px] min-w-[44px] justify-center">
            <Bell className="w-6 h-6 mb-1" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
            <span className="text-xs">Alerts</span>
          </Link>
          
          <div className="flex flex-col items-center py-2 px-3 min-h-[44px] min-w-[44px] justify-center">
            <UserButton />
            <span className="text-xs mt-1">Profile</span>
          </div>
        </div>
      </div>
    </>
  );
}
