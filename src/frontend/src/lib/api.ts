import axios from 'axios';
import type { AuthResponse, User, Listing, Booking, PaginatedResponse, Message, Conversation, Review } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post<AuthResponse>('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  signup: async (userData: { email: string; password: string; role: string; firstName?: string; lastName?: string; phone?: string }) => {
    const { data } = await api.post<AuthResponse>('/auth/signup', userData);
    return data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
  },

  getMe: async () => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};

// Listings
export const listingsApi = {
  getAll: async (params?: {
    quartier?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get<PaginatedResponse<Listing>>('/listings', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Listing>(`/listings/${id}`);
    return data;
  },

  create: async (listingData: Partial<Listing>) => {
    const { data } = await api.post<Listing>('/listings', listingData);
    return data;
  },

  update: async (id: string, listingData: Partial<Listing>) => {
    const { data } = await api.put<Listing>(`/listings/${id}`, listingData);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/listings/${id}`);
  },

  getMyListings: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<Listing>>('/listings/my', { params });
    return data;
  },
};

// Bookings
export const bookingsApi = {
  getAll: async (params?: { status?: string; asOwner?: boolean; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<Booking>>('/bookings', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Booking>(`/bookings/${id}`);
    return data;
  },

  create: async (bookingData: {
    listingId: string;
    startDate: string;
    endDate: string;
    paymentMethod: string;
    phone?: string;
  }) => {
    const { data } = await api.post<Booking>('/bookings', bookingData);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.put<Booking>(`/bookings/${id}/status`, { status });
    return data;
  },

  signContract: async (id: string) => {
    const { data } = await api.post<Booking>(`/bookings/${id}/sign-contract`);
    return data;
  },

  getEarnings: async () => {
    const { data } = await api.get<{
      totalEarnings: number;
      completedBookings: number;
      pendingEarnings: number;
      pendingBookings: number;
      monthlyEarnings: { month: string; total: number; count: number }[];
    }>('/bookings/earnings');
    return data;
  },
};

// Messages
export const messagesApi = {
  send: async (receiverId: string, content: string, bookingId?: string) => {
    const { data } = await api.post<Message>('/messages', { receiverId, content, bookingId });
    return data;
  },

  getConversations: async () => {
    const { data } = await api.get<Conversation[]>('/messages/conversations');
    return data;
  },

  getConversation: async (recipientId: string, params?: { bookingId?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<Message>>(`/messages/conversation/${recipientId}`, { params });
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.put<Message>(`/messages/${id}/read`);
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get<{ unreadCount: number }>('/messages/unread');
    return data;
  },
};

// Reviews
export const reviewsApi = {
  getAll: async (params?: { listingId?: string; minRating?: number; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<Review>>('/reviews', { params });
    return data;
  },

  create: async (reviewData: { listingId: string; rating: number; comment?: string }) => {
    const { data } = await api.post<Review>('/reviews', reviewData);
    return data;
  },

  getListingStats: async (listingId: string) => {
    const { data } = await api.get<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    }>(`/reviews/listing/${listingId}/stats`);
    return data;
  },
};

// Admin
export interface AdminStats {
  users: { total: number; owners: number; advertisers: number };
  listings: { total: number; active: number };
  bookings: { total: number; completed: number; pending: number };
  revenue: { total: number };
  pendingVerifications: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  verified: boolean;
  createdAt: string;
  _count: { listings: number; bookings: number };
}

export interface AdminListing {
  id: string;
  title: string;
  address: string;
  quartier: string;
  pricePerMonth: number;
  status: string;
  createdAt: string;
  owner: { id: string; email: string; firstName: string | null; lastName: string | null };
  _count: { bookings: number; reviews: number };
}

export interface PendingVerification {
  id: string;
  photoUrl: string;
  status: string;
  timestamp: string;
  booking: {
    id: string;
    listing: {
      id: string;
      title: string;
      address: string;
      owner: { id: string; email: string; firstName: string | null; lastName: string | null };
    };
    advertiser: { id: string; email: string; firstName: string | null; lastName: string | null };
  };
  uploader: { id: string; firstName: string | null; lastName: string | null };
}

export interface RecentActivity {
  bookings: Array<{
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    listing: { title: string };
    advertiser: { firstName: string | null; lastName: string | null };
  }>;
  listings: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    owner: { firstName: string | null; lastName: string | null };
  }>;
  users: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
  }>;
}

export const adminApi = {
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const { data } = await api.get<AdminStats>('/admin/stats', { params });
    return data;
  },

  getUsers: async (params?: { role?: string; verified?: boolean; search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<AdminUser>>('/admin/users', { params });
    return data;
  },

  getUserById: async (id: string) => {
    const { data } = await api.get<AdminUser>(`/admin/users/${id}`);
    return data;
  },

  updateUser: async (id: string, userData: { role?: string; verified?: boolean }) => {
    const { data } = await api.put<AdminUser>(`/admin/users/${id}`, userData);
    return data;
  },

  getListings: async (params?: { status?: string; ownerId?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<AdminListing>>('/admin/listings', { params });
    return data;
  },

  updateListingStatus: async (id: string, status: 'active' | 'inactive') => {
    const { data } = await api.put<AdminListing>(`/admin/listings/${id}/status`, { status });
    return data;
  },

  getPendingVerifications: async (params?: { page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<PendingVerification>>('/admin/verifications/pending', { params });
    return data;
  },

  getRecentActivity: async (limit?: number) => {
    const { data } = await api.get<RecentActivity>('/admin/activity', { params: { limit } });
    return data;
  },
};

// Newsletter Admin
export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName: string | null;
  isActive: boolean;
  confirmedAt: string | null;
  source: string | null;
  createdAt: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  htmlContent: string | null;
  sentAt: string | null;
  sentCount: number;
  openCount: number;
  clickCount: number;
  status: string;
  createdAt: string;
}

export const newsletterApi = {
  getSubscribers: async (params?: { isActive?: boolean; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<NewsletterSubscriber>>('/newsletter/admin/subscribers', { params });
    return data;
  },

  getCampaigns: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<NewsletterCampaign>>('/newsletter/admin/campaigns', { params });
    return data;
  },

  createCampaign: async (campaignData: { subject: string; content: string; htmlContent?: string }) => {
    const { data } = await api.post<NewsletterCampaign>('/newsletter/admin/campaigns', campaignData);
    return data;
  },

  sendCampaign: async (id: string) => {
    const { data } = await api.post<NewsletterCampaign>(`/newsletter/admin/campaigns/${id}/send`);
    return data;
  },

  exportSubscribers: async () => {
    const { data } = await api.get<{ csv: string }>('/newsletter/admin/subscribers/export');
    return data;
  },
};

// Blog
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  authorId: string | null;
  authorName: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  readingTime: number | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  categories: Array<{ id: string; slug: string; name: string }>;
  tags: Array<{ id: string; slug: string; name: string }>;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  order: number;
  _count?: { posts: number };
}

export interface BlogTag {
  id: string;
  slug: string;
  name: string;
  _count?: { posts: number };
}

export const blogApi = {
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const { data } = await api.get<PaginatedResponse<BlogPost>>('/blog', { params });
    return data;
  },

  getPost: async (slug: string) => {
    const { data } = await api.get<BlogPost>(`/blog/${slug}`);
    return data;
  },

  getFeatured: async () => {
    const { data } = await api.get<BlogPost[]>('/blog/featured');
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get<BlogCategory[]>('/blog/categories');
    return data;
  },

  getTags: async () => {
    const { data } = await api.get<BlogTag[]>('/blog/tags');
    return data;
  },

  getSitemap: async () => {
    const { data } = await api.get<{
      posts: Array<{ slug: string; updatedAt: string; publishedAt: string }>;
      categories: Array<{ slug: string; createdAt: string }>;
    }>('/blog/sitemap');
    return data;
  },

  // Admin
  createPost: async (postData: Partial<BlogPost> & { categoryIds?: string[]; tagIds?: string[] }) => {
    const { data } = await api.post<BlogPost>('/blog', postData);
    return data;
  },

  updatePost: async (slug: string, postData: Partial<BlogPost> & { categoryIds?: string[]; tagIds?: string[] }) => {
    const { data } = await api.put<BlogPost>(`/blog/${slug}`, postData);
    return data;
  },

  deletePost: async (slug: string) => {
    await api.delete(`/blog/${slug}`);
  },

  createCategory: async (categoryData: { name: string; slug: string; description?: string }) => {
    const { data } = await api.post<BlogCategory>('/blog/categories', categoryData);
    return data;
  },

  createTag: async (tagData: { name: string; slug: string }) => {
    const { data } = await api.post<BlogTag>('/blog/tags', tagData);
    return data;
  },
};

// Favorites API
export const favoritesApi = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const { data } = await api.get<PaginatedResponse<Listing & { favoritedAt: string }>>('/favorites', { params });
    return data;
  },

  getIds: async () => {
    const { data } = await api.get<{ favoriteIds: string[] }>('/favorites/ids');
    return data;
  },

  check: async (listingId: string) => {
    const { data } = await api.get<{ favorited: boolean }>(`/favorites/${listingId}`);
    return data;
  },

  checkMultiple: async (listingIds: string[]) => {
    const { data } = await api.post<Record<string, boolean>>('/favorites/check', { listingIds });
    return data;
  },

  add: async (listingId: string) => {
    const { data } = await api.post<{ message: string; favorited: boolean }>(`/favorites/${listingId}`);
    return data;
  },

  remove: async (listingId: string) => {
    const { data } = await api.delete<{ message: string; favorited: boolean }>(`/favorites/${listingId}`);
    return data;
  },

  toggle: async (listingId: string) => {
    const { data } = await api.post<{ message: string; favorited: boolean }>(`/favorites/${listingId}/toggle`);
    return data;
  },
};

// Blockchain API
import type { BlockchainCertification, BlockchainVerification, BlockchainInfo } from '@/types';

export const blockchainApi = {
  getInfo: async () => {
    const { data } = await api.get<BlockchainInfo>('/blockchain/info');
    return data;
  },

  certifyBooking: async (bookingId: string) => {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      certification: BlockchainCertification;
    }>(`/blockchain/certify/booking/${bookingId}`);
    return data;
  },

  certifyPayment: async (paymentId: string) => {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      certification: BlockchainCertification;
    }>(`/blockchain/certify/payment/${paymentId}`);
    return data;
  },

  verifyBooking: async (bookingId: string) => {
    const { data } = await api.get<BlockchainVerification>(`/blockchain/verify/booking/${bookingId}`);
    return data;
  },

  getStatus: async (entityType: string, entityId: string) => {
    const { data } = await api.get<{
      certified: boolean;
      certification?: BlockchainCertification;
      message?: string;
    }>(`/blockchain/status/${entityType}/${entityId}`);
    return data;
  },
};

export default api;
