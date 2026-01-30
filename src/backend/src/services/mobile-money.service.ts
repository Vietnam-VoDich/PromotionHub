import { logger } from '../utils/logger.js';

// Orange Money Côte d'Ivoire API types
interface OrangeMoneyPaymentRequest {
  amount: number;
  currency: string;
  phone: string;
  reference: string;
  description: string;
  callbackUrl: string;
}

interface OrangeMoneyPaymentResponse {
  transactionId: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  message?: string;
}

// MTN Mobile Money API types
interface MTNMoMoPaymentRequest {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: 'MSISDN';
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

interface MTNMoMoPaymentResponse {
  referenceId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: string;
}

// Wave Côte d'Ivoire API types
interface WavePaymentRequest {
  amount: string;
  currency: string;
  client_reference: string;
  error_url: string;
  success_url: string;
}

interface WavePaymentResponse {
  id: string;
  wave_launch_url: string;
  when_completed: 'succeeded' | 'failed' | 'pending';
  client_reference: string;
  amount: string;
  currency: string;
}

// base URL from environment
const ORANGE_MONEY_API_URL = process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay/ci/v1';
const MTN_MOMO_API_URL = process.env.MTN_MONEY_API_URL || 'https://sandbox.momodeveloper.mtn.com';
const WAVE_API_URL = process.env.WAVE_API_URL || 'https://api.wave.com/v1';

const isDev = process.env.NODE_ENV !== 'production';

export const mobileMoneyService = {
  /**
   * Initiate Orange Money payment
   * Documentation: https://developer.orange.com/apis/om-webpay-ci
   */
  async initiateOrangeMoneyPayment(params: {
    amount: number;
    phone: string;
    reference: string;
    description?: string;
  }): Promise<{ transactionId: string; status: string }> {
    const apiKey = process.env.ORANGE_MONEY_API_KEY;
    const merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY;

    // use mock in development or if no API key
    if (isDev || !apiKey) {
      logger.info({ ...params, provider: 'orange_money' }, 'Using mock Orange Money payment');
      return this.mockPayment('orange_money', params.reference);
    }

    try {
      const payload: OrangeMoneyPaymentRequest = {
        amount: params.amount,
        currency: 'XOF',
        phone: this.formatPhoneNumber(params.phone, 'CI'),
        reference: params.reference,
        description: params.description || 'Paiement PromotionHub',
        callbackUrl: `${process.env.API_URL}/api/payments/webhook/orange-money`,
      };

      const response = await fetch(`${ORANGE_MONEY_API_URL}/webpayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Merchant-Key': merchantKey || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error({ error, status: response.status }, 'Orange Money API error');
        throw new Error(`Orange Money API error: ${response.status}`);
      }

      const data = await response.json() as OrangeMoneyPaymentResponse;

      logger.info({ transactionId: data.transactionId, status: data.status }, 'Orange Money payment initiated');

      return {
        transactionId: data.transactionId,
        status: data.status.toLowerCase(),
      };
    } catch (error) {
      logger.error({ error }, 'Failed to initiate Orange Money payment');
      throw error;
    }
  },

  /**
   * Initiate MTN Mobile Money payment
   * Documentation: https://momodeveloper.mtn.com/docs/services/collection
   */
  async initiateMTNMoMoPayment(params: {
    amount: number;
    phone: string;
    reference: string;
    description?: string;
  }): Promise<{ transactionId: string; status: string }> {
    const apiKey = process.env.MTN_MONEY_API_KEY;
    const subscriptionKey = process.env.MTN_MONEY_SUBSCRIPTION_KEY;

    // use mock in development or if no API key
    if (isDev || !apiKey) {
      logger.info({ ...params, provider: 'mtn_money' }, 'Using mock MTN MoMo payment');
      return this.mockPayment('mtn_money', params.reference);
    }

    try {
      // generate unique reference ID
      const referenceId = crypto.randomUUID();

      const payload: MTNMoMoPaymentRequest = {
        amount: params.amount.toString(),
        currency: 'XOF',
        externalId: params.reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: this.formatPhoneNumber(params.phone, 'CI'),
        },
        payerMessage: params.description || 'Paiement PromotionHub',
        payeeNote: `Réservation ${params.reference}`,
      };

      const response = await fetch(`${MTN_MOMO_API_URL}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
          'Ocp-Apim-Subscription-Key': subscriptionKey || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok && response.status !== 202) {
        const error = await response.text();
        logger.error({ error, status: response.status }, 'MTN MoMo API error');
        throw new Error(`MTN MoMo API error: ${response.status}`);
      }

      logger.info({ transactionId: referenceId }, 'MTN MoMo payment initiated');

      return {
        transactionId: referenceId,
        status: 'pending',
      };
    } catch (error) {
      logger.error({ error }, 'Failed to initiate MTN MoMo payment');
      throw error;
    }
  },

  /**
   * Check payment status with Orange Money
   */
  async checkOrangeMoneyStatus(transactionId: string): Promise<{ status: string; amount?: number }> {
    const apiKey = process.env.ORANGE_MONEY_API_KEY;

    if (isDev || !apiKey) {
      return this.mockCheckStatus(transactionId);
    }

    try {
      const response = await fetch(`${ORANGE_MONEY_API_URL}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Orange Money status: ${response.status}`);
      }

      const data = await response.json() as OrangeMoneyPaymentResponse;

      return {
        status: data.status.toLowerCase() === 'success' ? 'success' :
                data.status.toLowerCase() === 'failed' ? 'failed' : 'pending',
      };
    } catch (error) {
      logger.error({ error, transactionId }, 'Failed to check Orange Money status');
      throw error;
    }
  },

