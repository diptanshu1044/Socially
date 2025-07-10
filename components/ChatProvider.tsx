'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, Conversation, SocketMessage, TypingIndicator } from '@/types/socket.types';
import { useUser, useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, message: string, messageType?: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
  currentConversation: string | null;
  setCurrentConversation: (conversationId: string | null) => void;
  currentUserId: string | null;
  typingUsers: Map<string, Set<string>>;
  messageStatus: Map<string, 'sending' | 'sent' | 'delivered' | 'read'>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [messageStatus, setMessageStatus] = useState<Map<string, 'sending' | 'sent' | 'delivered' | 'read'>>(new Map());
  const { user } = useUser();
  const { getToken } = useAuth();

  // Get authentication token
  const getAuthToken = useCallback(async () => {
    try {
      const token = await getToken();
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }, [getToken]);

  useEffect(() => {
    // Get the current user's database ID via API call
    const fetchCurrentUserId = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.userId);
        }
      } catch (error) {
        console.error('Error fetching current user ID:', error);
      }
    };

    if (user) {
      fetchCurrentUserId();
    }
  }, [user]);

  useEffect(() => {
    // Initialize socket connection with authentication
    const initializeSocket = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          console.error('No auth token available');
          return;
        }

        const socketInstance = io('http://localhost:3001', {
          path: '/api/socket',
          addTrailingSlash: false,
          transports: ['websocket', 'polling'],
          auth: {
            token,
          },
        });

        socketInstance.on('connect', () => {
          console.log('Connected to chat server');
          setIsConnected(true);
          
          // Send user ID to socket server after connection
          if (currentUserId) {
            socketInstance.emit('set-user-id', currentUserId);
          }
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from chat server');
          setIsConnected(false);
        });

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
          toast.error('Connection error. Please refresh the page.');
        });

        socketInstance.on('user-typing', (data) => {
          const { conversationId, userId, isTyping } = data;
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            if (isTyping) {
              if (!newMap.has(conversationId)) {
                newMap.set(conversationId, new Set());
              }
              newMap.get(conversationId)?.add(userId);
            } else {
              newMap.get(conversationId)?.delete(userId);
              if (newMap.get(conversationId)?.size === 0) {
                newMap.delete(conversationId);
              }
            }
            return newMap;
          });
        });

        socketInstance.on('message-sent', (data) => {
          const { messageId } = data;
          setMessageStatus(prev => {
            const newMap = new Map(prev);
            newMap.set(messageId, 'sent');
            return newMap;
          });
        });

        socketInstance.on('messages-read', (data) => {
          const { messageIds } = data;
          setMessageStatus(prev => {
            const newMap = new Map(prev);
            messageIds.forEach(messageId => {
              newMap.set(messageId, 'read');
            });
            return newMap;
          });
        });

        socketInstance.on('message-edited', (data) => {
          // Handle message editing in UI
          console.log('Message edited:', data);
        });

        socketInstance.on('message-deleted', (data) => {
          // Handle message deletion in UI
          console.log('Message deleted:', data);
        });

        setSocket(socketInstance);

        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    if (user) {
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, getAuthToken, currentUserId]);

  // Send user ID to socket when it becomes available
  useEffect(() => {
    if (socket && isConnected && currentUserId) {
      socket.emit('set-user-id', currentUserId);
    }
  }, [socket, isConnected, currentUserId]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('join-conversation', conversationId);
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('leave-conversation', conversationId);
    }
  }, [socket]);

  const sendMessage = useCallback((conversationId: string, message: string, messageType: string = 'TEXT') => {
    if (socket && currentUserId) {
      const messageId = Date.now().toString();
      setMessageStatus(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, 'sending');
        return newMap;
      });

      socket.emit('send-message', {
        conversationId,
        message,
        messageType,
      });
    }
  }, [socket, currentUserId]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket && currentUserId) {
      socket.emit('typing', {
        conversationId,
        isTyping,
      });
    }
  }, [socket, currentUserId]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (socket) {
      socket.emit('edit-message', {
        messageId,
        newContent,
      });
    }
  }, [socket]);

  const deleteMessage = useCallback((messageId: string) => {
    if (socket) {
      socket.emit('delete-message', {
        messageId,
      });
    }
  }, [socket]);

  const markMessagesAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (socket) {
      socket.emit('mark-read', {
        conversationId,
        messageIds,
      });
    }
  }, [socket]);

  const value: ChatContextType = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    currentConversation,
    setCurrentConversation,
    currentUserId,
    typingUsers,
    messageStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 