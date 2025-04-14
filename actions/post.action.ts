"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getDbUserId } from "./user.action";
import { prisma } from "@/lib/prisma";

export const createPost = async (content: string, imageUrl?: string) => {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "User not found" };
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

export const getPosts = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // Count total posts for determining if there are more
    const totalPosts = await prisma.post.count();

    return {
      posts,
      hasMore: skip + posts.length < totalPosts,
      totalPosts,
    };
  } catch (e) {
    console.log(`Failed to get posts: ${e}`);
    throw new Error("Failed to get posts");
  }
};

export const toggleLike = async (postId: string) => {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
    } else {
      const newLike = await prisma.$transaction([
        prisma.like.create({
          data: {
            postId,
            userId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  postId,
                  userId: post.authorId,
                  creatorId: userId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.log(`Failed to like post: ${e}`);
    return { success: false, error: "Failed to like post" };
  }
};

export const createComment = async (postId: string, content: string) => {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (e) {
    console.log(`Error Commenting`);
    throw e;
  }
};

export const deletePost = async (postId: string) => {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("Failed to delete post");

    if (userId !== post.authorId)
      throw new Error(
        "Unauthorized, You do not have the permission to delete this post",
      );

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.log(`Error while deleting post`);
    throw e;
  }
};
