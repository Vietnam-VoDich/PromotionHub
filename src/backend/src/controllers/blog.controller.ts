import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';

export const blogController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, category, tag, search, featured } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: Record<string, unknown> = {
        status: 'published',
      };

      if (category) {
        where.categories = { some: { slug: String(category) } };
      }

      if (tag) {
        where.tags = { some: { slug: String(tag) } };
      }

      if (search) {
        where.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { content: { contains: String(search), mode: 'insensitive' } },
          { excerpt: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (featured === 'true') {
        where.featured = true;
      }

      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { publishedAt: 'desc' },
          include: {
            categories: { select: { id: true, slug: true, name: true } },
            tags: { select: { id: true, slug: true, name: true } },
          },
        }),
        prisma.blogPost.count({ where }),
      ]);

      res.json({
        data: posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async findBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          categories: { select: { id: true, slug: true, name: true } },
          tags: { select: { id: true, slug: true, name: true } },
        },
      });

      if (!post) {
        throw new NotFoundError('Article non trouvé');
      }

      // Increment view count
      await prisma.blogPost.update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
      });

      res.json(post);
    } catch (error) {
      next(error);
    }
  },

  async getFeatured(_req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'published', featured: true },
        take: 6,
        orderBy: { publishedAt: 'desc' },
        include: {
          categories: { select: { id: true, slug: true, name: true } },
        },
      });

      res.json(posts);
    } catch (error) {
      next(error);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.blogCategory.findMany({
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { posts: true } },
        },
      });

      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  async getTags(_req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await prisma.blogTag.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { posts: true } },
        },
      });

      res.json(tags);
    } catch (error) {
      next(error);
    }
  },

  async getSitemap(_req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'published' },
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
      });

      const categories = await prisma.blogCategory.findMany({
        select: { slug: true, createdAt: true },
      });

      res.json({ posts, categories });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryIds, tagIds, ...data } = req.body;

      const post = await prisma.blogPost.create({
        data: {
          ...data,
          publishedAt: data.status === 'published' ? new Date() : null,
          categories: categoryIds?.length
            ? { connect: categoryIds.map((id: string) => ({ id })) }
            : undefined,
          tags: tagIds?.length
            ? { connect: tagIds.map((id: string) => ({ id })) }
            : undefined,
        },
        include: {
          categories: { select: { id: true, slug: true, name: true } },
          tags: { select: { id: true, slug: true, name: true } },
        },
      });

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const { categoryIds, tagIds, ...data } = req.body;

      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (!existing) {
        throw new NotFoundError('Article non trouvé');
      }

      // If publishing for first time
      if (data.status === 'published' && existing.status !== 'published' && !existing.publishedAt) {
        data.publishedAt = new Date();
      }

      const post = await prisma.blogPost.update({
        where: { slug },
        data: {
          ...data,
          categories: categoryIds
            ? { set: categoryIds.map((id: string) => ({ id })) }
            : undefined,
          tags: tagIds
            ? { set: tagIds.map((id: string) => ({ id })) }
            : undefined,
        },
        include: {
          categories: { select: { id: true, slug: true, name: true } },
          tags: { select: { id: true, slug: true, name: true } },
        },
      });

      res.json(post);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (!existing) {
        throw new NotFoundError('Article non trouvé');
      }

      await prisma.blogPost.delete({ where: { slug } });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await prisma.blogCategory.create({
        data: req.body,
      });

      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },

  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await prisma.blogTag.create({
        data: req.body,
      });

      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  },
};
