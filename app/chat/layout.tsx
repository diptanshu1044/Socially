'use client';

import { useEffect, useState } from 'react';
import { getConversations } from "@/actions/chat.action";
import { getDbUserId } from "@/actions/user.action";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/chat/ConversationList";
import { UserSelection } from "@/components/chat/UserSelection";
import { ChatSearch } from "@/components/chat/ChatSearch";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Conversation } from "@/types/socket.types";
import { useChat } from "@/components/ChatProvider";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  
  // Get conversation ID from URL
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get('conversation');
  
  const { isConnected } = useChat();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      router.push("/signin");
      return;
    }

    const loadData = async () => {
      try {
        const [conversationsData, dbUserIdData] = await Promise.all([
          getConversations(),
          getDbUserId()
        ]);
        
        setConversations(conversationsData);
        setDbUserId(dbUserIdData);
        
        // Set selected conversation from URL if available
        if (urlConversationId) {
          setSelectedConversationId(urlConversationId);
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, isLoaded, router, urlConversationId]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowSidebar(false);
  };

  const handleUserSelect = () => {
    setShowSidebar(false);
  };

  // Listen for sidebar toggle events from ChatInterface
  useEffect(() => {
    const handleToggleSidebar = () => {
      setShowSidebar(prev => !prev);
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

  if (!isLoaded || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!userId) {
    return null; // Will redirect to signin
  }

  return (
    <div className="h-screen-navbar flex">
      {/* Mobile Sidebar Overlay */}
      <div 
        className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300"
        style={{ 
          opacity: showSidebar ? 1 : 0, 
          pointerEvents: showSidebar ? 'auto' : 'none' 
        }}
        onClick={() => setShowSidebar(false)}
      >
        <div 
          className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300"
          style={{ 
            transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)' 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* User Selection */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <UserSelection onUserSelect={handleUserSelect} />
            </div>
            
            {/* Chat Search */}
            {selectedConversationId && (
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <ChatSearch 
                  conversationId={selectedConversationId}
                  onMessageClick={(messageId) => {
                    console.log('Message clicked:', messageId);
                  }}
                />
              </div>
            )}
            
            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto chat-messages-container">
              <ConversationList 
                conversations={conversations} 
                dbUserId={dbUserId}
                selectedConversationId={selectedConversationId}
                onConversationSelect={handleConversationSelect}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        
        {/* User Selection */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <UserSelection onUserSelect={handleUserSelect} />
        </div>
        
        {/* Chat Search */}
        {selectedConversationId && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <ChatSearch 
              conversationId={selectedConversationId}
              onMessageClick={(messageId) => {
                console.log('Message clicked:', messageId);
              }}
            />
          </div>
        )}
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto chat-messages-container">
          <ConversationList 
            conversations={conversations} 
            dbUserId={dbUserId}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
          />
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
        {/* Mobile Header - Only show when no conversation is selected */}
        {!selectedConversationId && (
          <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold">
                  Messages
                </h3>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
} 