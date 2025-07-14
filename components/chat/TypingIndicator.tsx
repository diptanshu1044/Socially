'use client';

interface TypingIndicatorProps {
  typingUsers: string[];
  isOwnTyping: boolean;
}

export function TypingIndicator({ typingUsers, isOwnTyping }: TypingIndicatorProps) {
  // Filter out own typing indicator
  const otherTypingUsers = typingUsers.filter(userId => !isOwnTyping || userId !== 'currentUser');
  
  if (otherTypingUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
        <div className="flex flex-col">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {otherTypingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
          </div>
        </div>
      </div>
    </div>
  );
} 