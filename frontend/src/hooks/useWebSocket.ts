import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import type { WebSocketMessage, Notification } from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onNotification?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(enabled: boolean, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Get auth token
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    // Create socket connection
    const socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      options.onConnect?.();
      toast.success('Connected to real-time updates');
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      options.onDisconnect?.();
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      options.onError?.(error);
      toast.error('Failed to connect to real-time updates');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      toast.success('Reconnected to real-time updates');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('WebSocket reconnection attempt', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      toast.error('Failed to reconnect to real-time updates');
    });

    // Message handlers
    socket.on('message', (message: WebSocketMessage) => {
      console.log('WebSocket message received:', message);
      setLastMessage(message);
      options.onMessage?.(message);
      handleMessage(message);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('WebSocket notification received:', notification);
      options.onNotification?.(notification);
      handleNotification(notification);
    });

    // Alert events
    socket.on('alert:created', (data) => {
      console.log('New alert:', data);
      toast.warning(`New ${data.severity} alert: ${data.title}`);
    });

    socket.on('alert:updated', (data) => {
      console.log('Alert updated:', data);
    });

    socket.on('alert:resolved', (data) => {
      console.log('Alert resolved:', data);
      toast.success(`Alert resolved: ${data.title}`);
    });

    // Threat events
    socket.on('threat:detected', (data) => {
      console.log('Threat detected:', data);
      toast.error(`Threat detected: ${data.name}`, {
        duration: 5000,
      });
    });

    socket.on('threat:updated', (data) => {
      console.log('Threat updated:', data);
    });

    // System events
    socket.on('system:health', (data) => {
      console.log('System health update:', data);
      if (data.status === 'critical') {
        toast.error('System health critical!');
      }
    });

    socket.on('system:service_down', (data) => {
      console.log('Service down:', data);
      toast.error(`Service down: ${data.service}`);
    });

    socket.on('system:service_up', (data) => {
      console.log('Service up:', data);
      toast.success(`Service restored: ${data.service}`);
    });

    // Stats updates
    socket.on('stats:update', (data) => {
      console.log('Stats update:', data);
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [enabled]);

  // Handle incoming messages
  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'alert':
        handleAlertMessage(message);
        break;
      case 'threat':
        handleThreatMessage(message);
        break;
      case 'notification':
        handleNotificationMessage(message);
        break;
      case 'stats':
        handleStatsMessage(message);
        break;
      case 'system':
        handleSystemMessage(message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const handleAlertMessage = (message: WebSocketMessage) => {
    const { action, data } = message;
    
    switch (action) {
      case 'create':
        toast.warning(`New alert: ${data.title}`, {
          description: data.description,
        });
        break;
      case 'update':
        // Silent update, just refresh data
        break;
      case 'delete':
        toast.info(`Alert deleted: ${data.title}`);
        break;
    }
  };

  const handleThreatMessage = (message: WebSocketMessage) => {
    const { action, data } = message;
    
    switch (action) {
      case 'create':
        toast.error(`Threat detected: ${data.name}`, {
          description: `Severity: ${data.severity}`,
          duration: 5000,
        });
        break;
      case 'update':
        // Silent update
        break;
    }
  };

  const handleNotificationMessage = (message: WebSocketMessage) => {
    const notification = message.data as Notification;
    handleNotification(notification);
  };

  const handleStatsMessage = (message: WebSocketMessage) => {
    // Stats updates are handled by the dashboard store
    console.log('Stats update received:', message.data);
  };

  const handleSystemMessage = (message: WebSocketMessage) => {
    const { data } = message;
    
    if (data.status === 'critical') {
      toast.error('System health critical!', {
        description: data.message,
      });
    } else if (data.status === 'degraded') {
      toast.warning('System performance degraded', {
        description: data.message,
      });
    }
  };

  const handleNotification = (notification: Notification) => {
    const toastOptions: any = {
      description: notification.message,
    };

    if (notification.action) {
      toastOptions.action = {
        label: notification.action.label,
        onClick: () => {
          window.location.href = notification.action!.url;
        },
      };
    }

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, toastOptions);
        break;
      case 'error':
        toast.error(notification.title, toastOptions);
        break;
      case 'warning':
        toast.warning(notification.title, toastOptions);
        break;
      case 'info':
        toast.info(notification.title, toastOptions);
        break;
    }
  };

  // Send message through WebSocket
  const sendMessage = (type: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(type, data);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  // Subscribe to specific event
  const subscribe = (event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  // Unsubscribe from event
  const unsubscribe = (event: string, handler?: (data: any) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
    socket: socketRef.current,
  };
}

// Hook for subscribing to specific WebSocket events
export function useWebSocketEvent(
  event: string,
  handler: (data: any) => void,
  enabled: boolean = true
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
      socket.disconnect();
    };
  }, [event, enabled]);

  return socketRef.current;
}
