'use client';

import { useEffect, useState } from 'react';
import { useChat } from './ChatProvider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, Wifi, WifiOff, Clock, MessageSquare } from 'lucide-react';

export function ChatPerformanceMonitor() {
  const { isConnected, socket, currentUserId } = useChat();
  const [metrics, setMetrics] = useState({
    messageCount: 0,
    connectionTime: 0,
    lastMessageTime: 0,
    averageResponseTime: 0,
  });

  useEffect(() => {
    if (!socket) return;

    let connectionStartTime = Date.now();
    let messageCount = 0;
    let totalResponseTime = 0;
    let responseCount = 0;

    const updateMetrics = () => {
      setMetrics({
        messageCount,
        connectionTime: Date.now() - connectionStartTime,
        lastMessageTime: Date.now(),
        averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      });
    };

    const handleMessage = () => {
      messageCount++;
      updateMetrics();
    };

    const handleResponse = (responseTime: number) => {
      totalResponseTime += responseTime;
      responseCount++;
      updateMetrics();
    };

    socket.on('new-message', handleMessage);
    socket.on('message-sent', () => {
      const responseTime = Date.now() - metrics.lastMessageTime;
      handleResponse(responseTime);
    });

    const interval = setInterval(updateMetrics, 5000);

    return () => {
      socket.off('new-message', handleMessage);
      socket.off('message-sent');
      clearInterval(interval);
    };
  }, [socket, metrics.lastMessageTime]);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getConnectionStatus = () => {
    if (!socket) return { status: 'disconnected', icon: WifiOff, color: 'bg-red-500' };
    if (isConnected) return { status: 'connected', icon: Wifi, color: 'bg-green-500' };
    return { status: 'connecting', icon: Activity, color: 'bg-yellow-500' };
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connection</CardTitle>
          <div className={`w-2 h-2 rounded-full ${connectionStatus.color}`}></div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <StatusIcon className="w-4 h-4 text-gray-500" />
            <span className="text-2xl font-bold capitalize">{connectionStatus.status}</span>
          </div>
          <p className="text-xs text-gray-500">
            {formatTime(metrics.connectionTime)} uptime
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages</CardTitle>
          <MessageSquare className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.messageCount}</div>
          <p className="text-xs text-gray-500">
            Total messages sent
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          <Clock className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(metrics.averageResponseTime)}</div>
          <p className="text-xs text-gray-500">
            Average response time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User</CardTitle>
          <Badge variant="secondary">Active</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentUserId ? 'Online' : 'Offline'}
          </div>
          <p className="text-xs text-gray-500">
            {currentUserId ? 'User authenticated' : 'Not authenticated'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 