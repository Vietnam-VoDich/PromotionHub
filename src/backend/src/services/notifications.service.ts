import sgMail from '@sendgrid/mail';
import AfricasTalking from 'africastalking';
import { logger } from '../utils/logger.js';
import type { BookingStatus } from '@prisma/client';

// configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// configure Africa's Talking (SMS for West Africa)
// only initialize if API key is provided
let smsClient: ReturnType<typeof AfricasTalking>['SMS'] | null = null;

if (process.env.AFRICASTALKING_API_KEY) {
  const africasTalking = AfricasTalking({
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
  });
  smsClient = africasTalking.SMS;
}

const isDev = process.env.NODE_ENV !== 'production';
const emailFrom = process.env.SMTP_FROM || 'notifications@promotionhub.ci';

const frontendUrl = process.env.FRONTEND_URL || 'https://promotionhub.ci';

// Email templates
const emailTemplates = {
  // ============================================
  // INSCRIPTION & VERIFICATION
  // ============================================
  welcome: (data: { name: string; verifyUrl: string }) => ({
    subject: 'Bienvenue sur PromotionHub !',
    body: `
      Bonjour ${data.name},

      Bienvenue sur PromotionHub, la marketplace de l'affichage publicitaire en Côte d'Ivoire !

      Pour commencer à utiliser votre compte, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :

      ${data.verifyUrl}

      Ce lien expire dans 24 heures.

      Avec PromotionHub, vous pouvez :
      • Rechercher et réserver des panneaux publicitaires
      • Gérer vos campagnes d'affichage
      • Suivre vos réservations en temps réel

      À très bientôt sur PromotionHub !

      L'équipe PromotionHub
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">PromotionHub</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #1f2937;">Bienvenue ${data.name} !</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Bienvenue sur PromotionHub, la marketplace de l'affichage publicitaire en Côte d'Ivoire !
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            Pour commencer à utiliser votre compte, veuillez confirmer votre adresse email :
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verifyUrl}" style="background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Confirmer mon email
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">
            Ce lien expire dans 24 heures.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #4b5563;">Avec PromotionHub, vous pouvez :</p>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>Rechercher et réserver des panneaux publicitaires</li>
            <li>Gérer vos campagnes d'affichage</li>
            <li>Suivre vos réservations en temps réel</li>
          </ul>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} PromotionHub - Abidjan, Côte d'Ivoire</p>
        </div>
      </div>
    `,
  }),

  emailVerified: (data: { name: string }) => ({
    subject: 'Email confirmé - Bienvenue sur PromotionHub',
    body: `
      Bonjour ${data.name},

      Votre adresse email a été confirmée avec succès !

      Vous pouvez maintenant profiter de toutes les fonctionnalités de PromotionHub.

      Commencez dès maintenant : ${frontendUrl}/listings

      L'équipe PromotionHub
    `,
  }),

  passwordReset: (data: { name: string; resetUrl: string }) => ({
    subject: 'Réinitialisation de mot de passe - PromotionHub',
    body: `
      Bonjour ${data.name},

      Vous avez demandé la réinitialisation de votre mot de passe.

      Cliquez sur ce lien pour créer un nouveau mot de passe :
      ${data.resetUrl}

      Ce lien expire dans 1 heure.

      Si vous n'avez pas fait cette demande, ignorez cet email.

      L'équipe PromotionHub
    `,
  }),

  // ============================================
  // RESERVATIONS
  // ============================================
  bookingCreated: (data: { ownerName: string; listingTitle: string; dates: string }) => ({
    subject: `Nouvelle réservation pour ${data.listingTitle}`,
    body: `
      Bonjour ${data.ownerName},

      Vous avez reçu une nouvelle demande de réservation pour votre panneau "${data.listingTitle}".

      Dates: ${data.dates}

      Connectez-vous à votre compte pour accepter ou refuser cette demande.

      L'équipe PromotionHub
    `,
  }),

  bookingConfirmed: (data: { advertiserName: string; listingTitle: string; dates: string }) => ({
    subject: `Réservation confirmée - ${data.listingTitle}`,
    body: `
      Bonjour ${data.advertiserName},

      Votre réservation pour "${data.listingTitle}" a été confirmée!

      Dates: ${data.dates}

      Vous pouvez maintenant signer le contrat dans votre espace client.

      L'équipe PromotionHub
    `,
  }),

  bookingRejected: (data: { advertiserName: string; listingTitle: string }) => ({
    subject: `Réservation refusée - ${data.listingTitle}`,
    body: `
      Bonjour ${data.advertiserName},

      Malheureusement, votre demande de réservation pour "${data.listingTitle}" a été refusée.

      N'hésitez pas à rechercher d'autres panneaux disponibles sur notre plateforme.

      L'équipe PromotionHub
    `,
  }),

  paymentReceived: (data: { name: string; amount: string; reference: string }) => ({
    subject: `Paiement reçu - ${data.reference}`,
    body: `
      Bonjour ${data.name},

      Nous avons bien reçu votre paiement de ${data.amount} XOF.

      Référence: ${data.reference}

      L'équipe PromotionHub
    `,
  }),
};

