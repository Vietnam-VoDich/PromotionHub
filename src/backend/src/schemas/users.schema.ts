import { z } from 'zod';

export const userIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
