"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface ChatNavbarProps {
  otherUser?: {
    id: string;
    name: string;
    username: string;
    image?: string;
  } | null;
  isConnected: boolean;
  onMenuClick?: () => void;
}

export function ChatNavbar({ otherUser, isConnected, onMenuClick }: ChatNavbarProps) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Avatar>
          <AvatarImage src={otherUser?.image || ""} />
          <AvatarFallback>
            {otherUser?.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{otherUser?.name || "Chat"}</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 