const { Server } = require('socket.io');
const { createServer } = require('http');
const { PrismaClient } = require('../node_modules/@prisma/client');

const prisma = new PrismaClient();

// Create HTTP server
const httpServer = createServer();

// Get network configuration
const getNetworkIP = () => {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
};

const networkIP = getNetworkIP();
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Network IP: ${networkIP}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: isProduction ? [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}` : null,
      // Allow specific production domains
      "https://your-app.vercel.app",
      "https://your-app.netlify.app"
    ].filter(Boolean) : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      `http://${networkIP}:3000`,
      `https://${networkIP}:3000`,
      "http://0.0.0.0:3000",
      "https://0.0.0.0:3000",
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}` : null,
      // Allow all origins for development
      "*"
    ].filter(Boolean),
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  path: '/api/socket',
  addTrailingSlash: false,
  transports: ['websocket', 'polling'],
  pingTimeout: isProduction ? 30000 : 60000,
  pingInterval: isProduction ? 15000 : 25000,
  allowEIO3: true
});

// Store typing states
const typingUsers = new Map();
const userSockets = new Map();

// Middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (isProduction) {
      console.log(`Auth attempt for socket ${socket.id}, token: ${token ? 'present' : 'missing'}`);
    }
    
    if (!token) {
      console.error(`No token provided for socket: ${socket.id}`);
      return next(new Error('Authentication error'));
    }
    
    // For now, we'll trust the token and get user ID from client
    // In production, you'd verify the token here
    if (isProduction) {
      console.log(`Authentication successful for socket: ${socket.id}`);
    }
    next();
  } catch (error) {
    console.error(`Authentication failed for socket ${socket.id}:`, error);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join user's personal room for notifications
  socket.on('set-user-id', (userId) => {
    if (isProduction) {
      console.log(`Setting user ID: ${userId} for socket: ${socket.id}`);
    }
    if (!userId) {
      console.error('No userId provided for socket:', socket.id);
      socket.emit('error', { message: 'User ID is required' });
      return;
    }
    
    // Check if user already has a socket connection
    const existingSocketId = userSockets.get(userId);
    if (existingSocketId && io.sockets.sockets.has(existingSocketId)) {
      if (isProduction) {
        console.log(`User ${userId} already has an active connection. Disconnecting old socket: ${existingSocketId}`);
      }
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.disconnect(true);
      }
    }
    
    socket.data.userId = userId;
    userSockets.set(userId, socket.id);
    socket.join(`user:${userId}`);
    if (isProduction) {
      console.log(`User ${userId} connected successfully with socket: ${socket.id}`);
    }
    
    // Emit success confirmation to client
    socket.emit('user-id-set', { userId, socketId: socket.id });
  });

  // Join a conversation room
  socket.on('join-conversation', async (conversationId) => {
    try {
      const userId = socket.data.userId;
      if (isProduction) {
        console.log(`Join conversation request: conversationId=${conversationId}, userId=${userId}`);
      }
      
      if (!userId) {
        console.error('No userId found for socket:', socket.id);
        socket.emit('join-conversation-error', { message: 'User not authenticated' });
        return;
      }

      if (!conversationId) {
        console.error('No conversationId provided');
        socket.emit('join-conversation-error', { message: 'No conversation ID provided' });
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
        console.error(`User ${userId} not authorized to join conversation ${conversationId}`);
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
  socket.on('leave-conversation', (conversationId) => {
    const userId = socket.data.userId;
    socket.leave(conversationId);
    
    // Clear typing indicator
    const conversationTypingUsers = typingUsers.get(conversationId);
    if (conversationTypingUsers) {
      conversationTypingUsers.delete(userId);
      if (conversationTypingUsers.size === 0) {
        typingUsers.delete(conversationId);
      }
    }
    
    console.log(`User ${userId} left conversation: ${conversationId}`);
    
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
      
      console.log('Received message:', { conversationId, message, messageType, userId });
      
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

  // Handle typing indicators
  socket.on('typing-indicator', async (data) => {
    try {
      const { conversationId, isTyping } = data;
      const userId = socket.data.userId;
      
      console.log('Received typing indicator:', { conversationId, isTyping, userId });
      
      if (!userId) {
        console.error('No userId found for typing indicator');
        return;
      }

      if (!conversationId) {
        console.error('No conversationId provided for typing indicator');
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
        console.error(`User ${userId} not authorized for conversation ${conversationId}`);
        return;
      }

      if (isTyping) {
        if (!typingUsers.has(conversationId)) {
          typingUsers.set(conversationId, new Set());
        }
        const users = typingUsers.get(conversationId);
        if (users) {
          users.add(userId);
        }
      } else {
        const conversationTypingUsers = typingUsers.get(conversationId);
        if (conversationTypingUsers) {
          conversationTypingUsers.delete(userId);
          if (conversationTypingUsers.size === 0) {
            typingUsers.delete(conversationId);
          }
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
    console.log(`Client disconnected: ${socket.id} (User: ${userId})`);
    
    // Remove user from typing indicators
    typingUsers.forEach((users, conversationId) => {
      if (users && userId) {
        users.delete(userId);
        if (users.size === 0) {
          typingUsers.delete(conversationId);
        }
      }
    });
    
    // Remove user socket mapping only if this socket is the current one for the user
    if (userId && userSockets.get(userId) === socket.id) {
      userSockets.delete(userId);
      console.log(`Removed user ${userId} from socket mapping`);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
const SOCKET_PORT = process.env.SOCKET_PORT || 8080;

httpServer.listen(SOCKET_PORT, () => {
  console.log(`🚀 Socket server running on port ${SOCKET_PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  if (isProduction) {
    console.log(`🔒 Production mode enabled`);
    console.log(`📊 CORS origins: ${io.engine.opts.cors.origin.join(', ')}`);
  } else {
    console.log(`🔧 Development mode enabled`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
}); 