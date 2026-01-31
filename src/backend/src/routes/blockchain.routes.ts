import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { blockchainService } from '../services/blockchain.service.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

export const blockchainRouter = Router();

const certifyParamsSchema = z.object({
  type: z.enum(['booking', 'verification', 'payment']),
  id: z.string().uuid(),
});

const verifyParamsSchema = z.object({
  type: z.string().min(1),
  id: z.string().uuid(),
});

/**
 * @swagger
 * /api/blockchain/certify/{type}/{id}:
 *   post:
 *     summary: Certifier une entité sur la blockchain
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [booking, verification, payment]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Certification réussie
 */
blockchainRouter.post(
  '/certify/:type/:id',
  authenticate,
  validate({ params: certifyParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, id } = req.params;

      let result;
      switch (type) {
        case 'booking':
          result = await blockchainService.certifyBooking(id);
          break;
        case 'verification':
          result = await blockchainService.certifyVerification(id);
          break;
        case 'payment':
          result = await blockchainService.certifyPayment(id);
          break;
        default:
          res.status(400).json({ error: 'Type de certification invalide' });
          return;
      }

      res.json({
        success: true,
        message: 'Certification créée avec succès',
        certification: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/blockchain/verify/{type}/{id}:
 *   get:
 *     summary: Vérifier une certification blockchain
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 */
blockchainRouter.get(
  '/verify/:type/:id',
  validate({ params: verifyParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, id } = req.params;
      const result = await blockchainService.verify(type, id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/blockchain/status/{type}/{id}:
 *   get:
 *     summary: Obtenir le statut d'une certification
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statut de la certification
 */
blockchainRouter.get(
  '/status/:type/:id',
  validate({ params: verifyParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, id } = req.params;
      const certification = await blockchainService.getCertificationStatus(type, id);

      if (!certification) {
        res.status(404).json({
          certified: false,
          message: 'Aucune certification trouvée',
        });
        return;
      }

      res.json({
        certified: true,
        certification,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/blockchain/certifications:
 *   get:
 *     summary: Lister toutes les certifications (admin)
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des certifications
 */
blockchainRouter.get(
  '/certifications',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, limit, offset } = req.query;

      const certifications = await blockchainService.listCertifications({
        entityType: type as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json(certifications);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/blockchain/info:
 *   get:
 *     summary: Obtenir les informations sur la configuration blockchain
 *     tags: [Blockchain]
 *     responses:
 *       200:
 *         description: Informations blockchain
 */
blockchainRouter.get('/info', (_req: Request, res: Response) => {
  const network = process.env.BLOCKCHAIN_NETWORK || 'local';
  const isEnabled = network !== 'local' && !!process.env.BLOCKCHAIN_PRIVATE_KEY;

  res.json({
    network,
    enabled: isEnabled,
    features: {
      hashCertification: true,
      onChainStorage: isEnabled,
      verificationProof: true,
    },
    description: isEnabled
      ? `Certifications stockées sur ${network}`
      : 'Mode local: hash cryptographique stocké en base de données',
  });
});
