"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { UserCard } from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Users, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function FindFriendsPage() {
  // State for paginated users
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // State for search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Ref for search input
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch paginated users
  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/all?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users function
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchUsers]);

  // Load initial users
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  // Focus search bar and type if user starts typing anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in a textarea or contenteditable (but NOT input)
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)
      ) {
        return;
      }
      // Printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setSearchTerm(prev => prev + e.key);
          e.preventDefault();
        }
      }
      // Backspace
      if (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setSearchTerm(prev => prev.slice(0, -1));
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search on Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.length >= 2) {
      searchUsers(searchTerm);
    }
  };

  // Loading state for initial load
  if (loading && users.length === 0 && !isSearching) {
    return (
      <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container-mobile py-4">
          <div className="mobile-card">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Find Friends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    );
  }

  // Determine which users to display
  const displayUsers = isSearching ? searchResults : users;
  const displayLoading = isSearching ? searchLoading : loading;
  const showPagination = !isSearching && pagination && pagination.totalPages > 1;

  return (
    <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Find Friends</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search users by name or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10"
              disabled={searchLoading}
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Users Grid */}
          <div className="space-y-4 pb-24">
            {displayLoading && displayUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isSearching ? "No users found" : "No users found"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isSearching ? "Try a different search" : "Try refreshing the page"}
                  </p>
                </div>
              </div>
            ) : (
              displayUsers.map((user) => (
                <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <UserCard user={user} />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="fixed bottom-20 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between max-w-sm mx-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  {pagination.page} / {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Friends</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={searchInputRef}
              placeholder="Search users by name or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-12"
              disabled={searchLoading}
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {displayLoading && displayUsers.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm">
                  <Users className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-3">
                    {isSearching ? "No users found" : "No users found"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isSearching ? "Try a different search" : "Try refreshing the page"}
                  </p>
                </div>
              </div>
            ) : (
              displayUsers.map((user) => (
                <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <UserCard user={user} />
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="flex justify-center">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 