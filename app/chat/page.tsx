'use client';

import { useEffect, useState } from 'react';
import { getConversations } from "@/actions/chat.action";
import { getDbUserId, getUser } from "@/actions/user.action";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/ChatInterface";
import { ConversationList } from "@/components/ConversationList";
import { UserSelection } from "@/components/UserSelection";
import { ChatSearch } from "@/components/ChatSearch";
import Loading from "@/components/LoadingSkeleton";

export default function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; conversation?: string }>;
}) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [params, setParams] = useState<{ user?: string; conversation?: string }>({});
  const [isLoading, setIsLoading] = useState(true);

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
    return <Loading />;
  }

  if (!userId) {
    return null; // Will redirect to signin
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        
        {/* User Selection for starting new conversations */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <UserSelection />
        </div>
        
        {/* Search Messages */}
        {selectedConversationId && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
      
      <div className="flex-1">
        <ChatInterface selectedUserId={selectedUserId} />
      </div>
    </div>
  );
} 