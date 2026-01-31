import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import { imageAnalysisService } from '../services/image-analysis.service.js';
import type { Request, Response, NextFunction } from 'express';

export const imageAnalysisRouter = Router();

/**
 * @swagger
 * /api/images/analyze:
 *   post:
 *     summary: Analyze a single image for quality and duplicates
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 */
imageAnalysisRouter.post(
  '/analyze',
  authenticate,
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Aucune image fournie' });
        return;
      }

      const listingId = req.body.listingId;
      const result = await imageAnalysisService.analyzeImage(file.buffer, listingId);
      const recommendations = imageAnalysisService.getQualityRecommendations(result);

      res.json({
        ...result,
        recommendations,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/images/analyze-batch:
 *   post:
 *     summary: Analyze multiple images for quality and duplicates
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 */
imageAnalysisRouter.post(
  '/analyze-batch',
  authenticate,
  uploadMultiple,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'Aucune image fournie' });
        return;
      }

      const listingId = req.body.listingId;
      const images = files.map((f) => ({ buffer: f.buffer, filename: f.originalname }));
      const results = await imageAnalysisService.analyzeMultipleImages(images, listingId);

      // Summary
      const summary = {
        total: results.length,
        valid: results.filter((r) => r.result.isValid).length,
        duplicates: results.filter((r) => r.result.duplicateOf).length,
        lowQuality: results.filter((r) => r.result.quality === 'low').length,
        highQuality: results.filter((r) => r.result.quality === 'high').length,
      };

      res.json({
        summary,
        results: results.map((r) => ({
          filename: r.filename,
          ...r.result,
          recommendations: imageAnalysisService.getQualityRecommendations(r.result),
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);
