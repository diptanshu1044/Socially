"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import notificationSocketService from "@/lib/socket-notifications";

export default function TestSocketPage() {
  const { userId, getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Not connected");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Test basic socket connection
    const testSocketConnection = async () => {
      try {
        addLog("🔍 Testing socket connection...");
        
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';
        addLog(`🔗 Socket URL: ${socketUrl}`);
        
        // Test if socket server is reachable
        const healthResponse = await fetch(`${socketUrl}/health`);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          addLog(`✅ Socket server health check: ${JSON.stringify(healthData)}`);
        } else {
          addLog(`❌ Socket server health check failed: ${healthResponse.status}`);
        }
      } catch (error) {
        addLog(`❌ Socket server connection error: ${error.message}`);
      }
    };

    testSocketConnection();
  }, []);

  const connectToSocket = async () => {
    if (!userId) {
      addLog("❌ No user ID available");
      toast.error("You must be logged in to test socket connection");
      return;
    }

    try {
      addLog(`🔌 Attempting to connect user: ${userId}`);
      
      const token = await getToken();
      if (!token) {
        addLog("❌ No token available");
        toast.error("No authentication token available");
        return;
      }

      addLog("🔑 Token obtained, connecting to socket...");
      
      // Set up event listeners before connecting
      notificationSocketService.on('socket-connected', () => {
        addLog("✅ Socket connected successfully");
        setIsConnected(true);
        setConnectionStatus("Connected");
        toast.success("Socket connected!");
      });

      notificationSocketService.on('socket-disconnected', () => {
        addLog("🔌 Socket disconnected");
        setIsConnected(false);
        setConnectionStatus("Disconnected");
      });

      notificationSocketService.on('socket-error', (error) => {
        addLog(`❌ Socket error: ${error.message || error}`);
        setIsConnected(false);
        setConnectionStatus("Error");
        toast.error("Socket connection error");
      });

      notificationSocketService.on('new-notification', (notification) => {
        addLog(`🔔 New notification received: ${notification.id}`);
        toast.success("New notification received!");
      });

      notificationSocketService.on('notifications-count', (data) => {
        addLog(`📊 Notifications count update: ${data.unreadCount}`);
      });

      // Connect to socket
      await notificationSocketService.connect(userId, token);
      addLog("🚀 Socket connection initiated");
      
    } catch (error) {
      addLog(`❌ Failed to connect to socket: ${error.message}`);
      toast.error("Failed to connect to socket");
    }
  };

  const disconnectFromSocket = () => {
    try {
      notificationSocketService.disconnect();
      addLog("🔌 Socket disconnected manually");
      setIsConnected(false);
      setConnectionStatus("Disconnected");
      toast.success("Socket disconnected");
    } catch (error) {
      addLog(`❌ Error disconnecting: ${error.message}`);
    }
  };

  const testNotification = async () => {
    try {
      addLog("🧪 Testing notification emission...");
      
      const socketUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:8080';
      const response = await fetch(`${socketUrl}/api/socket/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification: {
            id: 'test-notification-' + Date.now(),
            userId: userId,
            type: 'LIKE',
            read: false,
            createdAt: new Date().toISOString(),
            creator: {
              id: userId,
              name: 'Test User',
              username: 'testuser',
            }
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        addLog(`✅ Test notification sent: ${JSON.stringify(result)}`);
        toast.success("Test notification sent!");
      } else {
        const error = await response.text();
        addLog(`❌ Test notification failed: ${error}`);
        toast.error("Test notification failed");
      }
    } catch (error) {
      addLog(`❌ Test notification error: ${error.message}`);
      toast.error("Test notification error");
    }
  };

  return (
    <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container-mobile py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Socket Connection Test
            </h1>
            
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Connection Status:</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    isConnected 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {connectionStatus}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">User ID:</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                    {userId || 'Not logged in'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={connectToSocket}
                  disabled={isConnected}
                  className="w-full"
                >
                  Connect to Socket
                </Button>
                
                <Button 
                  onClick={disconnectFromSocket}
                  disabled={!isConnected}
                  variant="outline"
                  className="w-full"
                >
                  Disconnect from Socket
                </Button>
                
                <Button 
                  onClick={testNotification}
                  disabled={!isConnected}
                  variant="secondary"
                  className="w-full"
                >
                  Test Notification Emission
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Debug Logs:</h3>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No logs yet...</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-slate-700 dark:text-slate-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Environment Info:</h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>NEXT_PUBLIC_SOCKET_URL: {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080'}</p>
                <p>SOCKET_SERVER_URL: {process.env.SOCKET_SERVER_URL || 'http://localhost:8080'}</p>
                <p>NODE_ENV: {process.env.NODE_ENV || 'development'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 