'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageCircle, Loader2 } from 'lucide-react';
import { createConversation } from '@/actions/chat.action';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface UserSelectionProps {
  onUserSelect?: () => void;
}

export function UserSelection({ onUserSelect }: UserSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState<string | null>(null);
  const router = useRouter();

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchTerm, searchUsers]);

  const handleStartConversation = async (userId: string) => {
    if (isCreatingConversation) return;
    
    setIsCreatingConversation(userId);
    try {
      const result = await createConversation([userId]);
      if (result.success && result.conversation) {
        toast.success('Conversation started!');
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set('conversation', result.conversation.id);
        window.history.pushState({}, '', url.toString());
        
        // Call the callback to close the sidebar
        onUserSelect?.();
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsCreatingConversation(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users to chat with..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </div>
      
      {searchTerm.length > 0 && !isLoading && users.length === 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          No users found
        </div>
      )}
      
      {users.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartConversation(user.id)}
                disabled={isCreatingConversation === user.id}
                className="flex items-center space-x-1"
              >
                {isCreatingConversation === user.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Message</span>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {searchTerm.length === 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          Type to search for users
        </div>
      )}
    </div>
  );
} 