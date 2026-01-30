import { prisma } from '../lib/prisma.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import type { CreateReviewInput, UpdateReviewInput, ReviewsQuery } from '../schemas/reviews.schema.js';
import type { Role } from '@prisma/client';

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  createdAt: true,
  listing: {
    select: {
      id: true,
      title: true,
    },
  },
  reviewer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
};

export const reviewsService = {
  async create(data: CreateReviewInput, reviewerId: string) {
    const { listingId, rating, comment } = data;

    // verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    // verify user has completed a booking for this listing
    const completedBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        advertiserId: reviewerId,
        status: 'completed',
      },
    });

    if (!completedBooking) {
      throw new BadRequestError('You can only review listings you have booked and completed');
    }

    // check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        listingId_reviewerId: {
          listingId,
          reviewerId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestError('You have already reviewed this listing');
    }

    const review = await prisma.review.create({
      data: {
        listingId,
        reviewerId,
        rating,
        comment,
      },
      select: reviewSelect,
    });

    return review;
  },

  async findAll(query: ReviewsQuery) {
    const { listingId, minRating, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (listingId) {
      where.listingId = listingId;
    }

    if (minRating) {
      where.rating = { gte: minRating };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: reviewSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      select: reviewSelect,
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    return review;
  },

  async update(id: string, data: UpdateReviewInput, userId: string, userRole: Role) {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.reviewerId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only edit your own reviews');
    }

    return prisma.review.update({
      where: { id },
      data,
      select: reviewSelect,
    });
  },

  async delete(id: string, userId: string, userRole: Role) {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.reviewerId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await prisma.review.delete({
      where: { id },
    });

    return { message: 'Review deleted successfully' };
  },

  async getListingStats(listingId: string) {
    const stats = await prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
      _count: true,
    });

    const distribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { listingId },
      _count: true,
    });

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of distribution) {
      ratingDistribution[item.rating] = item._count;
    }

    return {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count,
      ratingDistribution,
    };
  },
};
