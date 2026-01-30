import type { Request, Response } from 'express';
import { newsletterService } from '../services/newsletter.service.js';
import { logger } from '../utils/logger.js';

export const newsletterController = {
  /**
   * Subscribe to newsletter (public)
   */
  async subscribe(req: Request, res: Response) {
    try {
      const { email, firstName, source } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const result = await newsletterService.subscribe({ email, firstName, source });

      const messages: Record<string, string> = {
        pending_confirmation: 'Un email de confirmation vous a été envoyé',
        already_subscribed: 'Vous êtes déjà inscrit à la newsletter',
        reactivated: 'Votre inscription a été réactivée. Vérifiez votre email.',
        confirmation_resent: 'Un nouvel email de confirmation vous a été envoyé',
      };

      return res.json({
        message: messages[result.status] || 'Inscription réussie',
        status: result.status,
      });
    } catch (error) {
      logger.error({ error }, 'Newsletter subscribe error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  /**
   * Confirm subscription (public)
   */
  async confirmSubscription(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token invalide' });
      }

      const result = await newsletterService.confirmSubscription(token);

      const messages: Record<string, string> = {
        confirmed: 'Votre inscription est confirmée !',
        already_confirmed: 'Votre inscription était déjà confirmée',
        invalid_token: 'Lien invalide ou expiré',
      };

      if (result.status === 'invalid_token') {
        return res.status(400).json({ error: messages[result.status] });
      }

      return res.json({
        message: messages[result.status],
        status: result.status,
      });
    } catch (error) {
      logger.error({ error }, 'Newsletter confirm error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  /**
   * Unsubscribe (public)
   */
  async unsubscribe(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token invalide' });
      }

      const result = await newsletterService.unsubscribe(token);

      const messages: Record<string, string> = {
        unsubscribed: 'Vous avez été désinscrit avec succès',
        already_unsubscribed: 'Vous étiez déjà désinscrit',
        invalid_token: 'Lien invalide',
      };

      if (result.status === 'invalid_token') {
        return res.status(400).json({ error: messages[result.status] });
      }

      return res.json({
        message: messages[result.status],
        status: result.status,
      });
    } catch (error) {
      logger.error({ error }, 'Newsletter unsubscribe error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Get subscriber stats (admin)
   */
  async getStats(_req: Request, res: Response) {
    try {
      const stats = await newsletterService.getStats();
      return res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Newsletter stats error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  /**
   * Get all subscribers (admin)
   */
  async getSubscribers(_req: Request, res: Response) {
    try {
      const subscribers = await newsletterService.getActiveSubscribers();
      return res.json(subscribers);
    } catch (error) {
      logger.error({ error }, 'Newsletter subscribers error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  /**
   * Create campaign (admin)
   */
  async createCampaign(req: Request, res: Response) {
    try {
      const { subject, content, htmlContent } = req.body;

      if (!subject || !content) {
        return res.status(400).json({ error: 'Subject and content are required' });
      }

      const campaign = await newsletterService.createCampaign({
        subject,
        content,
        htmlContent,
      });

      return res.status(201).json(campaign);
    } catch (error) {
      logger.error({ error }, 'Create campaign error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  /**
   * Get all campaigns (admin)
   */
  async getCampaigns(_req: Request, res: Response) {
    try {
      const campaigns = await newsletterService.getCampaigns();
      return res.json(campaigns);
    } catch (error) {
      logger.error({ error }, 'Get campaigns error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  /**
   * Get campaign by ID (admin)
   */
  async getCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const campaign = await newsletterService.getCampaignById(id);

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      return res.json(campaign);
    } catch (error) {
      logger.error({ error }, 'Get campaign error');
      return res.status(500).json({ error: 'Une erreur est survenue' });
    }
  },

  /**
   * Update campaign (admin)
   */
  async updateCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subject, content, htmlContent } = req.body;

      const campaign = await newsletterService.updateCampaign(id, {
        subject,
        content,
        htmlContent,
      });

      return res.json(campaign);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      logger.error({ error }, 'Update campaign error');
      return res.status(400).json({ error: message });
    }
  },

  /**
   * Send campaign (admin)
   */
  async sendCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await newsletterService.sendCampaign(id);

      return res.json({
        message: `Campaign envoyée à ${result.sent} abonnés`,
        ...result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      logger.error({ error }, 'Send campaign error');
      return res.status(400).json({ error: message });
    }
  },

  /**
   * Delete campaign (admin)
   */
  async deleteCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await newsletterService.deleteCampaign(id);

      return res.json({ message: 'Campaign supprimée' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      logger.error({ error }, 'Delete campaign error');
      return res.status(400).json({ error: message });
    }
  },
};
