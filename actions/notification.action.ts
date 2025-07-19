"use server";

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
