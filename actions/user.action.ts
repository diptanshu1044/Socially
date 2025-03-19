"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

export const getDbUserId = async (): Promise<string> => {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("unauthorized");
  const user = await getUser(clerkId);
  if (!user) throw new Error("User not found");
  return user.id;
};

export const getRandomUsers = async () => {
  try {
    const userId = await getDbUserId();
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
          },
        },
      },
      take: 3,
    });

    return users;
  } catch (e) {
    console.log(`Error fetching random users: ${e}`);
    return [];
  }
};

export const toggleFollow = async (targetUserId: string) => {
  try {
    const userId = await getDbUserId();
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
    }
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.log(e);
    return { success: false, error: e };
  }
};
