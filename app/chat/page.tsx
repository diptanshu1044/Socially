'use client';

import { useEffect, useState } from 'react';
import { getConversations } from "@/actions/chat.action";
import { getDbUserId } from "@/actions/user.action";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/ChatInterface";
import { ConversationList } from "@/components/ConversationList";
import { UserSelection } from "@/components/UserSelection";
import { ChatSearch } from "@/components/ChatSearch";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Conversation } from "@/types/socket.types";

export default function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; conversation?: string }>;
}) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [params, setParams] = useState<{ user?: string; conversation?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      router.push("/signin");
      return;
    }

    const loadData = async () => {
      try {
        const [conversationsData, dbUserIdData, searchParamsData] = await Promise.all([
          getConversations(),
          getDbUserId(),
          searchParams
        ]);
        
        setConversations(conversationsData);
        setDbUserId(dbUserIdData);
        setParams(searchParamsData);
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, isLoaded, searchParams, router]);

  const selectedUserId = params.user;
  const selectedConversationId = params.conversation;

  const handleMessageClick = (messageId: string) => {
    // Scroll to message functionality can be added here
    console.log('Message clicked:', messageId);
  };

  if (!isLoaded || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!userId) {
    return null; // Will redirect to signin
  }

  return (
    <div className="h-[calc(100vh-56px)] lg:h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300"
           style={{ opacity: showSidebar ? 1 : 0, pointerEvents: showSidebar ? 'auto' : 'none' }}
           onClick={() => setShowSidebar(false)}>
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300"
             style={{ transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)' }}
             onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* User Selection for starting new conversations */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <UserSelection />
            </div>
            
            {/* Search Messages */}
            {selectedConversationId && (
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <ChatSearch 
                  conversationId={selectedConversationId}
                  onMessageClick={handleMessageClick}
                />
              </div>
            )}
            
            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              <ConversationList 
                conversations={conversations} 
                dbUserId={dbUserId}
                selectedUserId={selectedConversationId}
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
        
        {/* User Selection for starting new conversations */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <UserSelection />
        </div>
        
        {/* Search Messages */}
        {selectedConversationId && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <ChatSearch 
              conversationId={selectedConversationId}
              onMessageClick={handleMessageClick}
            />
          </div>
        )}
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList 
            conversations={conversations} 
            dbUserId={dbUserId}
            selectedUserId={selectedConversationId}
          />
        </div>
      </div>
      
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-full">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ☰
            </button>
            <h2 className="text-lg font-semibold">Chat</h2>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface selectedUserId={selectedUserId} />
        </div>
      </div>
    </div>
  );
} 