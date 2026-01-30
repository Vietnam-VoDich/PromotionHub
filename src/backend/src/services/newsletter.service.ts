import { prisma } from '../lib/prisma.js';
import { notificationsService } from './notifications.service.js';
import { logger } from '../utils/logger.js';

const frontendUrl = process.env.FRONTEND_URL || 'https://promotionhub.ci';

export const newsletterService = {
  /**
   * Subscribe to newsletter (double opt-in)
   */
  async subscribe(data: { email: string; firstName?: string; source?: string }) {
    const email = data.email.toLowerCase().trim();

    // check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive && existing.confirmedAt) {
        return { status: 'already_subscribed', subscriber: existing };
      }

      // reactivate if previously unsubscribed
      if (!existing.isActive) {
        const updated = await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            unsubscribedAt: null,
            firstName: data.firstName || existing.firstName,
          },
        });

        // send confirmation email
        await notificationsService.sendNewsletterConfirmation({
          email,
          name: updated.firstName || undefined,
          confirmUrl: `${frontendUrl}/newsletter/confirm?token=${updated.token}`,
        });

        return { status: 'reactivated', subscriber: updated };
      }

      // resend confirmation if not yet confirmed
      await notificationsService.sendNewsletterConfirmation({
        email,
        name: existing.firstName || undefined,
        confirmUrl: `${frontendUrl}/newsletter/confirm?token=${existing.token}`,
      });

      return { status: 'confirmation_resent', subscriber: existing };
    }

    // create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName: data.firstName,
        source: data.source,
      },
    });

    // send confirmation email
    await notificationsService.sendNewsletterConfirmation({
      email,
      name: subscriber.firstName || undefined,
      confirmUrl: `${frontendUrl}/newsletter/confirm?token=${subscriber.token}`,
    });

    logger.info({ email, source: data.source }, 'Newsletter subscription initiated');

    return { status: 'pending_confirmation', subscriber };
  },

  /**
   * Confirm newsletter subscription
   */
  async confirmSubscription(token: string) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      return { status: 'invalid_token' };
    }

    if (subscriber.confirmedAt) {
      return { status: 'already_confirmed', subscriber };
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { token },
      data: {
        confirmedAt: new Date(),
        isActive: true,
      },
    });

    // send welcome email
    await notificationsService.sendNewsletterWelcome({
      email: updated.email,
      name: updated.firstName || undefined,
      unsubscribeUrl: `${frontendUrl}/newsletter/unsubscribe?token=${updated.token}`,
    });

    logger.info({ email: updated.email }, 'Newsletter subscription confirmed');

    return { status: 'confirmed', subscriber: updated };
  },

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(token: string) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      return { status: 'invalid_token' };
    }

    if (!subscriber.isActive) {
      return { status: 'already_unsubscribed', subscriber };
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { token },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    logger.info({ email: updated.email }, 'Newsletter unsubscribed');

    return { status: 'unsubscribed', subscriber: updated };
  },

  /**
   * Get all active confirmed subscribers
   */
  async getActiveSubscribers() {
    return prisma.newsletterSubscriber.findMany({
      where: {
        isActive: true,
        confirmedAt: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get subscriber stats
   */
  async getStats() {
    const [total, active, pending, unsubscribed] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({
        where: { isActive: true, confirmedAt: { not: null } },
      }),
      prisma.newsletterSubscriber.count({
        where: { confirmedAt: null },
      }),
      prisma.newsletterSubscriber.count({
        where: { isActive: false },
      }),
    ]);

    return { total, active, pending, unsubscribed };
  },

  // ============================================
  // CAMPAIGN MANAGEMENT
  // ============================================

  /**
   * Create a new campaign (draft)
   */
  async createCampaign(data: { subject: string; content: string; htmlContent?: string }) {
    return prisma.newsletterCampaign.create({
      data: {
        subject: data.subject,
        content: data.content,
        htmlContent: data.htmlContent,
        status: 'draft',
      },
    });
  },

  /**
   * Update a campaign
   */
  async updateCampaign(id: string, data: { subject?: string; content?: string; htmlContent?: string }) {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new Error('Cannot edit a campaign that is not in draft status');
    }

    return prisma.newsletterCampaign.update({
      where: { id },
      data,
    });
  },

  /**
   * Send a campaign to all active subscribers
   */
  async sendCampaign(id: string) {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new Error('Campaign has already been sent or is being sent');
    }

    // update status to sending
    await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'sending' },
    });

    try {
      // get all active subscribers
      const subscribers = await this.getActiveSubscribers();

      if (subscribers.length === 0) {
        await prisma.newsletterCampaign.update({
          where: { id },
          data: { status: 'sent', sentAt: new Date(), sentCount: 0 },
        });
        return { sent: 0, failed: 0 };
      }

      // send emails
      const recipients = subscribers.map((s: { email: string; firstName: string | null; token: string }) => ({
        email: s.email,
        name: s.firstName || undefined,
        unsubscribeToken: s.token,
      }));

      const result = await notificationsService.sendNewsletterCampaign({
        recipients,
        subject: campaign.subject,
        content: campaign.content,
        htmlContent: campaign.htmlContent || undefined,
      });

      // update campaign status
      await prisma.newsletterCampaign.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          sentCount: result.sent,
        },
      });

      logger.info({ campaignId: id, sent: result.sent, failed: result.failed }, 'Newsletter campaign sent');

      return result;
    } catch (error) {
      // revert to draft on error
      await prisma.newsletterCampaign.update({
        where: { id },
        data: { status: 'draft' },
      });
      throw error;
    }
  },

  /**
   * Get all campaigns
   */
  async getCampaigns() {
    return prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: string) {
    return prisma.newsletterCampaign.findUnique({ where: { id } });
  },

  /**
   * Delete a draft campaign
   */
  async deleteCampaign(id: string) {
    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new Error('Cannot delete a campaign that has been sent');
    }

    return prisma.newsletterCampaign.delete({ where: { id } });
  },
};
