import { z } from 'zod';

export const createMessageSchema = z.object({
  receiverId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
});

export const messagesQuerySchema = z.object({
  bookingId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const conversationParamsSchema = z.object({
  recipientId: z.string().uuid(),
});

export const messageIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;
