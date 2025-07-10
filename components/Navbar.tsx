"use client";

import  ModeToggle  from "@/components/ModeToggle";
import { UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Bell, MessageCircle, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-xl font-bold">Socially</h1>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          </div>

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
  );
}
