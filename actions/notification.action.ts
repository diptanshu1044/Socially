"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export interface NotificationResponse {
  notifications: any[];
  hasMore: boolean;
  totalCount: number;
}

export const getNotifications = async (page: number = 1, limit: number = 20) => {
  try {
    const userId = await getDbUserId();
    if (!userId) return { notifications: [], hasMore: false, totalCount: 0 };

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get notifications with pagination
    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              image: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({
        where: {
          userId,
        },
      }),
    ]);

    const hasMore = offset + notifications.length < totalCount;

    return {
      notifications,
      hasMore,
      totalCount,
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getUnreadNotificationsCount = async () => {
  try {
    const userId = await getDbUserId();
    if (!userId) return 0;

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false };

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
}

export async function deleteOldNotifications() {
  try {
    // Delete notifications older than 1 month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: oneMonthAgo,
        },
      },
    });

    console.log(`Deleted ${result.count} old notifications`);
    return { success: true, deletedCount: result.count };
  } catch (error) {
    console.error("Error deleting old notifications:", error);
    return { success: false, deletedCount: 0 };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false };

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId, // Ensure user can only delete their own notifications
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false };
  }
}

// Real-time notification creation functions
export async function createNotificationWithSocket(notificationData: {
  type: 'LIKE' | 'COMMENT' | 'FOLLOW';
  userId: string;
  creatorId: string;
  postId?: string;
  commentId?: string;
  likeId?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: notificationData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    // Emit real-time notification via socket server
    try {
      const socketUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:8080';
      const response = await fetch(`${socketUrl}/api/socket/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification,
        }),
      });

      if (!response.ok) {
        console.error('Failed to emit notification via socket server');
      } else {
        const result = await response.json();
        console.log('✅ Notification emitted via socket:', result);
      }
    } catch (socketError) {
      console.error('Socket server communication error:', socketError);
    }

    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return 0;
    }

    // Get the database user ID
    const dbUserId = await getDbUserId();
    if (!dbUserId) {
      return 0;
    }

    // Count messages in conversations where the user is a participant
    // but the message is not from the user (i.e., messages from others)
    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              userId: dbUserId,
            },
          },
        },
        senderId: {
          not: dbUserId,
        },
        isDeleted: false,
      },
    });

    return unreadCount;
  } catch (error) {
    console.error('Error getting unread messages count:', error);
    return 0;
  }
}
