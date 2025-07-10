"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getDbUserId } from "./user.action";
import { prisma } from "@/lib/prisma";

// Cache for conversations to reduce database queries
const conversationCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or fetch from database
async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = conversationCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetchFn();
  conversationCache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Clear cache for a specific conversation
function clearConversationCache(conversationId: string) {
  conversationCache.delete(`conversation:${conversationId}`);
  conversationCache.delete(`messages:${conversationId}`);
}

export const createConversation = async (participantIds: string[], name?: string) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("User not authenticated");

    // Add current user to participants if not already included
    const allParticipantIds = [...new Set([currentUserId, ...participantIds])];
    
    const isGroup = allParticipantIds.length > 2;

    // For 1-on-1 conversations, check if a conversation already exists
    if (!isGroup) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: {
                in: allParticipantIds,
              },
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
          },
          messages: {
            take: 20,
            orderBy: {
              createdAt: "desc",
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
          },
        },
      });

      // Check if the conversation has exactly the right number of participants
      if (existingConversation && existingConversation.participants.length === allParticipantIds.length) {
        revalidatePath("/chat");
        revalidateTag("conversations");
        return { success: true, conversation: existingConversation };
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        name: name || (isGroup ? `Group Chat` : null),
        isGroup,
        participants: {
          create: allParticipantIds.map((userId, index) => ({
            userId,
            role: index === 0 ? "ADMIN" : "MEMBER", // First user is admin
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          take: 20,
          orderBy: {
            createdAt: "desc",
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
        },
      },
    });

    // Clear cache for new conversation
    clearConversationCache(conversation.id);
    revalidatePath("/chat");
    revalidateTag("conversations");
    
    return { success: true, conversation };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return { success: false, error: "Failed to create conversation" };
  }
};

export const sendMessage = async (conversationId: string, content: string, messageType: "TEXT" | "IMAGE" | "FILE" = "TEXT") => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("User not authenticated");

    // Verify user is part of the conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) throw new Error("User not part of conversation");

    const message = await prisma.message.create({
      data: {
        content,
        messageType,
        conversationId,
        senderId: currentUserId,
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

    // Clear cache for this conversation
    clearConversationCache(conversationId);
    revalidatePath("/chat");
    revalidateTag("conversations");

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
};

export const getConversations = async () => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return [];

    return await getCachedOrFetch(
      `conversations:${currentUserId}`,
      async () => {
        const conversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: currentUserId,
              },
            },
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: {
                createdAt: "desc",
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
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        });

        return conversations;
      },
      2 * 60 * 1000 // 2 minutes cache for conversations list
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const getConversationMessages = async (conversationId: string, page = 1, limit = 50) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return { messages: [], hasMore: false };

    // Verify user is part of the conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) throw new Error("User not part of conversation");

    return await getCachedOrFetch(
      `messages:${conversationId}:${page}:${limit}`,
      async () => {
        const skip = (page - 1) * limit;

        const messages = await prisma.message.findMany({
          where: {
            conversationId,
            isDeleted: false,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
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

        const hasMore = messages.length === limit;

        return {
          messages: messages.reverse(), // Reverse to show oldest first
          hasMore,
        };
      },
      1 * 60 * 1000 // 1 minute cache for messages
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], hasMore: false };
  }
};

export const editMessage = async (messageId: string, newContent: string) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("User not authenticated");

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

    if (!message || message.senderId !== currentUserId) {
      throw new Error("Not authorized to edit this message");
    }

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

    // Clear cache for this conversation
    clearConversationCache(message.conversationId);
    revalidatePath("/chat");

    return { success: true, message: updatedMessage };
  } catch (error) {
    console.error("Error editing message:", error);
    return { success: false, error: "Failed to edit message" };
  }
};

export const deleteMessage = async (messageId: string) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("User not authenticated");

    // Verify user owns the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== currentUserId) {
      throw new Error("Not authorized to delete this message");
    }

    // Soft delete message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    // Clear cache for this conversation
    clearConversationCache(message.conversationId);
    revalidatePath("/chat");

    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message" };
  }
};

export const markMessagesAsRead = async (conversationId: string, messageIds: string[]) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("User not authenticated");

    // Verify user is part of the conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) throw new Error("User not part of conversation");

    // In a real implementation, you might want to store read receipts
    // For now, we'll just return success
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
};

export const searchMessages = async (conversationId: string, query: string) => {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return { messages: [] };

    // Verify user is part of the conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
    });

    if (!participant) throw new Error("User not part of conversation");

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        content: {
          contains: query,
          mode: 'insensitive',
        },
        isDeleted: false,
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
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

    return { messages };
  } catch (error) {
    console.error("Error searching messages:", error);
    return { messages: [] };
  }
}; 