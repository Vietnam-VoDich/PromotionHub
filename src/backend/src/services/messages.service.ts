import { prisma } from '../lib/prisma.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import type { CreateMessageInput, MessagesQuery } from '../schemas/messages.schema.js';

const messageSelect = {
  id: true,
  content: true,
  isRead: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  receiver: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  booking: {
    select: {
      id: true,
      listing: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
};

export const messagesService = {
  async create(data: CreateMessageInput, senderId: string) {
    const { receiverId, bookingId, content } = data;

    // verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundError('Recipient not found');
    }

    // if booking provided, verify access
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          listing: { select: { ownerId: true } },
        },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      // only parties to the booking can message about it
      const isOwner = booking.listing.ownerId === senderId;
      const isAdvertiser = booking.advertiserId === senderId;
      const isReceiverOwner = booking.listing.ownerId === receiverId;
      const isReceiverAdvertiser = booking.advertiserId === receiverId;

      if (!isOwner && !isAdvertiser) {
        throw new ForbiddenError('You are not a party to this booking');
      }

      if (!isReceiverOwner && !isReceiverAdvertiser) {
        throw new ForbiddenError('Recipient is not a party to this booking');
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        bookingId: bookingId || null,
        content,
      },
      select: messageSelect,
    });

    return message;
  },

  async getConversations(userId: string) {
    // get distinct conversations (latest message with each user)
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: messageSelect,
      orderBy: { createdAt: 'desc' },
    });

    // group by other user
    const conversationsMap = new Map<
      string,
      {
        user: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null };
        lastMessage: (typeof messages)[0];
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const otherUserId = msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
      const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(otherUserId)) {
        // count unread
        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false,
          },
        });

        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    return Array.from(conversationsMap.values());
  },

  async getConversation(userId: string, recipientId: string, query: MessagesQuery) {
    const { bookingId, page, limit } = query;

    const where: Record<string, unknown> = {
      OR: [
        { senderId: userId, receiverId: recipientId },
        { senderId: recipientId, receiverId: userId },
      ],
    };

    if (bookingId) {
      where.bookingId = bookingId;
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        select: messageSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    // mark as read
    await prisma.message.updateMany({
      where: {
        senderId: recipientId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      data: messages.reverse(), // oldest first for chat display
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async markAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenError('You can only mark your received messages as read');
    }

    return prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      select: messageSelect,
    });
  },

  async getUnreadCount(userId: string) {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  },
};
