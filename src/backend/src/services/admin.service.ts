import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import type {
  AdminUsersQuery,
  AdminUpdateUserInput,
  AdminListingsQuery,
  AdminStatsQuery,
} from '../schemas/admin.schema.js';

export const adminService = {
  // Dashboard stats
  async getDashboardStats(query: AdminStatsQuery) {
    const { startDate, endDate } = query;

    const dateFilter: Record<string, unknown> = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const createdAtFilter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [
      totalUsers,
      totalOwners,
      totalAdvertisers,
      totalListings,
      activeListings,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenue,
      pendingVerifications,
    ] = await Promise.all([
      prisma.user.count({ where: createdAtFilter }),
      prisma.user.count({ where: { ...createdAtFilter, role: 'owner' } }),
      prisma.user.count({ where: { ...createdAtFilter, role: 'advertiser' } }),
      prisma.listing.count({ where: createdAtFilter }),
      prisma.listing.count({ where: { ...createdAtFilter, status: 'active' } }),
      prisma.booking.count({ where: createdAtFilter }),
      prisma.booking.count({ where: { ...createdAtFilter, status: 'completed' } }),
      prisma.booking.count({ where: { ...createdAtFilter, status: 'pending' } }),
      prisma.booking.aggregate({
        where: { ...createdAtFilter, status: 'completed' },
        _sum: { totalPrice: true },
      }),
      prisma.verificationPhoto.count({ where: { status: 'pending' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        owners: totalOwners,
        advertisers: totalAdvertisers,
      },
      listings: {
        total: totalListings,
        active: activeListings,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
      },
      revenue: {
        total: totalRevenue._sum.totalPrice || 0,
      },
      pendingVerifications,
    };
  },

  // User management
  async getUsers(query: AdminUsersQuery) {
    const { role, verified, search, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (verified !== undefined) where.verified = verified;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          verified: true,
          createdAt: true,
          _count: {
            select: {
              listings: true,
              bookings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        listings: {
          select: {
            id: true,
            title: true,
            status: true,
            pricePerMonth: true,
          },
          take: 10,
        },
        bookings: {
          select: {
            id: true,
            status: true,
            totalPrice: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            listings: true,
            bookings: true,
            reviews: true,
            sentMessages: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  async updateUser(id: string, data: AdminUpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        updatedAt: true,
      },
    });
  },

  // Listing management
  async getListings(query: AdminListingsQuery) {
    const { status, ownerId, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: {
          id: true,
          title: true,
          address: true,
          quartier: true,
          pricePerMonth: true,
          status: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateListingStatus(id: string, status: 'active' | 'inactive') {
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    return prisma.listing.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });
  },

  // Pending verifications
  async getPendingVerifications(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      prisma.verificationPhoto.findMany({
        where: { status: 'pending' },
        select: {
          id: true,
          photoUrl: true,
          status: true,
          timestamp: true,
          createdAt: true,
          booking: {
            select: {
              id: true,
              listing: {
                select: {
                  id: true,
                  title: true,
                  address: true,
                  owner: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              advertiser: {
                select: {
                  id: true,
                  email: true,
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
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.verificationPhoto.count({ where: { status: 'pending' } }),
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

  // Recent activity
  async getRecentActivity(limit: number = 20) {
    const [recentBookings, recentListings, recentUsers] = await Promise.all([
      prisma.booking.findMany({
        select: {
          id: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          listing: { select: { title: true } },
          advertiser: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.listing.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          owner: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    return {
      bookings: recentBookings,
      listings: recentListings,
      users: recentUsers,
    };
  },
};
