export type Role = 'owner' | 'advertiser' | 'admin';
export type ListingStatus = 'active' | 'inactive' | 'booked';
export type ListingSize = 'small' | 'medium' | 'large';
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed';
export type PaymentMethod = 'orange_money' | 'mtn_money' | 'card';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  verified: boolean;
  createdAt: string;
}

export interface ListingPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string;
  quartier: string;
  size: ListingSize;
  pricePerMonth: number;
  availabilityStart: string | null;
  availabilityEnd: string | null;
  status: ListingStatus;
  createdAt: string;
  photos: ListingPhoto[];
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  // Traffic data
  dailyTraffic: number | null;
  peakHours: string | null; // JSON string array
  trafficSource: string | null;
  trafficUpdatedAt: string | null;
  // Advertiser history
  pastAdvertisers: string | null; // JSON string array
}

export interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  contractUrl: string | null;
  contractSignedAt: string | null;
  createdAt: string;
  // Blockchain certification
  blockchainHash: string | null;
  blockchainTxId: string | null;
  blockchainNetwork: string | null;
  certifiedAt: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    quartier: string;
    pricePerMonth: number;
    photos: { url: string }[];
    owner: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      phone: string | null;
    };
  };
  advertiser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  payments: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  receiver: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  booking: {
    id: string;
    listing: {
      id: string;
      title: string;
    };
  } | null;
}

export interface Conversation {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
  };
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Blockchain types
export type CertificationStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';

export interface BlockchainCertification {
  hash: string;
  transactionHash: string | null;
  blockNumber: number | null;
  network: string;
  timestamp: string;
  explorerUrl: string | null;
}

export interface BlockchainVerification {
  valid: boolean;
  certification: BlockchainCertification | null;
  currentHash: string | null;
  message: string;
}

export interface BlockchainInfo {
  network: string;
  enabled: boolean;
  features: {
    hashCertification: boolean;
    onChainStorage: boolean;
    verificationProof: boolean;
  };
  description: string;
}
