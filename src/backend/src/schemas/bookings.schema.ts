import { z } from 'zod';

export const bookingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export const createBookingSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  paymentMethod: z.enum(['orange_money', 'mtn_money', 'card']),
  phone: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'rejected', 'completed', 'cancelled']),
});

export const bookingsQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected', 'completed', 'cancelled']).optional(),
  listingId: z.string().uuid().optional(),
  asOwner: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type BookingIdParams = z.infer<typeof bookingIdParamsSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type BookingsQuery = z.infer<typeof bookingsQuerySchema>;
