import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface TypingState {
  [userId: string]: boolean;
}

interface PresenceState {
  [userId: string]: {
    status: 'online' | 'offline';
    lastSeen: Date | null;
  };
}

export function useSocket(options: UseSocketOptions = { autoConnect: true }) {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<TypingState>({});
  const [presenceState, setPresenceState] = useState<PresenceState>({});

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || socketRef.current?.connected) return;

    const socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Unread count updates
    socket.on('unread:count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    // Typing updates
    socket.on('typing:update', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: data.isTyping,
      }));
    });

    // Presence updates
    socket.on('user:status', (data: { userId: string; status: 'online' | 'offline'; lastSeen?: Date }) => {
      setPresenceState((prev) => ({
        ...prev,
        [data.userId]: {
          status: data.status,
          lastSeen: data.lastSeen ? new Date(data.lastSeen) : null,
        },
      }));
    });

    socket.on('presence:status', (data: { statuses: Array<{ userId: string; status: 'online' | 'offline'; lastSeen: Date | null }> }) => {
      const newState: PresenceState = {};
      data.statuses.forEach((s) => {
        newState[s.userId] = {
          status: s.status,
          lastSeen: s.lastSeen ? new Date(s.lastSeen) : null,
        };
      });
      setPresenceState((prev) => ({ ...prev, ...newState }));
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (options.autoConnect && isAuthenticated) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, options.autoConnect, connect, disconnect]);

  // Message methods
  const sendMessage = useCallback((receiverId: string, content: string, bookingId?: string) => {
    socketRef.current?.emit('message:send', { receiverId, content, bookingId });
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    socketRef.current?.emit('message:read', { messageId });
  }, []);

  const markConversationAsRead = useCallback((partnerId: string) => {
    socketRef.current?.emit('conversation:read', { partnerId });
  }, []);

  // Typing methods
  const startTyping = useCallback((receiverId: string) => {
    socketRef.current?.emit('typing:start', { receiverId });
  }, []);

  const stopTyping = useCallback((receiverId: string) => {
    socketRef.current?.emit('typing:stop', { receiverId });
  }, []);

  // Presence methods
  const checkPresence = useCallback((userIds: string[]) => {
    socketRef.current?.emit('presence:check', { userIds });
  }, []);

  // Subscribe to events
  const on = useCallback(<T>(event: string, callback: (data: T) => void) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    socketRef.current?.off(event, callback);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    unreadCount,
    typingUsers,
    presenceState,
    connect,
    disconnect,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    startTyping,
    stopTyping,
    checkPresence,
    on,
    off,
  };
}
