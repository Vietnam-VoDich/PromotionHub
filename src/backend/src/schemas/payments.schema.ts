import { z } from 'zod';

export const paymentIdParamsSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
});

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  paymentMethod: z.enum(['orange_money', 'mtn_money', 'wave', 'card']),
  phone: z.string().min(10).max(15).optional(),
});

export const paymentWebhookSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['success', 'failed']),
  amount: z.number().positive(),
  currency: z.string().default('XOF'),
  metadata: z.record(z.unknown()).optional(),
});

export type PaymentIdParams = z.infer<typeof paymentIdParamsSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
