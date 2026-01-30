import { prisma } from '../lib/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type {
  CreateListingInput,
  UpdateListingInput,
  ListingsQuery,
} from '../schemas/listings.schema.js';
import type { Role, Prisma } from '@prisma/client';

const listingSelect = {
  id: true,
  title: true,
  description: true,
  latitude: true,
  longitude: true,
  address: true,
  quartier: true,
  size: true,
  pricePerMonth: true,
  availabilityStart: true,
  availabilityEnd: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  photos: {
    select: {
      id: true,
      url: true,
      isPrimary: true,
      order: true,
    },
    orderBy: { order: 'asc' as const },
  },
  _count: {
    select: {
      reviews: true,
      bookings: true,
    },
  },
};

export const listingsService = {
  async create(data: CreateListingInput, ownerId: string) {
    const listing = await prisma.listing.create({
      data: {
        ...data,
        ownerId,
      },
      select: listingSelect,
    });

    return listing;
  },

  async findAll(query: ListingsQuery) {
    const {
      quartier,
      minPrice,
      maxPrice,
      size,
      status,
      availableFrom,
      availableTo,
      ownerId,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;

    const where: Prisma.ListingWhereInput = {};

    if (quartier) {
      where.quartier = { contains: quartier, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerMonth = {};
      if (minPrice !== undefined) where.pricePerMonth.gte = minPrice;
      if (maxPrice !== undefined) where.pricePerMonth.lte = maxPrice;
    }

    if (size) {
      where.size = size;
    }

    if (status) {
      where.status = status;
    } else {
      // by default, only show active listings for public search
      where.status = 'active';
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (availableFrom) {
      where.availabilityStart = { lte: availableFrom };
    }

    if (availableTo) {
      where.availabilityEnd = { gte: availableTo };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.pricePerMonth = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: listingSelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    // calculate average rating for each listing
    const listingsWithRating = await Promise.all(
      listings.map(async (listing) => {
        const avgRating = await prisma.review.aggregate({
          where: { listingId: listing.id },
          _avg: { rating: true },
        });

        return {
          ...listing,
          averageRating: avgRating._avg.rating || null,
        };
      })
    );

    return {
      data: listingsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        ...listingSelect,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    const avgRating = await prisma.review.aggregate({
      where: { listingId: id },
      _avg: { rating: true },
    });

    return {
      ...listing,
      averageRating: avgRating._avg.rating || null,
    };
  },

  async update(id: string, data: UpdateListingInput, requesterId: string, requesterRole: Role) {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.ownerId !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenError('You can only update your own listings');
    }

    const updated = await prisma.listing.update({
      where: { id },
      data,
      select: listingSelect,
    });

    return updated;
  },

  async delete(id: string, requesterId: string, requesterRole: Role) {
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.ownerId !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenError('You can only delete your own listings');
    }

    await prisma.listing.delete({
      where: { id },
    });
  },

  async addPhoto(listingId: string, url: string, requesterId: string, requesterRole: Role) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { photos: true },
    });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.ownerId !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenError('You can only add photos to your own listings');
    }

    const isPrimary = listing.photos.length === 0;
    const order = listing.photos.length;

    const photo = await prisma.listingPhoto.create({
      data: {
        listingId,
        url,
        isPrimary,
        order,
      },
    });

    return photo;
  },

  async deletePhoto(listingId: string, photoId: string, requesterId: string, requesterRole: Role) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.ownerId !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenError('You can only delete photos from your own listings');
    }

    const photo = await prisma.listingPhoto.findFirst({
      where: { id: photoId, listingId },
    });

    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    await prisma.listingPhoto.delete({
      where: { id: photoId },
    });

    // if deleted photo was primary, make the first remaining photo primary
    if (photo.isPrimary) {
      const firstPhoto = await prisma.listingPhoto.findFirst({
        where: { listingId },
        orderBy: { order: 'asc' },
      });

      if (firstPhoto) {
        await prisma.listingPhoto.update({
          where: { id: firstPhoto.id },
          data: { isPrimary: true },
        });
      }
    }
  },

  async getMyListings(ownerId: string, query: ListingsQuery) {
    return this.findAll({ ...query, ownerId, status: undefined });
  },
};
