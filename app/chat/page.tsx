'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

export default function ChatPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otherUser, setOtherUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      router.push("/signin");
      return;
    }
  }, [userId, isLoaded, router]);

  if (!isLoaded) {
    return <LoadingSkeleton />;
  }

  if (!userId) {
    return null; // Will redirect to signin
  }

  // Get selected user from URL parameters
  const selectedUserId = searchParams.get('user');

  return (
    <ChatInterface 
      selectedUserId={selectedUserId || undefined}
      onOtherUserChange={setOtherUser}
    />
  );
} 