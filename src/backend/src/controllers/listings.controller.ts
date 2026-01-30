import type { Request, Response, NextFunction } from 'express';
import { listingsService } from '../services/listings.service.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { BadRequestError } from '../utils/errors.js';
import type {
  CreateListingInput,
  UpdateListingInput,
  ListingsQuery,
  ListingIdParams,
} from '../schemas/listings.schema.js';
import type { Role } from '@prisma/client';

interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export const listingsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const listing = await listingsService.create(req.body as CreateListingInput, user.userId);
      res.status(201).json(listing);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingsService.findAll(req.query as unknown as ListingsQuery);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as ListingIdParams;
      const listing = await listingsService.findById(id);
      res.json(listing);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params as ListingIdParams;
      const listing = await listingsService.update(
        id,
        req.body as UpdateListingInput,
        user.userId,
        user.role
      );
      res.json(listing);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params as ListingIdParams;
      await listingsService.delete(id, user.userId, user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async addPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params as ListingIdParams;

      // check if file was uploaded
      const file = req.file;
      if (!file) {
        throw new BadRequestError('Aucun fichier fourni');
      }

      // upload to cloudinary
      const { url } = await uploadToCloudinary(file.buffer, {
        folder: `promotionhub/listings/${id}`,
      });

      const photo = await listingsService.addPhoto(id, url, user.userId, user.role);
      res.status(201).json(photo);
    } catch (error) {
      next(error);
    }
  },

  // legacy method for URL-based photo addition (admin use)
  async addPhotoByUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id } = req.params as ListingIdParams;
      const { url } = req.body as { url: string };
      const photo = await listingsService.addPhoto(id, url, user.userId, user.role);
      res.status(201).json(photo);
    } catch (error) {
      next(error);
    }
  },

  async deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const { id, photoId } = req.params as { id: string; photoId: string };
      await listingsService.deletePhoto(id, photoId, user.userId, user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user: AuthUser }).user;
      const result = await listingsService.getMyListings(
        user.userId,
        req.query as unknown as ListingsQuery
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
