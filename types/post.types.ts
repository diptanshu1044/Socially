import { Post } from "@prisma/client";

export interface NewPost extends Post {
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    postId: string;
    author: {
      id: string;
      username: string;
      image: string | null;
      name: string | null;
    };
  }[];
  likes: {
    userId: string;
  }[];
}
