"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

export const syncUser = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!(userId && user)) return null;

    const existingUser = await prisma?.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma?.user.create({
      data: {
        clerkId: userId,
        name: user.fullName,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (e) {
    console.log(e);
  }
  return {};
};

export const getUser = async (clerkId: string | null): Promise<User> => {
  try {
    return await prisma?.user.findFirst({
      where: {
        clerkId: clerkId || "",
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
    return {} as User;
  }
};

export const getDbUserId = async (): Promise<string | null> => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const user = await getUser(clerkId);
  if (!user) return null;
  return user.id;
};

export const getRandomUsers = async () => {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        orderBy: {
          id: "asc", // This is just a placeholder
        },
        take: 3,
      });
      // Shuffle the array
      const shuffled = users.sort(() => Math.random() - 0.5);
      return shuffled;
    } else {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              NOT: {
                id: userId,
              },
            },
            {
              NOT: {
                followers: {
                  some: {
                    followerId: userId,
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        take: 10, // Get more than needed
      });

      // Shuffle and take first 3
      const shuffled = users.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    }
  } catch (e) {
    console.log(`Error fetching random users: ${e}`);
    return [];
  }
};

export const toggleFollow = async (targetUserId: string) => {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized: User not found");
    if (userId === targetUserId) throw new Error("Cannot follow yourself");

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
      return { success: true, follow: false };
    } else {
      await prisma.$transaction([
        prisma.follow.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,
            creatorId: userId,
          },
        }),
      ]);
      return { success: true, follow: true }; // Following after follow
    }
  } catch (e) {
    console.log("Error in toggleFollow:", e);
    throw e; // Re-throw for client to handle
  }
};

export const getCurrentUser = async () => {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Unauthorized: User not found");

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    revalidateTag("user");
    return user;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
