'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
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
  getUserStatus: (userId: string) => void;
  onlineUsers: Set<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [messageStatus, setMessageStatus] = useState<Map<string, 'sending' | 'sent' | 'delivered' | 'read'>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isUserIdSet, setIsUserIdSet] = useState(false);
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

  // Fetch current user ID first
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched current user ID:', data.userId);
          setCurrentUserId(data.userId);
        } else {
          console.error('Failed to fetch user ID, response:', response.status);
        }
      } catch (error) {
        console.error('Error fetching current user ID:', error);
      }
    };

    if (user && !currentUserId) {
      fetchCurrentUserId();
    }
  }, [user, currentUserId]);

  // Initialize socket connection only after we have user ID
  useEffect(() => {
    if (!user || !currentUserId || socket) {
      return;
    }

    const initializeSocket = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          console.error('No auth token available');
          toast.error('Authentication required. Please sign in again.');
          return;
        }

        console.log('Initializing socket connection with user ID:', currentUserId);
        
        // Determine socket URL based on environment
        let socketUrl;
        if (process.env.NEXT_PUBLIC_SOCKET_URL) {
          socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        } else if (typeof window !== 'undefined') {
          // In browser, use the same host as the current page
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = window.location.host;
          socketUrl = `${protocol}//${host}`;
        } else if (process.env.NODE_ENV === 'production') {
          // Production fallback - use the same host as the app
          socketUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-app.vercel.app';
        } else {
          // Development fallback
          socketUrl = process.env.NEXT_PUBLIC_NETWORK_IP ? 
            `http://${process.env.NEXT_PUBLIC_NETWORK_IP}:8080` : 
            'http://localhost:8080';
        }
        
        console.log('Connecting to socket URL:', socketUrl);
        if (process.env.NODE_ENV === 'production') {
          console.log('Production mode: Using optimized socket configuration');
        }
        
        const socketInstance = io(socketUrl, {
          path: '/api/socket',
          addTrailingSlash: false,
          transports: ['websocket', 'polling'],
          timeout: process.env.NODE_ENV === 'production' ? 15000 : 20000,
          auth: {
            token,
          },
          reconnection: true,
          reconnectionAttempts: process.env.NODE_ENV === 'production' ? 3 : 5,
          reconnectionDelay: process.env.NODE_ENV === 'production' ? 2000 : 1000,
          reconnectionDelayMax: process.env.NODE_ENV === 'production' ? 10000 : 5000,
        });

        socketInstance.on('connect', () => {
          console.log('Connected to chat server, socket ID:', socketInstance.id);
          setIsConnected(true);
          
          // Send user ID immediately after connection
          console.log('Sending user ID to socket:', currentUserId);
          socketInstance.emit('set-user-id', currentUserId);
        });

        socketInstance.on('user-id-set', (data) => {
          console.log('User ID set confirmation received:', data);
          setIsUserIdSet(true);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Disconnected from chat server, reason:', reason);
          setIsConnected(false);
          setIsUserIdSet(false);
          
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            socketInstance.connect();
          }
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
          setIsUserIdSet(false);
          
          // More specific error messages
          if (error.message.includes('CORS')) {
            toast.error('Chat server connection blocked. Please check your network settings.');
          } else if (error.message.includes('timeout')) {
            toast.error('Chat server connection timeout. Please try again.');
          } else {
            toast.error('Failed to connect to chat server. Please refresh the page.');
          }
        });

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error);
          const errorMessage = error.message || 'Connection error. Please refresh the page.';
          toast.error(errorMessage);
        });

        // Handle join conversation errors specifically
        socketInstance.on('join-conversation-error', (data) => {
          console.error('Failed to join conversation:', data);
          if (process.env.NODE_ENV === 'production') {
            // In production, show more specific error messages
            toast.error(data.message || 'Unable to join conversation. Please try again.');
          } else {
            toast.error(data.message || 'Failed to join conversation');
          }
        });

        socketInstance.on('conversation-joined', (data) => {
          console.log('Successfully joined conversation:', data);
          if (process.env.NODE_ENV === 'production') {
            console.log('Production: Conversation joined successfully');
          }
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

        socketInstance.on('user-online', (data) => {
          const { userId } = data;
          setOnlineUsers(prev => new Set([...prev, userId]));
        });

        socketInstance.on('user-offline', (data) => {
          const { userId } = data;
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });

        socketInstance.on('user-status', (data) => {
          const { userId, isOnline } = data;
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (isOnline) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });
        });

        socketInstance.on('online-users', (onlineUsersList) => {
          setOnlineUsers(new Set(onlineUsersList));
        });

        socketInstance.on('conversation-participants-status', (data) => {
          const { participants } = data;
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            participants.forEach((participant: any) => {
              if (participant.isOnline) {
                newSet.add(participant.userId);
              } else {
                newSet.delete(participant.userId);
              }
            });
            return newSet;
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
          console.log('Message edited:', data);
        });

        socketInstance.on('message-deleted', (data) => {
          console.log('Message deleted:', data);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('Error initializing socket:', error);
        toast.error('Failed to initialize chat connection');
      }
    };

    initializeSocket();

    return () => {
      // Cleanup will be handled by the main cleanup effect
    };
  }, [user, currentUserId, getAuthToken, socket]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('Disconnecting socket on unmount');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setIsUserIdSet(false);
      }
    };
  }, [socket]);

  const joinConversation = useCallback((conversationId: string) => {
    if (!socket) {
      console.warn('Cannot join conversation: socket not available');
      toast.error('Chat connection not available. Please refresh the page.');
      return;
    }
    
    if (!isUserIdSet) {
      console.warn('Cannot join conversation: user ID not set');
      toast.error('Please wait for chat connection to be established.');
      return;
    }
    
    if (!conversationId) {
      console.warn('Cannot join conversation: no conversation ID provided');
      toast.error('Invalid conversation. Please try again.');
      return;
    }
    
    console.log('Joining conversation:', conversationId);
    socket.emit('join-conversation', conversationId);
  }, [socket, isUserIdSet]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isUserIdSet) {
      socket.emit('leave-conversation', conversationId);
    }
  }, [socket, isUserIdSet]);

  const sendMessage = useCallback((conversationId: string, message: string, messageType: string = 'TEXT') => {
    if (socket && currentUserId && isUserIdSet) {
      console.log('ChatProvider sending message:', { conversationId, message, messageType, currentUserId });
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
    } else {
      console.log('Cannot send message:', { socket: !!socket, currentUserId, isUserIdSet, conversationId });
      toast.error('Please wait for connection to be established');
    }
  }, [socket, currentUserId, isUserIdSet]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket && currentUserId && isUserIdSet) {
      socket.emit('typing-indicator', {
        conversationId,
        isTyping,
      });
    }
  }, [socket, currentUserId, isUserIdSet]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (socket && isUserIdSet) {
      socket.emit('edit-message', {
        messageId,
        newContent,
      });
    }
  }, [socket, isUserIdSet]);

  const deleteMessage = useCallback((messageId: string) => {
    if (socket && isUserIdSet) {
      socket.emit('delete-message', {
        messageId,
      });
    }
  }, [socket, isUserIdSet]);

  const markMessagesAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (socket && isUserIdSet) {
      socket.emit('mark-read', {
        conversationId,
        messageIds,
      });
    }
  }, [socket, isUserIdSet]);

  const getUserStatus = useCallback((userId: string) => {
    if (socket && isUserIdSet) {
      socket.emit('get-user-status', userId);
    }
  }, [socket, isUserIdSet]);

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
    getUserStatus,
    onlineUsers,
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