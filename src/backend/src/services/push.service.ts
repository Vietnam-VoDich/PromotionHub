import webpush from 'web-push';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

// configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:notifications@promotionhub.ci';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export const pushService = {
  /**
   * Get VAPID public key for client subscription
   */
  getVapidPublicKey(): string | null {
    return vapidPublicKey || null;
  },

  /**
   * Subscribe a user to push notifications
   */
  async subscribe(userId: string, subscription: PushSubscription): Promise<void> {
    // store subscription in database
    await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date(),
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    logger.info({ userId }, 'Push subscription saved');
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(endpoint: string): Promise<void> {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    logger.info({ endpoint }, 'Push subscription removed');
  },

  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<number> {
    if (!vapidPublicKey || !vapidPrivateKey) {
      logger.warn('VAPID keys not configured, skipping push notification');
      return 0;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      logger.debug({ userId }, 'No push subscriptions found for user');
      return 0;
    }

    let successCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            ...payload,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/badge-72x72.png',
          })
        );
        successCount++;
      } catch (error: unknown) {
        const webPushError = error as { statusCode?: number };
        logger.error({ error, endpoint: sub.endpoint }, 'Failed to send push notification');

        // remove invalid subscriptions (410 Gone or 404 Not Found)
        if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
          failedEndpoints.push(sub.endpoint);
        }
      }
    }

    // clean up failed subscriptions
    if (failedEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: failedEndpoints } },
      });
      logger.info({ count: failedEndpoints.length }, 'Cleaned up expired push subscriptions');
    }

    logger.info({ userId, successCount, total: subscriptions.length }, 'Push notifications sent');
    return successCount;
  },

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<number> {
    let totalSuccess = 0;

    for (const userId of userIds) {
      const count = await this.sendToUser(userId, payload);
      totalSuccess += count;
    }

    return totalSuccess;
  },

  /**
   * Send push notification to all subscribed users
   */
  async broadcast(payload: PushNotificationPayload): Promise<number> {
    if (!vapidPublicKey || !vapidPrivateKey) {
      logger.warn('VAPID keys not configured, skipping broadcast');
      return 0;
    }

    const subscriptions = await prisma.pushSubscription.findMany();

    let successCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload)
        );
        successCount++;
      } catch (error: unknown) {
        const webPushError = error as { statusCode?: number };
        if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
          failedEndpoints.push(sub.endpoint);
        }
      }
    }

    // clean up failed subscriptions
    if (failedEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: failedEndpoints } },
      });
    }

    logger.info({ successCount, total: subscriptions.length }, 'Broadcast push notifications sent');
    return successCount;
  },

  // notification helpers for common events
  async notifyNewBooking(ownerId: string, listingTitle: string, bookingId: string): Promise<void> {
    await this.sendToUser(ownerId, {
      title: 'Nouvelle réservation',
      body: `Nouvelle demande de réservation pour "${listingTitle}"`,
      url: `/bookings/${bookingId}`,
      tag: 'booking-new',
    });
  },

  async notifyBookingConfirmed(advertiserId: string, listingTitle: string, bookingId: string): Promise<void> {
    await this.sendToUser(advertiserId, {
      title: 'Réservation confirmée',
      body: `Votre réservation pour "${listingTitle}" a été confirmée!`,
      url: `/bookings/${bookingId}`,
      tag: 'booking-confirmed',
    });
  },

  async notifyNewMessage(userId: string, senderName: string, preview: string): Promise<void> {
    await this.sendToUser(userId, {
      title: `Message de ${senderName}`,
      body: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
      url: '/messages',
      tag: 'message-new',
    });
  },

  async notifyPaymentReceived(userId: string, amount: number): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Paiement reçu',
      body: `Votre paiement de ${amount.toLocaleString('fr-FR')} XOF a été confirmé`,
      url: '/dashboard',
      tag: 'payment-received',
    });
  },
};
