'use client';

import { Conversation } from '@/types/socket.types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';

interface ConversationListProps {
  conversations: Conversation[];
  dbUserId: string | null;
  selectedUserId?: string;
  onConversationSelect?: () => void;
}

export function ConversationList({ conversations, dbUserId, selectedUserId, onConversationSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations yet. Start chatting with someone!
      </div>
    );
  }

  const handleConversationClick = () => {
    // Call the callback to close the sidebar
    onConversationSelect?.();
  };

  return (
    <div>
      {conversations.map((conversation) => {
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
        
        return (
          <Link
            key={conversation.id}
            href={`/chat?conversation=${conversation.id}`}
            onClick={handleConversationClick}
            className={`block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
              selectedUserId === conversation.id ? 'bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarImage src={displayImage || ""} />
                  <AvatarFallback>
                    {displayInitial}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {displayUsername}
                </p>
                {conversation.messages[0] && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {conversation.messages[0].content}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 