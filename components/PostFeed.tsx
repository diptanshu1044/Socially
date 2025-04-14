"use client";

import { useState, useEffect, useRef } from "react";
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
  const loadMorePosts = async () => {
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
  };

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading]);

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} dbUserId={dbUserId} />
      ))}

      {/* Loading indicator and trigger for next page */}
      <div ref={loaderRef} className="py-4 text-center">
        {loading && <p className="text-gray-500">Loading more posts...</p>}
        {!hasMore && posts.length > 0 && (
          <p className="text-gray-500">No more posts to show</p>
        )}
      </div>
    </>
  );
}
