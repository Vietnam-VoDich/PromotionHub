import { prisma } from '../lib/prisma.js';
import { whatsappService } from './whatsapp.service.js';
import { notificationsService } from './notifications.service.js';
import { logger } from '../utils/logger.js';

/**
 * Smart Review Flow Service
 *
 * Stratégie:
 * - Avis 4-5 étoiles → Rediriger vers Google Reviews
 * - Avis 1-3 étoiles → Proposer support WhatsApp + on s'occupe du problème
 *
 * Cela améliore la note Google tout en gérant les mécontents en privé
 */

const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || 'ChIJ...'; // ID Google My Business
const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

interface ReviewFlowResult {
  action: 'redirect_google' | 'show_support' | 'saved';
  message: string;
  googleReviewUrl?: string;
  whatsappSupportUrl?: string;
  review?: {
    id: string;
    rating: number;
  };
}

export const reviewFlowService = {
  /**
   * Process a new review with smart routing
   */
  async processReview(data: {
    listingId: string;
    reviewerId: string;
    rating: number;
    comment?: string;
  }): Promise<ReviewFlowResult> {
    const { listingId, reviewerId, rating, comment } = data;

    // Get reviewer info
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: { id: true, email: true, firstName: true, phone: true },
    });

    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    // Get listing info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true, ownerId: true },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // ============================================
    // GOOD REVIEW (4-5 stars) → Save + Redirect to Google
    // ============================================
    if (rating >= 4) {
      // Save the review
      const review = await prisma.review.create({
        data: {
          listingId,
          reviewerId,
          rating,
          comment,
        },
      });

      logger.info(
        { reviewId: review.id, rating, action: 'redirect_google' },
        'Good review - redirecting to Google'
      );

      return {
        action: 'redirect_google',
        message: `Merci beaucoup pour votre avis positif ! 🎉

Votre satisfaction nous fait très plaisir. Pourriez-vous également partager votre expérience sur Google ? Cela aide énormément d'autres utilisateurs à découvrir PromotionHub.`,
        googleReviewUrl: GOOGLE_REVIEW_URL,
        review: {
          id: review.id,
          rating: review.rating,
        },
      };
    }

    // ============================================
    // BAD REVIEW (1-3 stars) → Save + Offer Support
    // ============================================

    // Save the review (we still save it, just don't promote it)
    const review = await prisma.review.create({
      data: {
        listingId,
        reviewerId,
        rating,
        comment,
      },
    });

    // Prepare personalized support message
    const reviewerName = reviewer.firstName || 'Client';
    const supportMessage = `Bonjour, je suis ${reviewerName}. J'ai laissé un avis sur "${listing.title}" et j'aimerais discuter de mon expérience.`;

    const whatsappUrl = whatsappService.getSupportLink(supportMessage);

    // Send internal alert to admin
    await this.alertTeamAboutBadReview({
      reviewId: review.id,
      reviewerName,
      reviewerEmail: reviewer.email,
      reviewerPhone: reviewer.phone,
      listingTitle: listing.title,
      rating,
      comment,
    });

    logger.info(
      { reviewId: review.id, rating, action: 'show_support' },
      'Bad review - offering support'
    );

    return {
      action: 'show_support',
      message: `Merci pour votre retour.

Nous sommes vraiment désolés que votre expérience n'ait pas été à la hauteur de vos attentes. Votre satisfaction est notre priorité.

Notre équipe souhaite comprendre ce qui s'est passé et trouver une solution. Pouvez-vous nous contacter directement ?`,
      whatsappSupportUrl: whatsappUrl,
      review: {
        id: review.id,
        rating: review.rating,
      },
    };
  },

  /**
   * Alert team about negative review for quick action
   */
  async alertTeamAboutBadReview(data: {
    reviewId: string;
    reviewerName: string;
    reviewerEmail: string;
    reviewerPhone: string | null;
    listingTitle: string;
    rating: number;
    comment?: string;
  }): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@promotionhub.ci';

    // Log the alert details for debugging
    logger.warn({
      alert: 'bad_review',
      reviewId: data.reviewId,
      rating: data.rating,
      listingTitle: data.listingTitle,
      reviewerEmail: data.reviewerEmail,
      comment: data.comment,
    }, `⚠️ Avis négatif (${data.rating}/5) - Action requise`);

    // Send email to admin
    await notificationsService.sendPaymentNotification({
      email: adminEmail,
      name: 'Admin',
      amount: data.rating, // Trick to reuse the template
      reference: `REVIEW-${data.reviewId.substring(0, 8)}`,
    });

    // Also send WhatsApp to support team if configured
    const supportPhone = process.env.WHATSAPP_SUPPORT_PHONE;
    if (supportPhone) {
      await whatsappService.sendText(
        supportPhone,
        `⚠️ Avis ${data.rating}/5 de ${data.reviewerName} sur "${data.listingTitle}". Appeler rapidement!`
      );
    }

    logger.info({ reviewId: data.reviewId }, 'Team alerted about bad review');
  },

  /**
   * Get review statistics with sentiment breakdown
   */
  async getReviewStats(listingId?: string) {
    const where = listingId ? { listingId } : {};

    const [total, positive, neutral, negative, avgRating] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.count({ where: { ...where, rating: { gte: 4 } } }),
      prisma.review.count({ where: { ...where, rating: 3 } }),
      prisma.review.count({ where: { ...where, rating: { lte: 2 } } }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
    ]);

    return {
      total,
      positive,
      neutral,
      negative,
      averageRating: avgRating._avg.rating || 0,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
    };
  },
};
