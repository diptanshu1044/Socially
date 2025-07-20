"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUnreadMessagesCount } from '@/actions/notification.action';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function TestMessagesPage() {
  const { userId } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const fetchUnreadCount = async () => {
    setLoading(true);
    try {
      addLog('🔍 Fetching unread messages count...');
      const count = await getUnreadMessagesCount();
      addLog(`📱 Unread messages count: ${count}`);
      setUnreadCount(count);
    } catch (error) {
      addLog(`❌ Error fetching unread count: ${error}`);
      toast.error('Failed to fetch unread count');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
    }
  }, [userId]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Test Messages Count</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">User ID:</span>
              <span className="text-sm text-gray-600">{userId || 'Not logged in'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Unread Messages:</span>
              <span className="text-2xl font-bold text-red-500">{unreadCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button 
          onClick={fetchUnreadCount} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Refreshing...' : 'Refresh Count'}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet...</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">How to Test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open this page in one browser tab</li>
          <li>Open the chat page in another tab</li>
          <li>Send a message to yourself or another user</li>
          <li>Come back to this page and click "Refresh Count"</li>
          <li>The count should show the number of unread messages</li>
        </ol>
      </div>
    </div>
  );
} 