'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getConversationMessages, createConversation } from '@/actions/chat.action';
import { ChatMessage } from '@/types/socket.types';
import { useChat } from '@/components/ChatProvider';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface ChatInterfaceProps {
  selectedUserId?: string;
  onOtherUserChange?: (user: User | null) => void;
}

export function ChatInterface({ selectedUserId, onOtherUserChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  
  const searchParams = useSearchParams();
  const { 
    socket, 
    isConnected, 
    joinConversation, 
    leaveConversation, 
    sendMessage: sendSocketMessage, 
    markMessagesAsRead,
    currentUserId
  } = useChat();

  // Get conversation ID from URL or selected user
  const urlConversationId = searchParams.get('conversation');
  const currentConversationId = urlConversationId || conversationId;

  const loadMessages = useCallback(async (convId: string) => {
    setIsLoading(true);
    try {
      const result = await getConversationMessages(convId);
      setMessages(result.messages);
      
      // Mark messages as read
      const unreadMessageIds = result.messages
        .filter(msg => msg.senderId !== currentUserId)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(convId, unreadMessageIds);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, markMessagesAsRead]);

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
      loadMessages(currentConversationId);
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
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <ChatHeader 
          otherUser={otherUser}
          isConnected={isConnected}
        />
      </div>
      
      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
          conversationId={currentConversationId}
          isLoading={isLoading}
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