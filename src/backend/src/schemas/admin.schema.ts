import { z } from 'zod';

export const adminUsersQuerySchema = z.object({
  role: z.enum(['owner', 'advertiser', 'admin']).optional(),
  verified: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['owner', 'advertiser', 'admin']).optional(),
  verified: z.boolean().optional(),
});

export const adminListingsQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'booked']).optional(),
  ownerId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const adminStatsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminListingsQuery = z.infer<typeof adminListingsQuerySchema>;
export type AdminStatsQuery = z.infer<typeof adminStatsQuerySchema>;
