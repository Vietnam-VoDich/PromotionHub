import { prisma } from '../lib/prisma.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type { UpdateUserInput } from '../schemas/users.schema.js';
import type { Role } from '@prisma/client';

const userSelect = {
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
};

export const usersService = {
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  async updateUser(id: string, data: UpdateUserInput, requesterId: string, requesterRole: Role) {
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // check authorization: user can only update their own profile (unless admin)
    if (id !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenError('You can only update your own profile');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return updatedUser;
  },

  async deleteUser(id: string, requesterId: string, requesterRole: Role) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // check authorization
    if (id !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenError('You can only delete your own account');
    }

    await prisma.user.delete({
      where: { id },
    });
  },
};
