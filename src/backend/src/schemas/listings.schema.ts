import { z } from 'zod';

export const listingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid listing ID'),
});

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(5).max(255),
  quartier: z.string().min(2).max(100),
  size: z.enum(['small', 'medium', 'large']).default('medium'),
  pricePerMonth: z.number().positive('Price must be positive'),
  availabilityStart: z.coerce.date().optional(),
  availabilityEnd: z.coerce.date().optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['active', 'inactive', 'booked']).optional(),
});

export const listingsQuerySchema = z.object({
  quartier: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  status: z.enum(['active', 'inactive', 'booked']).optional(),
  availableFrom: z.coerce.date().optional(),
  availableTo: z.coerce.date().optional(),
  ownerId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price', 'createdAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListingIdParams = z.infer<typeof listingIdParamsSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingsQuery = z.infer<typeof listingsQuerySchema>;
