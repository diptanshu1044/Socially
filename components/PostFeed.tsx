"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PostCard } from "./PostCard";
// Client component for handling infinite scroll
export function PostFeed({ initialPosts, initialHasMore, dbUserId }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [page, setPage] = useState(2); // Start with page 2 since we loaded page 1 initially
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const loaderRef = useRef(null);
  const loadedPostIds = useRef(new Set(initialPosts.map((post) => post.id)));

  // Function to load more posts
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // Call the API endpoint for paginated posts
      const result = await fetch(`/api/posts?page=${page}&limit=10`);
      const data = await result.json();

      if (data.posts && data.posts.length > 0) {
        // Filter out any posts that we've already loaded (prevent duplicates)
        const newPosts = data.posts.filter(
          (post) => !loadedPostIds.current.has(post.id),
        );

        if (newPosts.length > 0) {
          // Add new post IDs to our tracking Set
          newPosts.forEach((post) => loadedPostIds.current.add(post.id));

          // Update state with new posts
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
          setPage((prevPage) => prevPage + 1);
        } else if (data.hasMore) {
          // If we filtered out all posts but there are supposedly more,
          // try the next page immediately
          setPage((prevPage) => prevPage + 1);
          // We don't update loading state here to trigger another fetch
          return;
        }
      }

      // Update whether we have more posts to load
      setHasMore(data.hasMore && data.posts.length > 0);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMore, loading, loadMorePosts]);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} dbUserId={dbUserId} />
      ))}

      {/* Loading indicator and trigger for next page */}
      <div ref={loaderRef} className="py-6 text-center">
        {loading && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Loading more posts...</p>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-sm">You&apos;ve reached the end!</p>
        )}
      </div>
    </div>
  );
}
