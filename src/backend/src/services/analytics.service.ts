import { prisma } from '../lib/prisma.js';

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  activeListings: number;
  pendingBookings: number;
  newUsersThisMonth: number;
  revenueThisMonth: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

interface TopListing {
  id: string;
  title: string;
  quartier: string;
  bookingsCount: number;
  revenue: number;
}

interface QuartierStats {
  quartier: string;
  listingsCount: number;
  bookingsCount: number;
  revenue: number;
}

export const analyticsService = {
  /**
   * Get main dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalListings,
      totalBookings,
      activeListings,
      pendingBookings,
      newUsersThisMonth,
      revenueData,
      revenueThisMonthData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.payment.aggregate({
        where: { status: 'success' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'success',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue: revenueData._sum.amount || 0,
      activeListings,
      pendingBookings,
      newUsersThisMonth,
      revenueThisMonth: revenueThisMonthData._sum.amount || 0,
    };
  },

  /**
   * Get bookings over time
   */
  async getBookingsTimeSeries(range: DateRange = {}): Promise<TimeSeriesData[]> {
    const endDate = range.endDate || new Date();
    const startDate = range.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // group by day
    const grouped = bookings.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // fill in missing days
    const result: TimeSeriesData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        value: grouped[dateStr] || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  },

  /**
   * Get revenue over time
   */
  async getRevenueTimeSeries(range: DateRange = {}): Promise<TimeSeriesData[]> {
    const endDate = range.endDate || new Date();
    const startDate = range.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'success',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        amount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // group by day
    const grouped = payments.reduce((acc, payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    // fill in missing days
    const result: TimeSeriesData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        value: grouped[dateStr] || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  },

  /**
   * Get user registrations over time
   */
  async getUsersTimeSeries(range: DateRange = {}): Promise<TimeSeriesData[]> {
    const endDate = range.endDate || new Date();
    const startDate = range.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // group by day
    const grouped = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // fill in missing days
    const result: TimeSeriesData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        value: grouped[dateStr] || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  },

  /**
   * Get top performing listings
   */
  async getTopListings(limit: number = 10): Promise<TopListing[]> {
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        quartier: true,
        bookings: {
          where: { status: { in: ['confirmed', 'completed'] } },
          select: {
            id: true,
            payments: {
              where: { status: 'success' },
              select: { amount: true },
            },
          },
        },
      },
    });

    const listingsWithStats = listings.map((listing) => {
      const revenue = listing.bookings.reduce((sum, booking) => {
        return sum + booking.payments.reduce((pSum, p) => pSum + p.amount, 0);
      }, 0);

      return {
        id: listing.id,
        title: listing.title,
        quartier: listing.quartier,
        bookingsCount: listing.bookings.length,
        revenue,
      };
    });

    return listingsWithStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },

  /**
   * Get statistics by quartier
   */
  async getQuartierStats(): Promise<QuartierStats[]> {
    const listings = await prisma.listing.findMany({
      select: {
        quartier: true,
        bookings: {
          where: { status: { in: ['confirmed', 'completed'] } },
          select: {
            payments: {
              where: { status: 'success' },
              select: { amount: true },
            },
          },
        },
      },
    });

    const quartierMap = listings.reduce((acc, listing) => {
      if (!acc[listing.quartier]) {
        acc[listing.quartier] = {
          quartier: listing.quartier,
          listingsCount: 0,
          bookingsCount: 0,
          revenue: 0,
        };
      }

      acc[listing.quartier].listingsCount++;
      acc[listing.quartier].bookingsCount += listing.bookings.length;
      acc[listing.quartier].revenue += listing.bookings.reduce((sum, booking) => {
        return sum + booking.payments.reduce((pSum, p) => pSum + p.amount, 0);
      }, 0);

      return acc;
    }, {} as Record<string, QuartierStats>);

    return Object.values(quartierMap).sort((a, b) => b.revenue - a.revenue);
  },

  /**
   * Get user statistics by role
   */
  async getUsersByRole(): Promise<{ role: string; count: number }[]> {
    const result = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    return result.map((r) => ({
      role: r.role,
      count: r._count.id,
    }));
  },

  /**
   * Get booking status distribution
   */
  async getBookingsByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return result.map((r) => ({
      status: r.status,
      count: r._count.id,
    }));
  },

  /**
   * Get payment method distribution
   */
  async getPaymentMethodStats(): Promise<{ method: string; count: number; total: number }[]> {
    const payments = await prisma.payment.findMany({
      where: { status: 'success' },
      select: {
        paymentMethod: true,
        amount: true,
      },
    });

    const methodMap = payments.reduce((acc, payment) => {
      if (!acc[payment.paymentMethod]) {
        acc[payment.paymentMethod] = { count: 0, total: 0 };
      }
      acc[payment.paymentMethod].count++;
      acc[payment.paymentMethod].total += payment.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return Object.entries(methodMap).map(([method, stats]) => ({
      method,
      ...stats,
    }));
  },
};
