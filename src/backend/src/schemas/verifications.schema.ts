import { z } from 'zod';

export const createVerificationPhotoSchema = z.object({
  bookingId: z.string().uuid(),
  photoUrl: z.string().url(),
});

export const updateVerificationStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const verificationsQuerySchema = z.object({
  bookingId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const verificationIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateVerificationPhotoInput = z.infer<typeof createVerificationPhotoSchema>;
export type UpdateVerificationStatusInput = z.infer<typeof updateVerificationStatusSchema>;
export type VerificationsQuery = z.infer<typeof verificationsQuerySchema>;
