"use server";

import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";
import { prisma } from "@/lib/prisma";

export const createPost = async (content: string, imageUrl?: string) => {
  try {
    const userId = await getDbUserId();
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content,
        image: imageUrl ? imageUrl : null,
      },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (err) {
    console.log(err);
    return { success: false, error: "Failed to create Post" };
  }
};
