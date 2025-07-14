'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { useChat } from '@/components/ChatProvider';
import { EmojiPicker } from './EmojiPicker';

interface MessageInputProps {
  conversationId: string | null;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ conversationId, onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { sendTypingIndicator } = useChat();

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursorPosition);
    const textAfterCursor = message.slice(cursorPosition);
    const newMessage = textBeforeCursor + emoji + textAfterCursor;
    
    setMessage(newMessage);
    
    // Set cursor position after emoji
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = cursorPosition + emoji.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !conversationId || disabled) return;

    const messageContent = message.trim();
    setMessage('');
    setIsTyping(false);
    
    // Clear typing indicator
    if (conversationId) {
      sendTypingIndicator(conversationId, false);
    }

    onSendMessage(messageContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicator
    if (conversationId) {
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        sendTypingIndicator(conversationId, true);
      } else if (value.length === 0 && isTyping) {
        setIsTyping(false);
        sendTypingIndicator(conversationId, false);
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Clear typing indicator when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (conversationId && isTyping) {
        sendTypingIndicator(conversationId, false);
      }
    };
  }, [conversationId, isTyping, sendTypingIndicator]);

  // Clear typing indicator after 3 seconds of no typing
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping && conversationId) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(conversationId, false);
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, conversationId, sendTypingIndicator]);

  if (!conversationId) {
    return (
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Select a conversation to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pl-6 message-input-spacing safe-padding border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-end space-x-2">
        <div className="flex-1 flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none flex-1"
            disabled={disabled}
            rows={1}
          />
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={disabled} />
          </div>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          size="sm"
          className="h-10 w-10 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 