// SMS templates
const smsTemplates = {
  bookingCreated: (_ownerName: string, listingTitle: string) =>
    `PromotionHub: Nouvelle réservation pour "${listingTitle}". Connectez-vous pour répondre.`,

  bookingConfirmed: (listingTitle: string) =>
    `PromotionHub: Votre réservation pour "${listingTitle}" est confirmée!`,

  paymentReminder: (listingTitle: string, amount: string) =>
    `PromotionHub: Rappel - ${amount} XOF à payer pour "${listingTitle}".`,
};

/**
 * Send email using SendGrid
 */
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // use mock in development or if no API key
  if (isDev || !process.env.SENDGRID_API_KEY) {
    logger.info({ to, subject }, '[MOCK] Sending email');
    return true;
  }

  try {
    await sgMail.send({
      to,
      from: emailFrom,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    logger.info({ to, subject }, 'Email sent successfully');
    return true;
  } catch (error) {
    logger.error({ error, to, subject }, 'Failed to send email');
    return false;
  }
}

/**
 * Send SMS using Africa's Talking (optimized for West Africa)
 */
async function sendSMS(to: string, message: string): Promise<boolean> {
  // use mock in development or if no API key/client
  if (isDev || !smsClient) {
    logger.info({ to, message: message.substring(0, 30) + '...' }, '[MOCK] Sending SMS');
    return true;
  }

  try {
    // format phone number for Africa's Talking (needs + prefix)
    const formattedPhone = to.startsWith('+') ? to : `+${to}`;

    await smsClient.send({
      to: [formattedPhone],
      message,
      from: process.env.AFRICASTALKING_SENDER_ID || 'PromotionHub',
    });

    logger.info({ to: formattedPhone }, 'SMS sent successfully');
    return true;
  } catch (error) {
    logger.error({ error, to }, 'Failed to send SMS');
    return false;
  }
}

interface BookingData {
  id: string;
  startDate: Date;
  endDate: Date;
  listing: {
    title: string;
    owner: {
      firstName: string | null;
      lastName: string | null;
      email: string;
      phone: string | null;
    };
  };
  advertiser: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
}

export const notificationsService = {
  async sendBookingCreatedNotification(booking: BookingData) {
    const ownerName =
      `${booking.listing.owner.firstName || ''} ${booking.listing.owner.lastName || ''}`.trim() ||
      'Cher propriétaire';
    const dates = `${booking.startDate.toLocaleDateString('fr-FR')} - ${booking.endDate.toLocaleDateString('fr-FR')}`;

    // send email to owner
    const emailData = emailTemplates.bookingCreated({
      ownerName,
      listingTitle: booking.listing.title,
      dates,
    });

    await sendEmail(booking.listing.owner.email, emailData.subject, emailData.body);

    // send SMS to owner if phone available
    if (booking.listing.owner.phone) {
      await sendSMS(
        booking.listing.owner.phone,
        smsTemplates.bookingCreated(ownerName, booking.listing.title)
      );
    }
  },

  async sendBookingStatusNotification(booking: BookingData, status: BookingStatus) {
    const advertiserName =
      `${booking.advertiser.firstName || ''} ${booking.advertiser.lastName || ''}`.trim() ||
      'Cher client';
    const dates = `${booking.startDate.toLocaleDateString('fr-FR')} - ${booking.endDate.toLocaleDateString('fr-FR')}`;

    if (status === 'confirmed') {
      const emailData = emailTemplates.bookingConfirmed({
        advertiserName,
        listingTitle: booking.listing.title,
        dates,
      });

      await sendEmail(booking.advertiser.email, emailData.subject, emailData.body);

      if (booking.advertiser.phone) {
        await sendSMS(
          booking.advertiser.phone,
          smsTemplates.bookingConfirmed(booking.listing.title)
        );
      }
    }

    if (status === 'rejected') {
      const emailData = emailTemplates.bookingRejected({
        advertiserName,
        listingTitle: booking.listing.title,
      });

      await sendEmail(booking.advertiser.email, emailData.subject, emailData.body);
    }
  },

  async sendPaymentNotification(data: {
    email: string;
    phone?: string | null;
    name: string;
    amount: number;
    reference: string;
  }) {
    const emailData = emailTemplates.paymentReceived({
      name: data.name,
      amount: data.amount.toLocaleString('fr-FR'),
      reference: data.reference,
    });

    await sendEmail(data.email, emailData.subject, emailData.body);
  },

  async sendPaymentReminder(data: { phone: string; listingTitle: string; amount: number }) {
    await sendSMS(
      data.phone,
      smsTemplates.paymentReminder(data.listingTitle, data.amount.toLocaleString('fr-FR'))
    );
  },

  // ============================================
  // WELCOME & VERIFICATION EMAILS
  // ============================================
  async sendWelcomeEmail(data: { email: string; name: string; verifyToken: string }) {
    const verifyUrl = `${frontendUrl}/verify-email?token=${data.verifyToken}`;
    const template = emailTemplates.welcome({ name: data.name, verifyUrl });

    await sendEmailHtml(data.email, template.subject, template.body, template.html);
  },

  async sendEmailVerifiedNotification(data: { email: string; name: string }) {
    const template = emailTemplates.emailVerified({ name: data.name });
    await sendEmail(data.email, template.subject, template.body);
  },

  async sendPasswordResetEmail(data: { email: string; name: string; resetToken: string }) {
    const resetUrl = `${frontendUrl}/reset-password?token=${data.resetToken}`;
    const template = emailTemplates.passwordReset({ name: data.name, resetUrl });
    await sendEmail(data.email, template.subject, template.body);
  },

  // ============================================
  // NEWSLETTER
  // ============================================
  async sendNewsletterConfirmation(data: { email: string; name?: string; confirmUrl: string }) {
    const subject = 'Confirmez votre inscription à la newsletter PromotionHub';
    const body = `
      Bonjour${data.name ? ` ${data.name}` : ''},

      Merci de votre intérêt pour PromotionHub !

      Pour confirmer votre inscription à notre newsletter, cliquez sur le lien ci-dessous :
      ${data.confirmUrl}

      Vous recevrez des actualités sur les nouveaux panneaux publicitaires, des conseils marketing et des offres exclusives.

      Si vous n'avez pas demandé cette inscription, ignorez simplement cet email.

      L'équipe PromotionHub
    `;

    await sendEmail(data.email, subject, body);
  },

  async sendNewsletterWelcome(data: { email: string; name?: string; unsubscribeUrl: string }) {
    const subject = 'Bienvenue dans la newsletter PromotionHub !';
    const body = `
      Bonjour${data.name ? ` ${data.name}` : ''},

      Votre inscription à la newsletter PromotionHub est confirmée !

      Vous recevrez régulièrement :
      • Les nouveaux panneaux publicitaires disponibles
      • Des conseils pour optimiser vos campagnes d'affichage
      • Des offres et promotions exclusives

      Pour vous désinscrire : ${data.unsubscribeUrl}

      À bientôt !

      L'équipe PromotionHub
    `;

    await sendEmail(data.email, subject, body);
  },

  async sendNewsletterCampaign(data: {
    recipients: Array<{ email: string; name?: string; unsubscribeToken: string }>;
    subject: string;
    content: string;
    htmlContent?: string;
  }): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of data.recipients) {
      const unsubscribeUrl = `${frontendUrl}/newsletter/unsubscribe?token=${recipient.unsubscribeToken}`;
      const personalizedContent = data.content
        .replace(/{{name}}/g, recipient.name || 'Cher abonné')
        .replace(/{{unsubscribe_url}}/g, unsubscribeUrl);

      const personalizedHtml = data.htmlContent
        ? data.htmlContent
            .replace(/{{name}}/g, recipient.name || 'Cher abonné')
            .replace(/{{unsubscribe_url}}/g, unsubscribeUrl)
        : undefined;

      const success = personalizedHtml
        ? await sendEmailHtml(recipient.email, data.subject, personalizedContent, personalizedHtml)
        : await sendEmail(recipient.email, data.subject, personalizedContent);

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // rate limiting: wait 100ms between emails to avoid hitting SendGrid limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
  },
};

/**
 * Send HTML email using SendGrid
 */
async function sendEmailHtml(to: string, subject: string, text: string, html: string): Promise<boolean> {
  if (isDev || !process.env.SENDGRID_API_KEY) {
    logger.info({ to, subject }, '[MOCK] Sending HTML email');
    return true;
  }

  try {
    await sgMail.send({
      to,
      from: emailFrom,
      subject,
      text,
      html,
    });

    logger.info({ to, subject }, 'HTML email sent successfully');
    return true;
  } catch (error) {
    logger.error({ error, to, subject }, 'Failed to send HTML email');
    return false;
  }
}
