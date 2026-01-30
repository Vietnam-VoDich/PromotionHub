export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export const ROLES = {
  OWNER: 'owner',
  ADVERTISER: 'advertiser',
  ADMIN: 'admin',
} as const;

export const LISTING_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BOOKED: 'booked',
} as const;

export const LISTING_SIZE = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const PAYMENT_METHOD = {
  ORANGE_MONEY: 'orange_money',
  MTN_MONEY: 'mtn_money',
  CARD: 'card',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
