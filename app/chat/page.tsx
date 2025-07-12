'use client';

import { useEffect, useState } from 'react';
import { getConversations } from "@/actions/chat.action";
import { getDbUserId } from "@/actions/user.action";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/ChatInterface";
import { ChatNavbar } from "@/components/ChatNavbar";
import { ConversationList } from "@/components/ConversationList";
import { UserSelection } from "@/components/UserSelection";
import { ChatSearch } from "@/components/ChatSearch";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Conversation } from "@/types/socket.types";
import { useChat } from "@/components/ChatProvider";

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
  const [otherUser, setOtherUser] = useState<{
    id: string;
    name: string;
    username: string;
    image?: string;
  } | null>(null);
  
  const { isConnected } = useChat();

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

  const handleUserOrConversationSelect = () => {
    // Close the mobile sidebar when a user or conversation is selected
    setShowSidebar(false);
  };

  if (!isLoaded || isLoading) {
    return <LoadingSkeleton />;
  }

  if (!userId) {
    return null; // Will redirect to signin
  }

  return (
    <div className="h-[calc(100vh-80px)] flex overflow-hidden">
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
              <UserSelection onUserSelect={handleUserOrConversationSelect} />
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
                onConversationSelect={handleUserOrConversationSelect}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tablet/Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        
        {/* User Selection for starting new conversations */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <UserSelection onUserSelect={handleUserOrConversationSelect} />
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
            onConversationSelect={handleUserOrConversationSelect}
          />
        </div>
      </div>
      
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
        {/* Chat Navbar - Only show on mobile and when no conversation is selected on desktop */}
        <div className="lg:hidden">
          <ChatNavbar 
            otherUser={otherUser}
            isConnected={isConnected}
            onMenuClick={() => setShowSidebar(true)}
          />
        </div>
        
        {/* Desktop Chat Header - Only show on desktop when conversation is selected */}
        {selectedConversationId && (
          <div className="hidden lg:block p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{otherUser?.name || "Chat"}</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State for Desktop */}
        {!selectedConversationId && (
          <div className="hidden lg:flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p className="text-gray-500">Select a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
        
        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            selectedUserId={selectedUserId} 
            onOtherUserChange={setOtherUser}
          />
        </div>
      </div>
    </div>
  );
} 