"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

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
