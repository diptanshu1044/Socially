"use client";

import { Button } from "@/components/ui/button";
import { createNotificationWithSocket, getUnreadNotificationsCount } from "@/actions/notification.action";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export default function TestNotificationPage() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState<number | null>(null);

  const createTestNotification = async () => {
    if (!userId) {
      toast.error("You must be logged in to test notifications");
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Creating test notification for user:', userId);
      
      // Create a test notification
      const result = await createNotificationWithSocket({
        type: "LIKE",
        userId: userId, // Send to yourself for testing
        creatorId: userId,
        postId: "test-post-id",
      });

      console.log('🧪 Test notification result:', result);
      setLastResult(result);

      if (result.success) {
        toast.success("Test notification created! Check the notification badge and console for details.");
        
        // Wait a moment for the socket event to be processed
        setTimeout(async () => {
          await refreshNotificationCount();
        }, 1000);
      } else {
        toast.error("Failed to create test notification: " + result.error);
      }
    } catch (error) {
      console.error("Error creating test notification:", error);
      toast.error("Failed to create test notification");
      setLastResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const refreshNotificationCount = async () => {
    try {
      console.log('🔄 Refreshing notification count...');
      const count = await getUnreadNotificationsCount();
      console.log('📊 Current notification count:', count);
      setNotificationCount(count);
      toast.success(`Notification count: ${count}`);
    } catch (error) {
      console.error('❌ Error refreshing notification count:', error);
      toast.error('Failed to refresh notification count');
    }
  };

  return (
    <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container-mobile py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Test Notifications
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Click the button below to create a test notification and check if the badge appears on the notification icon.
            </p>
            
            <div className="space-y-3 mb-6">
              <Button 
                onClick={createTestNotification}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Test Notification"}
              </Button>
              
              <Button 
                onClick={refreshNotificationCount}
                variant="outline"
                className="w-full"
              >
                Refresh Notification Count
              </Button>
            </div>
            
            {notificationCount !== null && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">Current Notification Count:</h3>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{notificationCount}</p>
              </div>
            )}
            
            {lastResult && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Last Result:</h3>
                <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-auto">
                  {JSON.stringify(lastResult, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Instructions:</h3>
              <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>1. Click "Create Test Notification" button</li>
                <li>2. Click "Refresh Notification Count" to see current count</li>
                <li>3. Look at the notification bell icon in the navbar</li>
                <li>4. You should see a red badge with the number</li>
                <li>5. The badge should pulse and be clearly visible</li>
                <li>6. Check the browser console for detailed logs</li>
              </ol>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Debug Info:</h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>User ID: {userId || 'Not logged in'}</p>
                <p>Socket URL: {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080'}</p>
                <p>Socket Server URL: {process.env.SOCKET_SERVER_URL || 'http://localhost:8080'}</p>
                <p>Check browser console for socket connection logs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 