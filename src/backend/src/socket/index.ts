import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userEmail: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Track online users
const onlineUsers = new Map<string, { socketId: string; lastSeen: Date }>();

export function initializeSocket(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      (socket as AuthenticatedSocket).userId = decoded.userId;
      (socket as AuthenticatedSocket).userEmail = decoded.email;
      next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    logger.info({ userId, socketId: socket.id }, 'User connected to WebSocket');

    // Track online status
    onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Notify others that user is online
    socket.broadcast.emit('user:status', { userId, status: 'online' });

    // Send unread message count
    const unreadCount = await prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
    socket.emit('unread:count', { count: unreadCount });

    // ============================================
    // Message Events
    // ============================================

    // Send message
    socket.on('message:send', async (data: { receiverId: string; content: string; bookingId?: string }) => {
      try {
        const { receiverId, content, bookingId } = data;

        // Save message to database
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId,
            content,
            bookingId,
          },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
            receiver: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        });

        // Send to sender (confirmation)
        socket.emit('message:sent', message);

        // Send to receiver if online
        io.to(`user:${receiverId}`).emit('message:new', message);

        // Update unread count for receiver
        const receiverUnreadCount = await prisma.message.count({
          where: { receiverId, isRead: false },
        });
        io.to(`user:${receiverId}`).emit('unread:count', { count: receiverUnreadCount });

        logger.info({ messageId: message.id, from: userId, to: receiverId }, 'Message sent');
      } catch (error) {
        logger.error({ error, userId }, 'Error sending message');
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('message:read', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        const message = await prisma.message.update({
          where: { id: messageId, receiverId: userId },
          data: { isRead: true },
        });

        // Notify sender that message was read
        io.to(`user:${message.senderId}`).emit('message:read', { messageId });

        // Update unread count
        const unreadCount = await prisma.message.count({
          where: { receiverId: userId, isRead: false },
        });
        socket.emit('unread:count', { count: unreadCount });
      } catch (error) {
        logger.error({ error, userId }, 'Error marking message as read');
      }
    });

    // Mark conversation as read
    socket.on('conversation:read', async (data: { partnerId: string }) => {
      try {
        const { partnerId } = data;

        await prisma.message.updateMany({
          where: {
            senderId: partnerId,
            receiverId: userId,
            isRead: false,
          },
          data: { isRead: true },
        });

        // Notify partner
        io.to(`user:${partnerId}`).emit('conversation:read', { by: userId });

        // Update unread count
        const unreadCount = await prisma.message.count({
          where: { receiverId: userId, isRead: false },
        });
        socket.emit('unread:count', { count: unreadCount });
      } catch (error) {
        logger.error({ error, userId }, 'Error marking conversation as read');
      }
    });

    // ============================================
    // Typing Events
    // ============================================

    socket.on('typing:start', (data: { receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('typing:update', {
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('typing:update', {
        userId,
        isTyping: false,
      });
    });

    // ============================================
    // Presence Events
    // ============================================

    // Get online status for a list of users
    socket.on('presence:check', (data: { userIds: string[] }) => {
      const statuses = data.userIds.map((id) => ({
        userId: id,
        status: onlineUsers.has(id) ? 'online' : 'offline',
        lastSeen: onlineUsers.get(id)?.lastSeen || null,
      }));
      socket.emit('presence:status', { statuses });
    });

    // ============================================
    // Disconnect
    // ============================================

    socket.on('disconnect', () => {
      logger.info({ userId, socketId: socket.id }, 'User disconnected from WebSocket');

      // Update last seen
      onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });

      // Small delay before marking as offline (in case of reconnect)
      setTimeout(() => {
        const currentInfo = onlineUsers.get(userId);
        if (currentInfo?.socketId === socket.id) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:status', {
            userId,
            status: 'offline',
            lastSeen: new Date(),
          });
        }
      }, 5000);
    });
  });

  logger.info('Socket.io server initialized');
  return io;
}

// Helper to emit to specific user from outside socket handlers
export function emitToUser(io: Server, userId: string, event: string, data: unknown) {
  io.to(`user:${userId}`).emit(event, data);
}
