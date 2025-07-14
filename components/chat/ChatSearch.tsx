'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
}

interface ChatSearchProps {
  conversationId: string;
  onMessageClick?: (messageId: string) => void;
}

export function ChatSearch({ conversationId, onMessageClick }: ChatSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchMessages = useCallback(async (query: string) => {
    if (query.length < 2) {
      setMessages([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search messages');
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchMessages(searchTerm);
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchTerm, searchMessages]);

  const handleMessageClick = (messageId: string) => {
    onMessageClick?.(messageId);
    setShowResults(false);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setMessages([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
        {searchTerm && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {messages.length === 0 && searchTerm.length > 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No messages found
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message.id)}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {message.sender?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 