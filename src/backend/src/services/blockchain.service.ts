import { ethers } from 'ethers';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

// Polygon Mumbai Testnet (free for testing) or Mainnet
const NETWORKS = {
  polygon: {
    rpc: 'https://polygon-rpc.com',
    chainId: 137,
    explorer: 'https://polygonscan.com',
  },
  polygon_mumbai: {
    rpc: 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
    explorer: 'https://mumbai.polygonscan.com',
  },
  // Local mode - no blockchain, just hash storage
  local: {
    rpc: null,
    chainId: 0,
    explorer: null,
  },
};

type NetworkType = keyof typeof NETWORKS;

interface CertificationData {
  entityType: 'booking' | 'verification' | 'payment';
  entityId: string;
  data: Record<string, unknown>;
}

interface CertificationResult {
  hash: string;
  transactionHash: string | null;
  blockNumber: number | null;
  network: string;
  timestamp: Date;
  explorerUrl: string | null;
}

class BlockchainService {
  private network: NetworkType;
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;

  constructor() {
    // Default to local mode (no actual blockchain calls, just hashing)
    // Set BLOCKCHAIN_NETWORK=polygon and BLOCKCHAIN_PRIVATE_KEY to enable real blockchain
    this.network = (process.env.BLOCKCHAIN_NETWORK as NetworkType) || 'local';

    if (this.network !== 'local' && process.env.BLOCKCHAIN_PRIVATE_KEY) {
      const networkConfig = NETWORKS[this.network];
      if (networkConfig.rpc) {
        this.provider = new ethers.JsonRpcProvider(networkConfig.rpc);
        this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
      }
    }
  }

  /**
   * Generate SHA256 hash of certification data
   */
  generateHash(data: Record<string, unknown>): string {
    const sortedData = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(sortedData).digest('hex');
  }

