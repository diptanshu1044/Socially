'use client';

import { Conversation } from '@/types/socket.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  dbUserId: string | null;
  selectedConversationId?: string | null;
  onConversationSelect?: (conversationId: string) => void;
}

interface ConversationItemProps {
  conversation: Conversation;
  dbUserId: string | null;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, dbUserId, isSelected, onClick }: ConversationItemProps) {
  // Filter out the current user from participants to get the other user(s)
  const otherParticipants = conversation.participants.filter(
    (p) => p.userId !== dbUserId
  );
  
  // For 1-on-1 chats, show the other user
  // For group chats, show the conversation name
  const displayName = conversation.isGroup
    ? conversation.name || "Group Chat"
    : otherParticipants[0]?.user.name || "Unknown User";
  
  const displayUsername = conversation.isGroup
    ? `${otherParticipants.length} members`
    : `@${otherParticipants[0]?.user.username || "unknown"}`;
  
  const displayImage = conversation.isGroup
    ? null // Could add a group icon here
    : otherParticipants[0]?.user.image;
  
  const displayInitial = conversation.isGroup
    ? "G"
    : otherParticipants[0]?.user.name?.[0]?.toUpperCase() || "U";

  // Get the latest message
  const latestMessage = conversation.messages[0];
  const unreadCount = conversation.messages.filter(
    msg => msg.senderId !== dbUserId && !msg.isDeleted
  ).length;

  return (
    <div
      onClick={onClick}
      className={`block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={displayImage || ""} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
              {displayInitial}
            </AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {displayName}
            </p>
            {latestMessage && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(latestMessage.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {displayUsername}
          </p>
          {latestMessage && !latestMessage.isDeleted && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
              {latestMessage.senderId === dbUserId ? 'You: ' : ''}
              {latestMessage.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConversationList({ 
  conversations, 
  dbUserId, 
  selectedConversationId, 
  onConversationSelect 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No conversations yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start chatting with someone to see your conversations here!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          dbUserId={dbUserId}
          isSelected={selectedConversationId === conversation.id}
          onClick={() => {
            onConversationSelect?.(conversation.id);
            // Update URL
            const url = new URL(window.location.href);
            url.searchParams.set('conversation', conversation.id);
            window.history.pushState({}, '', url.toString());
          }}
        />
      ))}
    </div>
  );
} 