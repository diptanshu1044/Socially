'use client';

import { ChatMessage } from '@/types/socket.types';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '@/components/ChatProvider';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  conversationId: string | null;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  conversationId, 
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore
}: MessageListProps) {
  const { typingUsers } = useChat();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get typing users for current conversation
  const currentTypingUsers = (conversationId ? typingUsers.get(conversationId) : undefined) ?? new Set();

  // Ensure scroll container is properly configured for mouse wheel
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Add wheel event listener for debugging
    const handleWheel = (e: WheelEvent) => {
      console.log('Wheel event detected:', e.deltaY);
      // Don't prevent default - let natural scrolling work
    };

    scrollContainer.addEventListener('wheel', handleWheel);
    
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, [messages.length, isLoading]);

  if (isLoading) {
    return (
      <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 chat-messages-container">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 chat-messages-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start the conversation by sending a message!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4 chat-messages-container">
      <div className="space-y-4">
        {/* Load more messages button */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="flex items-center space-x-2"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load Previous Messages</span>
              )}
            </Button>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUserId}
          />
        ))}
        
        {/* Typing Indicator */}
        {currentTypingUsers.size > 0 && (
          <TypingIndicator 
            typingUsers={Array.from(currentTypingUsers)}
            isOwnTyping={currentTypingUsers.has(currentUserId || '')}
          />
        )}
      </div>
    </div>
  );
} 