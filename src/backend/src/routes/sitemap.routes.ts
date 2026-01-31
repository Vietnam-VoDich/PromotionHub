import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import type { Request, Response, NextFunction } from 'express';

export const sitemapRouter = Router();

const BASE_URL = process.env.BASE_URL || 'https://promotionhub.ci';

/**
 * Generate XML sitemap for SEO
 */
sitemapRouter.get('/sitemap.xml', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all published blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    // Get all active listings
    const listings = await prisma.listing.findMany({
      where: { status: 'active' },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    // Get blog categories
    const categories = await prisma.blogCategory.findMany({
      select: { slug: true, createdAt: true },
    });

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/listings', priority: '0.9', changefreq: 'daily' },
      { url: '/map', priority: '0.8', changefreq: 'weekly' },
      { url: '/blog', priority: '0.8', changefreq: 'daily' },
      { url: '/login', priority: '0.3', changefreq: 'monthly' },
      { url: '/signup', priority: '0.3', changefreq: 'monthly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add blog posts
    for (const post of blogPosts) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${(post.updatedAt || post.publishedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }

    // Add blog categories
    for (const cat of categories) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/blog?category=${cat.slug}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    // Add listings
    for (const listing of listings) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/listings/${listing.id}</loc>\n`;
      xml += `    <lastmod>${listing.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

/**
 * Generate robots.txt
 */
sitemapRouter.get('/robots.txt', (_req: Request, res: Response) => {
  const robots = `User-agent: *
Allow: /

# Disallow admin and auth pages
Disallow: /admin
Disallow: /dashboard
Disallow: /profile
Disallow: /messages
Disallow: /checkout

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.send(robots);
});
