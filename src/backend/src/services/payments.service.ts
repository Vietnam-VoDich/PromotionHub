import { prisma } from '../lib/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { mobileMoneyService } from './mobile-money.service.js';
import { notificationsService } from './notifications.service.js';
import type { CreatePaymentInput, PaymentWebhookInput } from '../schemas/payments.schema.js';
import type { PaymentMethod, PaymentStatus } from '@prisma/client';

export const paymentsService = {
  async create(data: CreatePaymentInput) {
    const { bookingId, paymentMethod, phone } = data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { advertiser: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      throw new BadRequestError('Cannot create payment for cancelled/rejected booking');
    }

    // check for existing successful payment
    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId, status: 'success' },
    });

    if (existingPayment) {
      throw new BadRequestError('Booking already has a successful payment');
    }

    // initiate payment with mobile money provider
    const phoneNumber = phone || booking.advertiser.phone;

    // Wave doesn't require phone (redirect-based), but Orange/MTN do
    if (!phoneNumber && (paymentMethod === 'orange_money' || paymentMethod === 'mtn_money')) {
      throw new BadRequestError('Phone number required for mobile money payment');
    }

    let transactionId: string | null = null;

    if (paymentMethod === 'orange_money') {
      const result = await mobileMoneyService.initiateOrangeMoneyPayment({
        amount: booking.totalPrice,
        phone: phoneNumber!,
        reference: bookingId,
        description: `Réservation panneau - ${bookingId.substring(0, 8)}`,
      });
      transactionId = result.transactionId;
    } else if (paymentMethod === 'mtn_money') {
      const result = await mobileMoneyService.initiateMTNMoMoPayment({
        amount: booking.totalPrice,
        phone: phoneNumber!,
        reference: bookingId,
        description: `Réservation panneau - ${bookingId.substring(0, 8)}`,
      });
      transactionId = result.transactionId;
    } else if (paymentMethod === 'wave') {
      const result = await mobileMoneyService.initiateWavePayment({
        amount: booking.totalPrice,
        reference: bookingId,
        description: `Réservation panneau - ${bookingId.substring(0, 8)}`,
      });
      transactionId = result.transactionId;
      // Wave returns a payment URL for redirect
      // store this in metadata if needed
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalPrice,
        currency: 'XOF',
        paymentMethod: paymentMethod as PaymentMethod,
        status: 'pending',
        transactionId,
      },
    });

    return payment;
  },

  async findById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            listing: { select: { title: true } },
            advertiser: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  },

  async findByBookingId(bookingId: string) {
    const payments = await prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  },

  async handleWebhook(data: PaymentWebhookInput) {
    const { transactionId, status, amount } = data;

    logger.info({ transactionId, status, amount }, 'Processing payment webhook');

    const payment = await prisma.payment.findFirst({
      where: { transactionId },
      include: { booking: true },
    });

    if (!payment) {
      logger.warn({ transactionId }, 'Payment not found for webhook');
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'pending') {
      logger.warn({ transactionId, currentStatus: payment.status }, 'Payment already processed');
      return payment;
    }

    // validate amount
    if (amount !== payment.amount) {
      logger.error({ expected: payment.amount, received: amount }, 'Amount mismatch');
      throw new BadRequestError('Amount mismatch');
    }

    const newStatus: PaymentStatus = status === 'success' ? 'success' : 'failed';

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    // if payment successful, update booking status and send notifications
    if (newStatus === 'success') {
      // get full booking data for notifications
      const fullBooking = await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed' },
        include: {
          listing: {
            include: {
              owner: true,
            },
          },
          advertiser: true,
        },
      });

      // update listing status
      await prisma.listing.update({
        where: { id: payment.booking.listingId },
        data: { status: 'booked' },
      });

      // send payment confirmation notification
      const advertiserName = `${fullBooking.advertiser.firstName || ''} ${fullBooking.advertiser.lastName || ''}`.trim() || 'Client';

      await notificationsService.sendPaymentNotification({
        email: fullBooking.advertiser.email,
        phone: fullBooking.advertiser.phone,
        name: advertiserName,
        amount: payment.amount,
        reference: payment.id.substring(0, 8).toUpperCase(),
      });

      // send booking confirmed notification
      await notificationsService.sendBookingStatusNotification(fullBooking, 'confirmed');

      logger.info({ bookingId: payment.bookingId }, 'Booking confirmed after payment');
    }

    return updated;
  },

  async checkAndUpdateStatus(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || !payment.transactionId) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'pending') {
      return payment;
    }

    // check status with appropriate provider
    let result: { status: string };

    if (payment.paymentMethod === 'orange_money') {
      result = await mobileMoneyService.checkOrangeMoneyStatus(payment.transactionId);
    } else if (payment.paymentMethod === 'mtn_money') {
      result = await mobileMoneyService.checkMTNMoMoStatus(payment.transactionId);
    } else if (payment.paymentMethod === 'wave') {
      result = await mobileMoneyService.checkWaveStatus(payment.transactionId);
    } else {
      // card payments would have different status check
      return payment;
    }

    if (result.status === 'success') {
      return this.handleWebhook({
        transactionId: payment.transactionId,
        status: 'success',
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    if (result.status === 'failed') {
      return this.handleWebhook({
        transactionId: payment.transactionId,
        status: 'failed',
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    return payment;
  },

  async retryPayment(bookingId: string, paymentMethod: 'orange_money' | 'mtn_money' | 'wave' | 'card', phone?: string) {
    // cancel previous pending payments
    await prisma.payment.updateMany({
      where: { bookingId, status: 'pending' },
      data: { status: 'failed' },
    });

    // create new payment
    return this.create({ bookingId, paymentMethod, phone });
  },
};
