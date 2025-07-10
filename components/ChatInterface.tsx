'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from './ChatProvider';
import { getConversationMessages, createConversation } from '@/actions/chat.action';
import { ChatMessage } from '@/types/socket.types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Edit, Trash2, Check, X, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ChatInterfaceProps {
  selectedUserId?: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

export function ChatInterface({ selectedUserId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, markMessagesAsRead]);

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
      loadMessages(currentConversationId);
      joinConversation(currentConversationId);
    }

    return () => {
      if (currentConversationId) {
        leaveConversation(currentConversationId);
      }
    };
  }, [selectedUserId, currentConversationId, handleCreateConversation, joinConversation, leaveConversation, loadMessages]);

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
      setEditingMessage(null);
      setEditContent('');
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

  // Handle typing indicator
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      sendTypingIndicator(currentConversationId!, true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(currentConversationId!, false);
      }, 3000);
    } else {
      sendTypingIndicator(currentConversationId!, false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, currentConversationId, sendTypingIndicator]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversationId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsTyping(false);

    try {
      console.log('Sending message via socket:', messageContent, 'to conversation:', currentConversationId);
      // Send via socket for real-time
      sendSocketMessage(currentConversationId, messageContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessage(messageId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = () => {
    if (!editingMessage || !editContent.trim()) return;
    
    editMessage(editingMessage, editContent.trim());
    setEditingMessage(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleSaveEdit();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const getTypingIndicator = () => {
    if (!currentConversationId || !typingUsers.has(currentConversationId)) return null;
    
    const typingUserIds = Array.from(typingUsers.get(currentConversationId) || []);
    const otherTypingUsers = typingUserIds.filter(id => id !== currentUserId);
    
    if (otherTypingUsers.length === 0) return null;
    
    return (
      <div className="flex items-center space-x-2 p-2 text-sm text-gray-500">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>Someone is typing...</span>
      </div>
    );
  };

  const getMessageStatus = (messageId: string) => {
    const status = messageStatus.get(messageId);
    if (!status) return null;
    
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <div className="flex space-x-1"><Check className="w-3 h-3 text-blue-500" /><Check className="w-3 h-3 text-blue-500" /></div>;
      case 'read':
        return <div className="flex space-x-1"><Check className="w-3 h-3 text-blue-600" /><Check className="w-3 h-3 text-blue-600" /></div>;
      default:
        return null;
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
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={otherUser?.image || ""} />
            <AvatarFallback>
              {otherUser?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{otherUser?.name || "Chat"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs ${message.senderId === currentUserId ? 'order-2' : 'order-1'}`}>
                {message.senderId !== currentUserId && (
                  <Avatar className="w-6 h-6 mb-1">
                    <AvatarImage src={message.sender?.image || ""} />
                    <AvatarFallback>
                      {message.sender?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              
              <div className={`flex flex-col ${message.senderId === currentUserId ? 'order-1' : 'order-2'}`}>
                <Card className={`max-w-xs ${message.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <CardContent className="p-3">
                    {editingMessage === message.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="text-sm"
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <p className="text-sm">{message.content}</p>
                        {message.isEdited && (
                          <p className="text-xs opacity-70 mt-1">(edited)</p>
                        )}
                        
                        {message.senderId === currentUserId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditMessage(message.id, message.content)}>
                                <Edit className="w-3 h-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className={`flex items-center space-x-1 mt-1 ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <p className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                  {message.senderId === currentUserId && getMessageStatus(message.id)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {getTypingIndicator()}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 