  /**
   * Initiate Wave payment (popular in Senegal, Côte d'Ivoire, Mali, etc.)
   * Documentation: https://docs.wave.com/api
   */
  async initiateWavePayment(params: {
    amount: number;
    reference: string;
    description?: string;
  }): Promise<{ transactionId: string; status: string; paymentUrl?: string }> {
    const apiKey = process.env.WAVE_API_KEY;

    // use mock in development or if no API key
    if (isDev || !apiKey) {
      logger.info({ ...params, provider: 'wave' }, 'Using mock Wave payment');
      return {
        ...this.mockPayment('wave', params.reference),
        paymentUrl: `https://pay.wave.com/mock/${params.reference}`,
      };
    }

    try {
      const payload: WavePaymentRequest = {
        amount: params.amount.toString(),
        currency: 'XOF',
        client_reference: params.reference,
        error_url: `${process.env.FRONTEND_URL}/checkout/error?ref=${params.reference}`,
        success_url: `${process.env.FRONTEND_URL}/checkout/success?ref=${params.reference}`,
      };

      const response = await fetch(`${WAVE_API_URL}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error({ error, status: response.status }, 'Wave API error');
        throw new Error(`Wave API error: ${response.status}`);
      }

      const data = await response.json() as WavePaymentResponse;

      logger.info({ transactionId: data.id, status: data.when_completed }, 'Wave payment initiated');

      return {
        transactionId: data.id,
        status: data.when_completed === 'succeeded' ? 'success' :
                data.when_completed === 'failed' ? 'failed' : 'pending',
        paymentUrl: data.wave_launch_url,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to initiate Wave payment');
      throw error;
    }
  },

  /**
   * Check Wave payment status
   */
  async checkWaveStatus(transactionId: string): Promise<{ status: string; amount?: number }> {
    const apiKey = process.env.WAVE_API_KEY;

    if (isDev || !apiKey) {
      return this.mockCheckStatus(transactionId);
    }

    try {
      const response = await fetch(`${WAVE_API_URL}/checkout/sessions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Wave status: ${response.status}`);
      }

      const data = await response.json() as WavePaymentResponse;

      return {
        status: data.when_completed === 'succeeded' ? 'success' :
                data.when_completed === 'failed' ? 'failed' : 'pending',
        amount: parseFloat(data.amount),
      };
    } catch (error) {
      logger.error({ error, transactionId }, 'Failed to check Wave status');
      throw error;
    }
  },

  /**
   * Check payment status with MTN MoMo
   */
  async checkMTNMoMoStatus(transactionId: string): Promise<{ status: string; amount?: number }> {
    const apiKey = process.env.MTN_MONEY_API_KEY;
    const subscriptionKey = process.env.MTN_MONEY_SUBSCRIPTION_KEY;

    if (isDev || !apiKey) {
      return this.mockCheckStatus(transactionId);
    }

    try {
      const response = await fetch(`${MTN_MOMO_API_URL}/collection/v1_0/requesttopay/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
          'Ocp-Apim-Subscription-Key': subscriptionKey || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check MTN MoMo status: ${response.status}`);
      }

      const data = await response.json() as MTNMoMoPaymentResponse;

      return {
        status: data.status.toLowerCase() === 'successful' ? 'success' :
                data.status.toLowerCase() === 'failed' ? 'failed' : 'pending',
      };
    } catch (error) {
      logger.error({ error, transactionId }, 'Failed to check MTN MoMo status');
      throw error;
    }
  },

  /**
   * Format phone number for Mobile Money APIs
   */
  formatPhoneNumber(phone: string, countryCode: string): string {
    // remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // add country code if not present
    if (countryCode === 'CI' && !cleaned.startsWith('225')) {
      cleaned = '225' + cleaned;
    }

    return cleaned;
  },

  /**
   * Mock payment for development/testing
   */
  mockPayment(provider: string, reference: string): { transactionId: string; status: string } {
    const transactionId = `${provider.toUpperCase()}_MOCK_${Date.now()}_${reference.substring(0, 8)}`;

    logger.info({ transactionId, provider }, 'Mock payment created');

    return {
      transactionId,
      status: 'pending',
    };
  },

  /**
   * Mock status check for development
   */
  mockCheckStatus(transactionId: string): { status: string } {
    // simulate random success rate in development (70% success)
    const randomSuccess = Math.random() > 0.3;

    logger.info({ transactionId, mockStatus: randomSuccess ? 'success' : 'pending' }, 'Mock status check');

    return {
      status: randomSuccess ? 'success' : 'pending',
    };
  },
};
