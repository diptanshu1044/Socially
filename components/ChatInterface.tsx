'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from './ChatProvider';
import { getConversationMessages, createConversation } from '@/actions/chat.action';
import { ChatMessage } from '@/types/socket.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { MessageInput } from './chat/MessageInput';
import { MessageList } from './chat/MessageList';

interface ChatInterfaceProps {
  selectedUserId?: string;
  onOtherUserChange?: (user: {
    id: string;
    name: string;
    username: string;
    image?: string;
  } | null) => void;
}

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

export function ChatInterface({ selectedUserId, onOtherUserChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  
  const { 
    socket, 
    isConnected, 
    joinConversation, 
    leaveConversation, 
    sendMessage: sendSocketMessage, 
    sendTypingIndicator,
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    currentUserId,
    typingUsers,
    messageStatus
  } = useChat();
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get conversation ID from URL or selected user
  const urlConversationId = searchParams.get('conversation');
  const currentConversationId = urlConversationId || conversationId;



  const loadMessages = useCallback(async (convId: string, page = 1, append = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const result = await getConversationMessages(convId, page, 20); // Load 20 messages per page
      
      if (append) {
        setMessages(prev => [...result.messages, ...prev]);
      } else {
        setMessages(result.messages);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
      
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
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [currentUserId, markMessagesAsRead]);

  const handleLoadMore = useCallback(async () => {
    if (!conversationId || isLoadingMore || !hasMore) return;
    
    await loadMessages(conversationId, currentPage + 1, true);
  }, [conversationId, isLoadingMore, hasMore, currentPage, loadMessages]);

  const handleCreateConversation = useCallback(async (userId: string) => {
    try {
      const result = await createConversation([userId]);
      if (result.success && result.conversation) {
        setConversationId(result.conversation.id);
        setOtherUser(result.conversation.participants.find(p => p.userId !== userId)?.user);
        router.push(`/chat?conversation=${result.conversation.id}`);
        loadMessages(result.conversation.id);
        joinConversation(result.conversation.id);
      } else {
        toast.error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  }, [router, joinConversation, loadMessages]);

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

  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (data) => {
      console.log('Received new message:', data);
      // Add new message to the list
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
      
      // Mark messages as read if conversation is active
      if (currentConversationId === data.conversationId) {
        markMessagesAsRead(currentConversationId, [data.id]);
      }
    });

    socket.on('message-edited', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.content, isEdited: data.isEdited, updatedAt: new Date(data.updatedAt) }
          : msg
      ));
    });

    socket.on('message-deleted', (data) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    });

    return () => {
      socket.off('new-message');
      socket.off('message-edited');
      socket.off('message-deleted');
    };
  }, [socket, currentConversationId, markMessagesAsRead]);



  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !currentConversationId) return;

    try {
      console.log('Sending message via socket:', messageContent, 'to conversation:', currentConversationId);
      // Send via socket for real-time
      sendSocketMessage(currentConversationId, messageContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };



  if (!currentConversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
          <p className="text-gray-500">Select a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
          conversationId={currentConversationId}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
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