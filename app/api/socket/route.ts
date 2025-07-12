import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { PrismaClient } from '@prisma/client';

// Type definitions for socket server
interface SocketServer extends NetServer {
  io?: ServerIO;
}

interface SocketResponse extends Response {
  socket: {
    server: SocketServer;
  };
}

const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Type assertion to access socket server
    const res = req as unknown as SocketResponse;
    
    if (!res.socket?.server?.io) {
      console.log('Setting up socket.io server...');
      
      const httpServer: NetServer = res.socket.server;
      const io = new ServerIO(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: isProduction ? [
            process.env.NEXT_PUBLIC_SITE_URL,
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
            // Add your production domains here
            "https://your-app.vercel.app"
          ].filter(Boolean) : [
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "*"
          ],
          methods: ["GET", "POST", "OPTIONS"],
          credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: isProduction ? 30000 : 60000,
        pingInterval: isProduction ? 15000 : 25000,
      });

      // Store the io instance on the server
      res.socket.server.io = io;

      // Middleware for authentication - simplified for now
      io.use(async (socket, next) => {
        try {
          const token = socket.handshake.auth.token;
          if (!token) {
            return next(new Error('Authentication error'));
          }
          
          // For now, we'll trust the token and get user ID from client
          // In production, you'd verify the token here
          socket.data.token = token;
          next();
        } catch {
          next(new Error('Authentication failed'));
        }
      });

      // Store typing states
      const typingUsers = new Map();
      const userSockets = new Map();

      io.on('connection', (socket) => {
        if (isProduction) {
          console.log(`Client connected: ${socket.id}`);
        }

        // Join user's personal room for notifications
        socket.on('set-user-id', (userId: string) => {
          socket.data.userId = userId;
          userSockets.set(userId, socket.id);
          socket.join(`user:${userId}`);
          if (isProduction) {
            console.log(`User ${userId} connected`);
          }
        });

        // Join a conversation room
        socket.on('join-conversation', async (conversationId: string) => {
          try {
            const userId = socket.data.userId;
            if (!userId) {
              socket.emit('join-conversation-error', { message: 'User not authenticated' });
              return;
            }

            // Verify user is part of the conversation
            const participant = await prisma.conversationParticipant.findUnique({
              where: {
                conversationId_userId: {
                  conversationId,
                  userId,
                },
              },
            });

            if (!participant) {
              socket.emit('join-conversation-error', { message: 'Not authorized to join this conversation' });
              return;
            }

            socket.join(conversationId);
            if (isProduction) {
              console.log(`User ${userId} joined conversation: ${conversationId}`);
            }
            
            // Emit success confirmation
            socket.emit('conversation-joined', { conversationId, userId });
            
            // Notify other participants
            socket.to(conversationId).emit('user-joined', {
              conversationId,
              userId,
              timestamp: new Date(),
            });
          } catch (error) {
            console.error('Error joining conversation:', error);
            socket.emit('join-conversation-error', { message: 'Failed to join conversation' });
          }
        });

        // Leave a conversation room
        socket.on('leave-conversation', (conversationId: string) => {
          const userId = socket.data.userId;
          socket.leave(conversationId);
          
          // Clear typing indicator
          if (typingUsers.has(conversationId)) {
            typingUsers.get(conversationId)?.delete(userId);
            if (typingUsers.get(conversationId)?.size === 0) {
              typingUsers.delete(conversationId);
            }
          }
          
          if (isProduction) {
            console.log(`User ${userId} left conversation: ${conversationId}`);
          }
          
          // Notify other participants
          socket.to(conversationId).emit('user-left', {
            conversationId,
            userId,
            timestamp: new Date(),
          });
        });

        // Handle new message with persistence
        socket.on('send-message', async (data) => {
          try {
            const { conversationId, message, messageType = 'TEXT' } = data;
            const userId = socket.data.userId;
            
            if (!userId) {
              socket.emit('error', { message: 'User not authenticated' });
              return;
            }

            // Verify user is part of the conversation
            const participant = await prisma.conversationParticipant.findUnique({
              where: {
                conversationId_userId: {
                  conversationId,
                  userId,
                },
              },
            });

            if (!participant) {
              socket.emit('error', { message: 'Not authorized to send message' });
              return;
            }

            // Create message in database
            const dbMessage = await prisma.message.create({
              data: {
                content: message,
                messageType,
                conversationId,
                senderId: userId,
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },
              },
            });

            // Update conversation's updatedAt timestamp
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date() },
            });

            // Broadcast message to all users in the conversation
            const messageData = {
              id: dbMessage.id,
              content: dbMessage.content,
              messageType: dbMessage.messageType,
              senderId: dbMessage.senderId,
              conversationId: dbMessage.conversationId,
              createdAt: dbMessage.createdAt,
              updatedAt: dbMessage.updatedAt,
              sender: dbMessage.sender,
            };

            io.to(conversationId).emit('new-message', messageData);
            
            // Send delivery confirmation to sender
            socket.emit('message-sent', {
              messageId: dbMessage.id,
              conversationId,
              timestamp: new Date(),
            });

          } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
          }
        });

        // Handle typing indicator
        socket.on('typing', async (data) => {
          try {
            const { conversationId, isTyping } = data;
            const userId = socket.data.userId;
            
            if (!userId) return;

            // Verify user is part of the conversation
            const participant = await prisma.conversationParticipant.findUnique({
              where: {
                conversationId_userId: {
                  conversationId,
                  userId,
                },
              },
            });

            if (!participant) return;

            if (isTyping) {
              if (!typingUsers.has(conversationId)) {
                typingUsers.set(conversationId, new Set());
              }
              typingUsers.get(conversationId)?.add(userId);
            } else {
              typingUsers.get(conversationId)?.delete(userId);
              if (typingUsers.get(conversationId)?.size === 0) {
                typingUsers.delete(conversationId);
              }
            }

            // Broadcast typing indicator to other users in conversation
            socket.to(conversationId).emit('user-typing', {
              conversationId,
              userId,
              isTyping,
              timestamp: new Date(),
            });
          } catch (error) {
            console.error('Error handling typing indicator:', error);
          }
        });

        // Handle message read receipts
        socket.on('mark-read', async (data) => {
          try {
            const { conversationId, messageIds } = data;
            const userId = socket.data.userId;
            
            if (!userId) return;

            // Verify user is part of the conversation
            const participant = await prisma.conversationParticipant.findUnique({
              where: {
                conversationId_userId: {
                  conversationId,
                  userId,
                },
              },
            });

            if (!participant) return;

            // Broadcast read receipt to other users
            socket.to(conversationId).emit('messages-read', {
              conversationId,
              userId,
              messageIds,
              timestamp: new Date(),
            });
          } catch (error) {
            console.error('Error handling read receipt:', error);
          }
        });

        // Handle message editing
        socket.on('edit-message', async (data) => {
          try {
            const { messageId, newContent } = data;
            const userId = socket.data.userId;
            
            if (!userId) {
              socket.emit('error', { message: 'User not authenticated' });
              return;
            }
            
            // Verify user owns the message
            const message = await prisma.message.findUnique({
              where: { id: messageId },
              include: {
                conversation: {
                  include: {
                    participants: true,
                  },
                },
              },
            });

            if (!message || message.senderId !== userId) {
              socket.emit('error', { message: 'Not authorized to edit this message' });
              return;
            }

            // Update message in database
            const updatedMessage = await prisma.message.update({
              where: { id: messageId },
              data: {
                content: newContent,
                isEdited: true,
                updatedAt: new Date(),
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },
              },
            });

            // Broadcast edited message to conversation
            io.to(message.conversationId).emit('message-edited', {
              messageId,
              content: updatedMessage.content,
              isEdited: updatedMessage.isEdited,
              updatedAt: updatedMessage.updatedAt,
              conversationId: message.conversationId,
            });

          } catch (error) {
            console.error('Error editing message:', error);
            socket.emit('error', { message: 'Failed to edit message' });
          }
        });

        // Handle message deletion
        socket.on('delete-message', async (data) => {
          try {
            const { messageId } = data;
            const userId = socket.data.userId;
            
            if (!userId) {
              socket.emit('error', { message: 'User not authenticated' });
              return;
            }
            
            // Verify user owns the message
            const message = await prisma.message.findUnique({
              where: { id: messageId },
            });

            if (!message || message.senderId !== userId) {
              socket.emit('error', { message: 'Not authorized to delete this message' });
              return;
            }

            // Soft delete message
            await prisma.message.update({
              where: { id: messageId },
              data: {
                isDeleted: true,
                updatedAt: new Date(),
              },
            });

            // Broadcast message deletion to conversation
            io.to(message.conversationId).emit('message-deleted', {
              messageId,
              conversationId: message.conversationId,
            });

          } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('error', { message: 'Failed to delete message' });
          }
        });

        socket.on('disconnect', () => {
          const userId = socket.data.userId;
          if (isProduction) {
            console.log(`Client disconnected: ${socket.id} (User: ${userId})`);
          }
          
          // Remove user from typing indicators
          typingUsers.forEach((users, conversationId) => {
            users.delete(userId);
            if (users.size === 0) {
              typingUsers.delete(conversationId);
            }
          });
          
          // Remove user socket mapping
          if (userId) {
            userSockets.delete(userId);
          }
        });
      });

      // Start the server
      const PORT = process.env.SOCKET_PORT || 8080;
      httpServer.listen(PORT, () => {
        if (isProduction) {
          console.log(`Enhanced Socket.io server running on port ${PORT}`);
        }
      });
    }

    return new Response('Enhanced Socket.io server is running', { status: 200 });
  } catch (error) {
    console.error('Error setting up socket.io server:', error);
    return new Response('Failed to set up socket.io server', { status: 500 });
  }
} 