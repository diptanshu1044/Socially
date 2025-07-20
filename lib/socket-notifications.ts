import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { getUnreadNotificationsCount } from '@/actions/notification.action';

export interface NotificationData {
  type: 'LIKE' | 'COMMENT' | 'FOLLOW';
  userId: string;
  creatorId: string;
  postId?: string;
  commentId?: string;
  likeId?: string;
}

export interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW';
  userId: string;
  creatorId: string;
  read: boolean;
  postId?: string;
  commentId?: string;
  likeId?: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  post?: {
    id: string;
    content: string;
    image?: string;
  };
  comment?: {
    id: string;
    content: string;
    createdAt: string;
  };
}

class NotificationSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';
      console.log('🔧 Initializing socket with URL:', socketUrl);
      
      this.socket = io(socketUrl, {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
        forceNew: true,
      });

      console.log('🔧 Socket initialized, setting up event listeners');
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) {
      console.error('❌ No socket available for event listeners');
      return;
    }

    console.log('🔧 Setting up socket event listeners');

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket-connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected, reason:', reason);
      this.isConnected = false;
      this.emit('socket-disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.reconnectAttempts++;
      this.emit('socket-error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socket-connected');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔌 Socket reconnection error:', error);
      this.emit('socket-error', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 Socket reconnection failed after', this.maxReconnectAttempts, 'attempts');
      this.emit('socket-error', new Error('Reconnection failed'));
    });

    // Notification events
    this.socket.on('new-notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      this.emit('new-notification', notification);
      
      // Show toast notification
      const message = this.getNotificationMessage(notification);
      toast(message, {
        description: this.getNotificationDescription(notification),
        action: {
          label: 'View',
          onClick: () => this.handleNotificationClick(notification),
        },
      });
    });

    this.socket.on('notifications-read', (data: { notificationIds: string[] }) => {
      console.log('✅ Notifications marked as read:', data);
      this.emit('notifications-read', data);
    });

    this.socket.on('notification-deleted', (data: { notificationId: string }) => {
      console.log('🗑️ Notification deleted:', data);
      this.emit('notification-deleted', data);
    });

    this.socket.on('notifications-count', (data: { unreadCount: number }) => {
      console.log('📊 Notifications count updated:', data);
      this.emit('notifications-count', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('🔌 Socket error:', error);
      this.emit('socket-error', error);
    });

    console.log('🔧 Socket event listeners setup complete');
  }

  private getNotificationMessage(notification: Notification): string {
    const creatorName = notification.creator.name || notification.creator.username;
    
    switch (notification.type) {
      case 'LIKE':
        return `${creatorName} liked your post`;
      case 'COMMENT':
        return `${creatorName} commented on your post`;
      case 'FOLLOW':
        return `${creatorName} started following you`;
      default:
        return 'New notification';
    }
  }

  private getNotificationDescription(notification: Notification): string {
    if (notification.post?.content) {
      return notification.post.content.length > 50 
        ? notification.post.content.substring(0, 50) + '...'
        : notification.post.content;
    }
    return '';
  }

  private handleNotificationClick(notification: Notification) {
    // Navigate to the appropriate page based on notification type
    if (notification.postId) {
      // Navigate to the post
      window.location.href = `/?post=${notification.postId}`;
    } else if (notification.type === 'FOLLOW') {
      // Navigate to the user's profile
      window.location.href = `/profile/${notification.creator.username}`;
    }
  }

  public async connect(userId: string, token: string) {
    console.log('🔌 Connect method called with userId:', userId);
    
    if (!this.socket) {
      console.log('🔧 Socket not initialized, reinitializing...');
      this.initializeSocket();
    }

    if (this.socket && !this.isConnected) {
      console.log('🔌 Setting up socket authentication...');
      this.socket.auth = { token };
      
      console.log('🔌 Attempting to connect to socket server...');
      this.socket.connect();
      
      this.socket.once('connect', async () => {
        console.log('🔌 Socket connected, setting user ID...');
        this.socket?.emit('set-user-id', userId);
        
        // Fetch and emit initial notification count
        try {
          const unreadCount = await getUnreadNotificationsCount();
          console.log('📊 Initial notification count:', unreadCount);
          this.emit('notifications-count', { unreadCount });
        } catch (error) {
          console.error('❌ Failed to fetch initial notification count:', error);
        }
      });
    } else {
      console.log('🔌 Socket already connected or connecting...');
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  public createNotification(notificationData: NotificationData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('create-notification', notificationData);
    }
  }

  public markNotificationsAsRead(notificationIds: string[]) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark-notifications-read', notificationIds);
    }
  }

  public deleteNotification(notificationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('delete-notification', notificationId);
    }
  }

  public getNotificationsCount() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get-notifications-count');
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  public off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Create a singleton instance
const notificationSocketService = new NotificationSocketService();

export default notificationSocketService; 