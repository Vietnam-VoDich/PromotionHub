import { logger } from '../utils/logger.js';

/**
 * WhatsApp Business API Service
 *
 * Options de providers:
 * 1. Meta Business API (officiel) - https://business.whatsapp.com/
 * 2. Twilio WhatsApp - https://www.twilio.com/whatsapp
 * 3. 360dialog - https://www.360dialog.com/
 *
 * On utilise l'API Meta (gratuit pour messages initiés par user)
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const isDev = process.env.NODE_ENV !== 'production';

// Templates pré-approuvés par Meta (obligatoire pour messages business)
const templates = {
  bookingCreated: {
    name: 'booking_created',
    language: 'fr',
  },
  bookingConfirmed: {
    name: 'booking_confirmed',
    language: 'fr',
  },
  paymentReceived: {
    name: 'payment_received',
    language: 'fr',
  },
  welcome: {
    name: 'welcome_message',
    language: 'fr',
  },
};

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: 'body' | 'header';
      parameters: Array<{ type: 'text'; text: string }>;
    }>;
  };
}

export const whatsappService = {
  /**
   * Format phone number for WhatsApp (needs country code, no +)
   */
  formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    // Add Ivory Coast code if not present
    if (!cleaned.startsWith('225') && cleaned.length <= 10) {
      cleaned = '225' + cleaned;
    }

    // Remove + if present
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    return cleaned;
  },

  /**
   * Send a text message (only works if user messaged first in 24h)
   */
  async sendText(to: string, message: string): Promise<boolean> {
    if (isDev || !WHATSAPP_TOKEN) {
      logger.info({ to, message: message.substring(0, 50) + '...' }, '[MOCK] WhatsApp text');
      return true;
    }

    try {
      const payload: WhatsAppMessage = {
        to: this.formatPhone(to),
        type: 'text',
        text: { body: message },
      };

      const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...payload,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error({ error, status: response.status }, 'WhatsApp API error');
        return false;
      }

      logger.info({ to }, 'WhatsApp message sent');
      return true;
    } catch (error) {
      logger.error({ error, to }, 'Failed to send WhatsApp message');
      return false;
    }
  },

  /**
   * Send a template message (can be sent anytime, needs Meta approval)
   */
  async sendTemplate(
    to: string,
    templateName: keyof typeof templates,
    parameters: string[] = []
  ): Promise<boolean> {
    if (isDev || !WHATSAPP_TOKEN) {
      logger.info({ to, templateName, parameters }, '[MOCK] WhatsApp template');
      return true;
    }

    try {
      const template = templates[templateName];

      const payload: WhatsAppMessage = {
        to: this.formatPhone(to),
        type: 'template',
        template: {
          name: template.name,
          language: { code: template.language },
          components: parameters.length > 0 ? [
            {
              type: 'body',
              parameters: parameters.map(text => ({ type: 'text', text })),
            },
          ] : undefined,
        },
      };

      const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...payload,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error({ error, status: response.status }, 'WhatsApp template error');
        return false;
      }

      logger.info({ to, templateName }, 'WhatsApp template sent');
      return true;
    } catch (error) {
      logger.error({ error, to }, 'Failed to send WhatsApp template');
      return false;
    }
  },

  // ============================================
  // NOTIFICATION HELPERS
  // ============================================

  async notifyBookingCreated(phone: string, listingTitle: string): Promise<boolean> {
    return this.sendTemplate(phone, 'bookingCreated', [listingTitle]);
  },

  async notifyBookingConfirmed(phone: string, listingTitle: string): Promise<boolean> {
    return this.sendTemplate(phone, 'bookingConfirmed', [listingTitle]);
  },

  async notifyPaymentReceived(phone: string, amount: string): Promise<boolean> {
    return this.sendTemplate(phone, 'paymentReceived', [amount]);
  },

  async sendWelcome(phone: string, name: string): Promise<boolean> {
    return this.sendTemplate(phone, 'welcome', [name]);
  },

  /**
   * Send a WhatsApp link for user to start conversation
   * This is FREE - user initiates the conversation
   */
  generateWhatsAppLink(phone: string, message: string): string {
    const formattedPhone = this.formatPhone(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  },

  /**
   * Generate click-to-chat link for support
   */
  getSupportLink(userMessage: string = ''): string {
    const supportPhone = process.env.WHATSAPP_SUPPORT_PHONE || '2250700000000';
    const defaultMessage = userMessage || 'Bonjour, j\'ai besoin d\'aide avec ma réservation PromotionHub.';
    return this.generateWhatsAppLink(supportPhone, defaultMessage);
  },
};
