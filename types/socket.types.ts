import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface ChatMessage {
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

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: ConversationParticipant[];
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
}

export interface SocketMessage {
  conversationId: string;
  message: string;
  senderId: string;
  timestamp: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
} 