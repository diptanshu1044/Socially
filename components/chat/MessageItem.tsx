'use client';

import { useState } from 'react';
import { ChatMessage } from '@/types/socket.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Edit, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChat } from '@/components/ChatProvider';

interface MessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageItem({ message, isOwnMessage }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { editMessage, deleteMessage, messageStatus } = useChat();

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = () => {
    deleteMessage(message.id);
  };

  const getMessageStatus = (messageId: string) => {
    return messageStatus.get(messageId) || 'sent';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />;
      case 'sent':
        return <div className="w-3 h-3 text-gray-400">✓</div>;
      case 'delivered':
        return <div className="w-3 h-3 text-blue-500">✓✓</div>;
      case 'read':
        return <div className="w-3 h-3 text-blue-600">✓✓</div>;
      default:
        return null;
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          Message deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwnMessage && (
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarImage src={message.sender?.image || ""} />
            <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
              {message.sender?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {isEditing ? (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                className="mb-2"
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className={`rounded-lg px-3 py-2 max-w-full ${
                isOwnMessage 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}>
                <p className="text-sm break-words">{message.content}</p>
                {message.isEdited && (
                  <p className="text-xs opacity-70 mt-1">(edited)</p>
                )}
              </div>
              
              {/* Message Actions */}
              <div className={`absolute top-0 ${isOwnMessage ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
                    {isOwnMessage && (
                      <>
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem>
                      Copy
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          
          {/* Message Info */}
          <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
            {isOwnMessage && (
              <span>{getStatusIcon(getMessageStatus(message.id))}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 