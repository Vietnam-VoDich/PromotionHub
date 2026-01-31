import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { blogController } from '../controllers/blog.controller.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

export const blogRouter = Router();

const postQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
});

const postSlugSchema = z.object({
  slug: z.string().min(1),
});

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImage: z.string().url().optional(),
  authorName: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  readingTime: z.number().int().min(1).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

const updatePostSchema = createPostSchema.partial();

// Public routes
blogRouter.get('/', validate({ query: postQuerySchema }), blogController.findAll);
blogRouter.get('/featured', blogController.getFeatured);
blogRouter.get('/categories', blogController.getCategories);
blogRouter.get('/tags', blogController.getTags);
blogRouter.get('/sitemap', blogController.getSitemap);
blogRouter.get('/:slug', validate({ params: postSlugSchema }), blogController.findBySlug);

// Admin routes
blogRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createPostSchema }),
  blogController.create
);

blogRouter.put(
  '/:slug',
  authenticate,
  authorize('admin'),
  validate({ params: postSlugSchema, body: updatePostSchema }),
  blogController.update
);

blogRouter.delete(
  '/:slug',
  authenticate,
  authorize('admin'),
  validate({ params: postSlugSchema }),
  blogController.delete
);

// Category management
blogRouter.post(
  '/categories',
  authenticate,
  authorize('admin'),
  validate({
    body: z.object({
      name: z.string().min(1),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      description: z.string().optional(),
    }),
  }),
  blogController.createCategory
);

// Tag management
blogRouter.post(
  '/tags',
  authenticate,
  authorize('admin'),
  validate({
    body: z.object({
      name: z.string().min(1),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    }),
  }),
  blogController.createTag
);
