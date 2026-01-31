import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';

const listingSelect = {
  id: true,
  title: true,
  description: true,
  address: true,
  quartier: true,
  latitude: true,
  longitude: true,
  size: true,
  pricePerMonth: true,
  status: true,
  dailyTraffic: true,
  createdAt: true,
  photos: {
    select: { id: true, url: true, isPrimary: true },
    orderBy: { order: 'asc' as const },
  },
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  _count: {
    select: { reviews: true, favorites: true },
  },
};

class FavoritesService {
  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId: string, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          listing: {
            select: listingSelect,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      data: favorites.map((f) => ({
        ...f.listing,
        favoritedAt: f.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if a listing is favorited by user
   */
  async isFavorited(userId: string, listingId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });
    return !!favorite;
  }

  /**
   * Check multiple listings if favorited
   */
  async checkFavorites(userId: string, listingIds: string[]): Promise<Record<string, boolean>> {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        listingId: { in: listingIds },
      },
      select: { listingId: true },
    });

    const favoritedIds = new Set(favorites.map((f) => f.listingId));
    return listingIds.reduce(
      (acc, id) => {
        acc[id] = favoritedIds.has(id);
        return acc;
      },
      {} as Record<string, boolean>
    );
  }

  /**
   * Add a listing to favorites
   */
  async addFavorite(userId: string, listingId: string) {
    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError('Annonce non trouvée');
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (existing) {
      return { message: 'Déjà dans les favoris', favorited: true };
    }

    await prisma.favorite.create({
      data: { userId, listingId },
    });

    return { message: 'Ajouté aux favoris', favorited: true };
  }

  /**
   * Remove a listing from favorites
   */
  async removeFavorite(userId: string, listingId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (!favorite) {
      return { message: 'Non dans les favoris', favorited: false };
    }

    await prisma.favorite.delete({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    return { message: 'Retiré des favoris', favorited: false };
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, listingId: string) {
    const isFav = await this.isFavorited(userId, listingId);

    if (isFav) {
      return this.removeFavorite(userId, listingId);
    } else {
      return this.addFavorite(userId, listingId);
    }
  }

  /**
   * Get favorite count for a listing
   */
  async getFavoriteCount(listingId: string): Promise<number> {
    return prisma.favorite.count({
      where: { listingId },
    });
  }

  /**
   * Get favorite IDs for a user (lightweight)
   */
  async getFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return favorites.map((f) => f.listingId);
  }
}

export const favoritesService = new FavoritesService();
