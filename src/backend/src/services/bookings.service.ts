import { prisma } from '../lib/prisma.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { paymentsService } from './payments.service.js';
import { notificationsService } from './notifications.service.js';
import type { CreateBookingInput, BookingsQuery } from '../schemas/bookings.schema.js';
import type { Role, BookingStatus } from '@prisma/client';

const bookingSelect = {
  id: true,
  startDate: true,
  endDate: true,
  totalPrice: true,
  status: true,
  contractUrl: true,
  contractSignedAt: true,
  createdAt: true,
  updatedAt: true,
  // Blockchain certification
  blockchainHash: true,
  blockchainTxId: true,
  blockchainNetwork: true,
  certifiedAt: true,
  listing: {
    select: {
      id: true,
      title: true,
      address: true,
      quartier: true,
      pricePerMonth: true,
      photos: {
        select: { url: true },
        where: { isPrimary: true },
        take: 1,
      },
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  advertiser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

function calculateTotalPrice(pricePerMonth: number, startDate: Date, endDate: Date): number {
  const msPerMonth = 30 * 24 * 60 * 60 * 1000;
  const durationMs = endDate.getTime() - startDate.getTime();
  const months = Math.ceil(durationMs / msPerMonth);
  return pricePerMonth * months;
}

export const bookingsService = {
  async create(data: CreateBookingInput, advertiserId: string) {
    const { listingId, startDate, endDate, paymentMethod, phone } = data;

    // validate dates
    if (startDate >= endDate) {
      throw new BadRequestError('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestError('Start date cannot be in the past');
    }

    // get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { owner: true },
    });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.status !== 'active') {
      throw new BadRequestError('Listing is not available');
    }

    // check for overlapping bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            AND: [{ startDate: { lte: startDate } }, { endDate: { gte: startDate } }],
          },
          {
            AND: [{ startDate: { lte: endDate } }, { endDate: { gte: endDate } }],
          },
          {
            AND: [{ startDate: { gte: startDate } }, { endDate: { lte: endDate } }],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestError('Listing is already booked for these dates');
    }

    // calculate total price
    const totalPrice = calculateTotalPrice(listing.pricePerMonth, startDate, endDate);

    // create booking
    const booking = await prisma.booking.create({
      data: {
        listingId,
        advertiserId,
        startDate,
        endDate,
        totalPrice,
        status: 'pending',
      },
      select: bookingSelect,
    });

    // initiate payment
    try {
      await paymentsService.create({
        bookingId: booking.id,
        paymentMethod,
        phone,
      });
    } catch (error) {
      // payment initiation failed, but booking is created
      // the user can retry payment later
    }

    // send notifications
    await notificationsService.sendBookingCreatedNotification(booking);

    return booking;
  },

  async findAll(query: BookingsQuery, userId: string, userRole: Role) {
    const { status, listingId, asOwner, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (listingId) {
      where.listingId = listingId;
    }

    // filter by user
    if (userRole === 'admin') {
      // admin can see all bookings
    } else if (asOwner) {
      // owner wants to see bookings for their listings
      where.listing = { ownerId: userId };
    } else {
      // advertiser sees their own bookings
      where.advertiserId = userId;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: bookingSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string, userId: string, userRole: Role) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        ...bookingSelect,
        verificationPhotos: {
          select: {
            id: true,
            photoUrl: true,
            status: true,
            timestamp: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // check authorization
    const isOwner = booking.listing.owner.id === userId;
    const isAdvertiser = booking.advertiser.id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdvertiser && !isAdmin) {
      throw new ForbiddenError('You do not have access to this booking');
    }

    return booking;
  },

  async updateStatus(id: string, status: BookingStatus, userId: string, userRole: Role) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { include: { owner: true } },
        advertiser: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const isOwner = booking.listing.owner.id === userId;
    const isAdvertiser = booking.advertiser.id === userId;
    const isAdmin = userRole === 'admin';

    // validate status transitions and permissions
    if (status === 'confirmed') {
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('Only the owner can confirm a booking');
      }
      if (booking.status !== 'pending') {
        throw new BadRequestError('Can only confirm pending bookings');
      }
    }

    if (status === 'rejected') {
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('Only the owner can reject a booking');
      }
      if (booking.status !== 'pending') {
        throw new BadRequestError('Can only reject pending bookings');
      }
    }

    if (status === 'cancelled') {
      if (!isAdvertiser && !isAdmin) {
        throw new ForbiddenError('Only the advertiser can cancel a booking');
      }
      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new BadRequestError('Cannot cancel this booking');
      }
    }

    if (status === 'completed') {
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('Only the owner can mark as completed');
      }
      if (booking.status !== 'confirmed') {
        throw new BadRequestError('Can only complete confirmed bookings');
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      select: bookingSelect,
    });

    // update listing status if needed
    if (status === 'confirmed') {
      await prisma.listing.update({
        where: { id: booking.listingId },
        data: { status: 'booked' },
      });
    }

    if (['rejected', 'cancelled', 'completed'].includes(status)) {
      // check if there are other active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          listingId: booking.listingId,
          status: 'confirmed',
          id: { not: id },
        },
      });

      if (activeBookings === 0) {
        await prisma.listing.update({
          where: { id: booking.listingId },
          data: { status: 'active' },
        });
      }
    }

    // send notifications
    await notificationsService.sendBookingStatusNotification(updated, status);

    return updated;
  },

  async signContract(id: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { advertiser: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.advertiser.id !== userId) {
      throw new ForbiddenError('Only the advertiser can sign the contract');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestError('Booking must be confirmed to sign contract');
    }

    // generate contract URL (in real app, this would generate a PDF)
    const contractUrl = `https://promotionhub.ci/contracts/${id}.pdf`;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        contractUrl,
        contractSignedAt: new Date(),
      },
      select: bookingSelect,
    });

    return updated;
  },

  async getOwnerEarnings(ownerId: string) {
    const earnings = await prisma.booking.aggregate({
      where: {
        listing: { ownerId },
        status: 'completed',
      },
      _sum: { totalPrice: true },
      _count: true,
    });

    const pendingEarnings = await prisma.booking.aggregate({
      where: {
        listing: { ownerId },
        status: 'confirmed',
      },
      _sum: { totalPrice: true },
      _count: true,
    });

    // get monthly earnings using Prisma groupBy
    const completedBookings = await prisma.booking.findMany({
      where: {
        listing: { ownerId },
        status: 'completed',
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // aggregate by month manually
    const monthlyMap = new Map<string, { total: number; count: number }>();
    for (const booking of completedBookings) {
      const month = booking.createdAt.toISOString().substring(0, 7);
      const existing = monthlyMap.get(month) || { total: 0, count: 0 };
      existing.total += booking.totalPrice;
      existing.count += 1;
      monthlyMap.set(month, existing);
    }

    const monthlyEarnings = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(0, 12);

    return {
      totalEarnings: earnings._sum.totalPrice || 0,
      completedBookings: earnings._count,
      pendingEarnings: pendingEarnings._sum.totalPrice || 0,
      pendingBookings: pendingEarnings._count,
      monthlyEarnings,
    };
  },
};