  /**
   * Certify a booking on the blockchain
   */
  async certifyBooking(bookingId: string): Promise<CertificationResult> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            quartier: true,
          },
        },
        advertiser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const certificationData: CertificationData = {
      entityType: 'booking',
      entityId: bookingId,
      data: {
        bookingId: booking.id,
        listingId: booking.listing.id,
        listingTitle: booking.listing.title,
        listingAddress: booking.listing.address,
        advertiserId: booking.advertiser.id,
        advertiserEmail: booking.advertiser.email,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
      },
    };

    return this.certify(certificationData);
  }

  /**
   * Certify a verification photo on the blockchain
   */
  async certifyVerification(verificationId: string): Promise<CertificationResult> {
    const verification = await prisma.verificationPhoto.findUnique({
      where: { id: verificationId },
      include: {
        booking: {
          select: { id: true },
        },
      },
    });

    if (!verification) {
      throw new Error('Verification not found');
    }

    const certificationData: CertificationData = {
      entityType: 'verification',
      entityId: verificationId,
      data: {
        verificationId: verification.id,
        bookingId: verification.booking.id,
        photoUrl: verification.photoUrl,
        uploadedBy: verification.uploadedBy,
        timestamp: verification.timestamp.toISOString(),
        status: verification.status,
      },
    };

    return this.certify(certificationData);
  }

  /**
   * Certify a payment on the blockchain
   */
  async certifyPayment(paymentId: string): Promise<CertificationResult> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: { id: true },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const certificationData: CertificationData = {
      entityType: 'payment',
      entityId: paymentId,
      data: {
        paymentId: payment.id,
        bookingId: payment.booking.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
      },
    };

    return this.certify(certificationData);
  }

  /**
   * Core certification logic
   */
  private async certify(certificationData: CertificationData): Promise<CertificationResult> {
    const hash = this.generateHash(certificationData.data);
    const timestamp = new Date();

    // Check if already certified
    const existing = await prisma.blockchainCertification.findUnique({
      where: {
        entityType_entityId: {
          entityType: certificationData.entityType,
          entityId: certificationData.entityId,
        },
      },
    });

    if (existing && existing.status === 'confirmed') {
      return {
        hash: existing.dataHash,
        transactionHash: existing.transactionHash,
        blockNumber: existing.blockNumber,
        network: existing.network,
        timestamp: existing.certifiedAt || existing.createdAt,
        explorerUrl: this.getExplorerUrl(existing.transactionHash, existing.network as NetworkType),
      };
    }

    let transactionHash: string | null = null;
    let blockNumber: number | null = null;

    // If blockchain is enabled, submit the hash
    if (this.network !== 'local' && this.wallet && this.provider) {
      try {
        // Send a transaction with the hash in the data field
        const tx = await this.wallet.sendTransaction({
          to: this.wallet.address, // self-transfer (cheapest way to store data)
          value: 0,
          data: ethers.hexlify(ethers.toUtf8Bytes(`PROMOTIONHUB:${certificationData.entityType}:${hash}`)),
        });

        const receipt = await tx.wait();
        transactionHash = receipt?.hash || null;
        blockNumber = receipt?.blockNumber || null;
      } catch (error) {
        console.error('Blockchain transaction failed:', error);
        // Continue with local certification even if blockchain fails
      }
    }

    // Store certification in database
    await prisma.blockchainCertification.upsert({
      where: {
        entityType_entityId: {
          entityType: certificationData.entityType,
          entityId: certificationData.entityId,
        },
      },
      create: {
        entityType: certificationData.entityType,
        entityId: certificationData.entityId,
        dataHash: hash,
        transactionHash,
        blockNumber,
        network: this.network,
        status: transactionHash ? 'confirmed' : 'pending',
        metadata: JSON.stringify(certificationData.data),
        certifiedAt: timestamp,
      },
      update: {
        dataHash: hash,
        transactionHash,
        blockNumber,
        status: transactionHash ? 'confirmed' : 'pending',
        metadata: JSON.stringify(certificationData.data),
        certifiedAt: timestamp,
      },
    });

    // Update booking with blockchain info if it's a booking certification
    if (certificationData.entityType === 'booking') {
      await prisma.booking.update({
        where: { id: certificationData.entityId },
        data: {
          blockchainHash: hash,
          blockchainTxId: transactionHash,
          blockchainNetwork: this.network,
          certifiedAt: timestamp,
        },
      });
    }

    return {
      hash,
      transactionHash,
      blockNumber,
      network: this.network,
      timestamp,
      explorerUrl: this.getExplorerUrl(transactionHash, this.network),
    };
  }

  /**
   * Verify a certification hash
   */
  async verify(entityType: string, entityId: string): Promise<{
    valid: boolean;
    certification: CertificationResult | null;
    currentHash: string | null;
    message: string;
  }> {
    const certification = await prisma.blockchainCertification.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
    });

    if (!certification) {
      return {
        valid: false,
        certification: null,
        currentHash: null,
        message: 'Aucune certification trouvée pour cette entité',
      };
    }

    // Recalculate hash from current data
    let currentData: Record<string, unknown> | null = null;

    if (entityType === 'booking') {
      const booking = await prisma.booking.findUnique({
        where: { id: entityId },
        include: {
          listing: { select: { id: true, title: true, address: true } },
          advertiser: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      });
      if (booking) {
        currentData = {
          bookingId: booking.id,
          listingId: booking.listing.id,
          listingTitle: booking.listing.title,
          listingAddress: booking.listing.address,
          advertiserId: booking.advertiser.id,
          advertiserEmail: booking.advertiser.email,
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt.toISOString(),
        };
      }
    }

    const currentHash = currentData ? this.generateHash(currentData) : null;
    const valid = currentHash === certification.dataHash;

    return {
      valid,
      certification: {
        hash: certification.dataHash,
        transactionHash: certification.transactionHash,
        blockNumber: certification.blockNumber,
        network: certification.network,
        timestamp: certification.certifiedAt || certification.createdAt,
        explorerUrl: this.getExplorerUrl(certification.transactionHash, certification.network as NetworkType),
      },
      currentHash,
      message: valid
        ? 'Les données correspondent à la certification blockchain'
        : 'ATTENTION: Les données ont été modifiées depuis la certification',
    };
  }

  /**
   * Get blockchain explorer URL for a transaction
   */
  private getExplorerUrl(txHash: string | null, network: NetworkType): string | null {
    if (!txHash || network === 'local') return null;
    const networkConfig = NETWORKS[network];
    return networkConfig.explorer ? `${networkConfig.explorer}/tx/${txHash}` : null;
  }

  /**
   * Get certification status
   */
  async getCertificationStatus(entityType: string, entityId: string) {
    return prisma.blockchainCertification.findUnique({
      where: {
        entityType_entityId: {
          entityType,
          entityId,
        },
      },
    });
  }

  /**
   * List all certifications
   */
  async listCertifications(options: {
    entityType?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { entityType, limit = 50, offset = 0 } = options;

    return prisma.blockchainCertification.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}

export const blockchainService = new BlockchainService();
