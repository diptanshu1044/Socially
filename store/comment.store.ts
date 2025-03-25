import { create } from "zustand";

interface CommentStore {
  postId: string;
  showCommentSection: boolean;
  setPostId: (postId: string) => void;
  setShowCommentSection: (showCommentSection: boolean) => void;
}

export const useCommentStore = create<CommentStore>((set) => ({
  postId: "",
  showCommentSection: false,
  setPostId: (postId: string) => set({ postId }),
  setShowCommentSection: (showCommentSection: boolean) =>
    set({ showCommentSection }),
}));
