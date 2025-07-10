'use client';

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Search, X, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { searchMessages } from '@/actions/chat.action';
import { ChatMessage } from '@/types/socket.types';

interface ChatSearchProps {
  conversationId: string;
  onMessageClick: (messageId: string) => void;
}

export function ChatSearch({ conversationId, onMessageClick }: ChatSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) return;

      setIsSearching(true);
      try {
        const response = await searchMessages(conversationId, query.trim());
        setResults(response.messages);
      } catch (error) {
        console.error('Error searching messages:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, conversationId]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleMessageClick = (messageId: string) => {
    onMessageClick(messageId);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start"
      >
        <Search className="w-4 h-4 mr-2" />
        Search messages...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {isSearching && (
        <div className="text-center text-sm text-gray-500 py-4">
          Searching...
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {results.map((message) => (
            <Card
              key={message.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleMessageClick(message.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={message.sender?.image || ""} />
                    <AvatarFallback>
                      {message.sender?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{message.sender?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && query.trim().length >= 2 && results.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          No messages found
        </div>
      )}
    </div>
  );
} 