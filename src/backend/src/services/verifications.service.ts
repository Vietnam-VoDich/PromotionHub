import { prisma } from '../lib/prisma.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import type {
  CreateVerificationPhotoInput,
  UpdateVerificationStatusInput,
  VerificationsQuery,
} from '../schemas/verifications.schema.js';
import type { Role } from '@prisma/client';

const verificationSelect = {
  id: true,
  photoUrl: true,
  status: true,
  timestamp: true,
  createdAt: true,
  booking: {
    select: {
      id: true,
      startDate: true,
      endDate: true,
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
        },
      },
      advertiser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  uploader: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
};

export const verificationsService = {
  async create(data: CreateVerificationPhotoInput, uploaderId: string) {
    const { bookingId, photoUrl } = data;

    // verify booking exists and is confirmed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { ownerId: true } },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestError('Can only upload verification photos for confirmed bookings');
    }

    // verify uploader is advertiser or owner
    const isOwner = booking.listing.ownerId === uploaderId;
    const isAdvertiser = booking.advertiserId === uploaderId;

    if (!isOwner && !isAdvertiser) {
      throw new ForbiddenError('You are not a party to this booking');
    }

    const verification = await prisma.verificationPhoto.create({
      data: {
        bookingId,
        photoUrl,
        uploadedBy: uploaderId,
        status: 'pending',
      },
      select: verificationSelect,
    });

    return verification;
  },

  async findAll(query: VerificationsQuery, userId: string, userRole: Role) {
    const { bookingId, status, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (status) {
      where.status = status;
    }

    // non-admins can only see their own verifications
    if (userRole !== 'admin') {
      where.OR = [
        { uploadedBy: userId },
        { booking: { listing: { ownerId: userId } } },
        { booking: { advertiserId: userId } },
      ];
    }

    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      prisma.verificationPhoto.findMany({
        where,
        select: verificationSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.verificationPhoto.count({ where }),
    ]);

    return {
      data: verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string, userId: string, userRole: Role) {
    const verification = await prisma.verificationPhoto.findUnique({
      where: { id },
      select: verificationSelect,
    });

    if (!verification) {
      throw new NotFoundError('Verification photo not found');
    }

    // check authorization
    if (userRole !== 'admin') {
      const isUploader = verification.uploader.id === userId;
      const isAdvertiser = verification.booking.advertiser.id === userId;
      // need to check owner separately
      const booking = await prisma.booking.findUnique({
        where: { id: verification.booking.id },
        include: { listing: { select: { ownerId: true } } },
      });
      const isOwner = booking?.listing.ownerId === userId;

      if (!isUploader && !isAdvertiser && !isOwner) {
        throw new ForbiddenError('You do not have access to this verification');
      }
    }

    return verification;
  },

  async updateStatus(id: string, data: UpdateVerificationStatusInput, userId: string, userRole: Role) {
    const verification = await prisma.verificationPhoto.findUnique({
      where: { id },
      include: {
        booking: { include: { listing: { select: { ownerId: true } } } },
      },
    });

    if (!verification) {
      throw new NotFoundError('Verification photo not found');
    }

    // only owner or admin can approve/reject
    const isOwner = verification.booking.listing.ownerId === userId;
    if (!isOwner && userRole !== 'admin') {
      throw new ForbiddenError('Only the listing owner or admin can approve/reject verifications');
    }

    const updated = await prisma.verificationPhoto.update({
      where: { id },
      data: { status: data.status },
      select: verificationSelect,
    });

    return updated;
  },

  async getBookingVerifications(bookingId: string, userId: string, userRole: Role) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // check authorization
    const isOwner = booking.listing.ownerId === userId;
    const isAdvertiser = booking.advertiserId === userId;

    if (!isOwner && !isAdvertiser && userRole !== 'admin') {
      throw new ForbiddenError('You do not have access to this booking');
    }

    const verifications = await prisma.verificationPhoto.findMany({
      where: { bookingId },
      select: verificationSelect,
      orderBy: { createdAt: 'desc' },
    });

    return verifications;
  },
};
