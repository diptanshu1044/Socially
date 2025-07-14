'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getConversationMessages, createConversation } from '@/actions/chat.action';
import { getConversationDetails } from '@/actions/chat.action';
import { ChatMessage } from '@/types/socket.types';
import { useChat } from '@/components/ChatProvider';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { toast } from 'sonner';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface ChatInterfaceProps {
  selectedUserId?: string;
  onOtherUserChange?: (user: User | null) => void;
  onOtherUserOnlineChange?: (isOnline: boolean) => void;
}

export function ChatInterface({ selectedUserId, onOtherUserChange, onOtherUserOnlineChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [lastUserMessageId, setLastUserMessageId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const { 
    socket, 
    isConnected, 
    joinConversation, 
    leaveConversation, 
    sendMessage: sendSocketMessage, 
    markMessagesAsRead,
    currentUserId,
    onlineUsers,
    getUserStatus
  } = useChat();

  // Get conversation ID from URL or selected user
  const urlConversationId = searchParams.get('conversation');
  const currentConversationId = urlConversationId || conversationId;
  
  // Update conversation ID when URL changes
  useEffect(() => {
    if (urlConversationId && urlConversationId !== conversationId) {
      setConversationId(urlConversationId);
    }
  }, [urlConversationId, conversationId]);

  // Get other user's online status
  const otherUserOnline = otherUser ? onlineUsers.has(otherUser.id) : false;

  // Check other user's status when they are set
  useEffect(() => {
    if (otherUser && socket && isConnected) {
      getUserStatus(otherUser.id);
    }
  }, [otherUser, socket, isConnected, getUserStatus]);

  // Periodic status check for the other user
  useEffect(() => {
    if (!otherUser || !socket || !isConnected) return;

    const interval = setInterval(() => {
      getUserStatus(otherUser.id);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [otherUser, socket, isConnected, getUserStatus]);

  const loadMessages = useCallback(async (convId: string, page = 1, append = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const [result, conversationDetails] = await Promise.all([
        getConversationMessages(convId, page, 20), // Load 20 messages per page
        page === 1 ? getConversationDetails(convId) : Promise.resolve(null)
      ]);
      
      if (append) {
        setMessages(prev => [...result.messages, ...prev]);
      } else {
        setMessages(result.messages);
        // Scroll to bottom when new conversation opens (first page load)
        setShouldScrollToBottom(true);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
      
      // Set other user information from the conversation (only on first load)
      if (page === 1 && conversationDetails) {
        const otherParticipant = conversationDetails.participants.find(p => p.userId !== currentUserId)?.user;
        setOtherUser(otherParticipant || null);
        onOtherUserChange?.(otherParticipant || null);
      }
      
      // Mark messages as read (only for new messages, not when loading more)
      if (page === 1) {
        const unreadMessageIds = result.messages
          .filter(msg => msg.senderId !== currentUserId)
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          markMessagesAsRead(convId, unreadMessageIds);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [currentUserId, markMessagesAsRead, onOtherUserChange]);

  const handleLoadMore = useCallback(async () => {
    if (!conversationId || isLoadingMore || !hasMore) return;
    
    await loadMessages(conversationId, currentPage + 1, true);
  }, [conversationId, isLoadingMore, hasMore, currentPage, loadMessages]);

  const handleCreateConversation = useCallback(async (userId: string) => {
    try {
      const result = await createConversation([userId]);
      if (result.success && result.conversation) {
        setConversationId(result.conversation.id);
        const otherParticipant = result.conversation.participants.find(p => p.userId !== userId)?.user;
        setOtherUser(otherParticipant || null);
        onOtherUserChange?.(otherParticipant || null);
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('conversation', result.conversation.id);
        window.history.pushState({}, '', url.toString());
        
        loadMessages(result.conversation.id);
        joinConversation(result.conversation.id);
      } else {
        toast.error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  }, [joinConversation, loadMessages, onOtherUserChange]);

  useEffect(() => {
    if (selectedUserId && !currentConversationId) {
      // Create conversation with selected user
      handleCreateConversation(selectedUserId);
    } else if (currentConversationId) {
      // Load existing conversation
      setCurrentPage(1);
      setHasMore(false);
      loadMessages(currentConversationId, 1, false);
      joinConversation(currentConversationId);
    }

    return () => {
      if (currentConversationId) {
        leaveConversation(currentConversationId);
      }
    };
  }, [selectedUserId, currentConversationId, handleCreateConversation, joinConversation, leaveConversation, loadMessages]);

  // Notify parent component when otherUser changes
  useEffect(() => {
    if (onOtherUserChange) {
      onOtherUserChange(otherUser);
    }
  }, [otherUser, onOtherUserChange]);

  // Notify parent component when other user online status changes
  useEffect(() => {
    if (onOtherUserOnlineChange) {
      onOtherUserOnlineChange(otherUserOnline);
    }
  }, [otherUserOnline, onOtherUserOnlineChange]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('Received new message:', data);
      const newMessage: ChatMessage = {
        id: data.id,
        content: data.content,
        senderId: data.senderId,
        conversationId: data.conversationId,
        messageType: data.messageType,
        isEdited: data.isEdited || false,
        isDeleted: false,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        sender: data.sender,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom only if the user sent the message
      if (data.senderId === currentUserId) {
        setShouldScrollToBottom(true);
        setLastUserMessageId(data.id);
      }
      
      // Mark messages as read if conversation is active
      if (currentConversationId === data.conversationId) {
        markMessagesAsRead(currentConversationId, [data.id]);
      }
    };

    const handleMessageEdited = (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.content, isEdited: data.isEdited, updatedAt: new Date(data.updatedAt) }
          : msg
      ));
    };

    const handleMessageDeleted = (data: any) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-edited', handleMessageEdited);
    socket.on('message-deleted', handleMessageDeleted);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-edited', handleMessageEdited);
      socket.off('message-deleted', handleMessageDeleted);
    };
  }, [socket, currentConversationId, markMessagesAsRead]);

  const handleSendMessage = async (messageContent: string) => {
    if (!currentConversationId) return;

    try {
      console.log('Sending message via socket:', messageContent, 'to conversation:', currentConversationId);
      sendSocketMessage(currentConversationId, messageContent);
      // Scroll to bottom when user sends a message
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleScrollToBottomComplete = () => {
    setShouldScrollToBottom(false);
  };

  // Show fallback state when no conversation is selected
  if (!currentConversationId) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Select a conversation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <ChatHeader 
          otherUser={otherUser}
          isConnected={otherUserOnline}
        />
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Trigger the layout's sidebar toggle
              const event = new CustomEvent('toggleSidebar');
              window.dispatchEvent(event);
            }}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            {otherUser ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {otherUser.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {otherUser.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${otherUserOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {otherUserOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <h3 className="font-semibold">
                Chat
              </h3>
            )}
          </div>
        </div>
      </div>
      
      {/* Message List */}
      <div className="flex-1 min-h-0">
        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
          conversationId={currentConversationId}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
          shouldScrollToBottom={shouldScrollToBottom}
          onScrollToBottomComplete={handleScrollToBottomComplete}
        />
      </div>
      
      {/* Message Input */}
      <MessageInput 
        conversationId={currentConversationId}
        onSendMessage={handleSendMessage}
        disabled={!isConnected}
      />
    </div>
  );
} 