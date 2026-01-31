import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma.js';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors.js';
import { BCRYPT_ROUNDS, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../config/constants.js';
import { notificationsService } from './notifications.service.js';
import type { SignupInput, LoginInput } from '../schemas/auth.schema.js';
import type { Role } from '@prisma/client';

interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserWithoutPassword {
  id: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
}

function getRefreshTokenSecret(): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }
  return secret;
}

function expiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 minutes

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 900;
  }
}

function generateTokens(payload: TokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, getJwtSecret(), {
    expiresIn: expiresInToSeconds(JWT_EXPIRES_IN),
  });

  const refreshToken = jwt.sign({ ...payload, tokenId: uuidv4() }, getRefreshTokenSecret(), {
    expiresIn: expiresInToSeconds(REFRESH_TOKEN_EXPIRES_IN),
  });

  return { accessToken, refreshToken };
}

function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export const authService = {
  async signup(input: SignupInput): Promise<{ user: UserWithoutPassword; tokens: AuthTokens }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const emailVerifyToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role as Role,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        city: input.city,
        emailVerifyToken,
        newsletterOptIn: input.newsletterOptIn ?? true,
        authProvider: 'email',
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        avatarUrl: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // store refresh token
    const expiresAt = new Date(Date.now() + parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN));
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // send welcome email with verification link
    const userName = `${input.firstName || ''} ${input.lastName || ''}`.trim() || 'Nouvel utilisateur';
    await notificationsService.sendWelcomeEmail({
      email: user.email,
      name: userName,
      verifyToken: emailVerifyToken,
    });

    return { user, tokens };
  },

  async login(input: LoginInput): Promise<{ user: UserWithoutPassword; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // OAuth users without password can't login with email/password
    if (!user.passwordHash) {
      throw new UnauthorizedError(`Ce compte utilise ${user.authProvider || 'un autre provider'}. Connectez-vous avec ${user.authProvider || 'le bon provider'}.`);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // store refresh token
    const expiresAt = new Date(Date.now() + parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN));
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // verify the token
    try {
      jwt.verify(refreshToken, getRefreshTokenSecret());
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedError('Refresh token expired');
    }

    // delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // generate new tokens
    const tokens = generateTokens({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    // store new refresh token
    const expiresAt = new Date(Date.now() + parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN));
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.user.id,
        expiresAt,
      },
    });

    return tokens;
  },

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  },

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, getJwtSecret()) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid access token');
    }
  },

  /**
   * Verify user email with token
   */
  async verifyEmail(token: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new NotFoundError('Invalid verification link');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email already verified');
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        verified: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        avatarUrl: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // send confirmation email
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
    await notificationsService.sendEmailVerifiedNotification({
      email: user.email,
      name: userName,
    });

    return updated;
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // don't reveal if email exists
      return;
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // generate new token
    const emailVerifyToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken },
    });

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
    await notificationsService.sendWelcomeEmail({
      email: user.email,
      name: userName,
      verifyToken: emailVerifyToken,
    });
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // don't reveal if email exists
      return;
    }

    // generate reset token (stored in emailVerifyToken field for simplicity)
    const resetToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: resetToken },
    });

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
    await notificationsService.sendPasswordResetEmail({
      email: user.email,
      name: userName,
      resetToken,
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new NotFoundError('Invalid or expired reset link');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerifyToken: null,
      },
    });

    // invalidate all refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });
  },

  /**
   * Generate tokens for OAuth user (used after OAuth callback)
   */
  async generateTokensForUser(userId: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // store refresh token
    const expiresAt = new Date(Date.now() + parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN));
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return tokens;
  },
};
