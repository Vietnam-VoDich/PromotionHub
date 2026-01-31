import sharp from 'sharp';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

interface ImageAnalysisResult {
  isValid: boolean;
  quality: 'low' | 'medium' | 'high';
  issues: string[];
  duplicateOf: string | null;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    hash: string;
  };
}

interface QualityThresholds {
  minWidth: number;
  minHeight: number;
  minSize: number;
  maxSize: number;
}

const DEFAULT_THRESHOLDS: QualityThresholds = {
  minWidth: 800,
  minHeight: 600,
  minSize: 50 * 1024, // 50KB
  maxSize: 10 * 1024 * 1024, // 10MB
};

export class ImageAnalysisService {
  /**
   * Analyze an image buffer for quality and duplicates
   */
  async analyzeImage(
    buffer: Buffer,
    listingId?: string,
    thresholds: QualityThresholds = DEFAULT_THRESHOLDS
  ): Promise<ImageAnalysisResult> {
    const issues: string[] = [];
    let quality: 'low' | 'medium' | 'high' = 'high';

    try {
      // Get image metadata
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height || !metadata.format) {
        return {
          isValid: false,
          quality: 'low',
          issues: ['Format d\'image non reconnu'],
          duplicateOf: null,
          metadata: {
            width: 0,
            height: 0,
            format: 'unknown',
            size: buffer.length,
            hash: '',
          },
        };
      }

      // Calculate perceptual hash for duplicate detection
      const hash = await this.calculateImageHash(buffer);

      // Check dimensions
      if (metadata.width < thresholds.minWidth || metadata.height < thresholds.minHeight) {
        issues.push(`Résolution trop basse (minimum ${thresholds.minWidth}x${thresholds.minHeight})`);
        quality = 'low';
      } else if (metadata.width < 1200 || metadata.height < 900) {
        quality = 'medium';
      }

      // Check file size
      if (buffer.length < thresholds.minSize) {
        issues.push('Image trop compressée, qualité insuffisante');
        quality = 'low';
      }

      if (buffer.length > thresholds.maxSize) {
        issues.push('Image trop volumineuse (max 10MB)');
      }

      // Check for blur using Laplacian variance
      const blurScore = await this.detectBlur(buffer);
      if (blurScore < 100) {
        issues.push('Image floue détectée');
        quality = quality === 'high' ? 'medium' : 'low';
      }

      // Check for duplicates
      let duplicateOf: string | null = null;
      if (listingId) {
        duplicateOf = await this.findDuplicate(hash, listingId);
        if (duplicateOf) {
          issues.push('Image en double détectée');
        }
      }

      return {
        isValid: issues.filter((i) => i.includes('trop basse') || i.includes('non reconnu')).length === 0,
        quality,
        issues,
        duplicateOf,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: buffer.length,
          hash,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Error analyzing image');
      return {
        isValid: false,
        quality: 'low',
        issues: ['Erreur lors de l\'analyse de l\'image'],
        duplicateOf: null,
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown',
          size: buffer.length,
          hash: '',
        },
      };
    }
  }

  /**
   * Calculate a perceptual hash for duplicate detection
   */
  private async calculateImageHash(buffer: Buffer): Promise<string> {
    try {
      // Resize to 8x8 grayscale for perceptual hash
      const resized = await sharp(buffer)
        .resize(8, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer();

      // Calculate average
      const avg = resized.reduce((sum, val) => sum + val, 0) / resized.length;

      // Generate hash based on comparison to average
      let hash = '';
      for (const pixel of resized) {
        hash += pixel > avg ? '1' : '0';
      }

      // Convert binary to hex
      return BigInt('0b' + hash).toString(16).padStart(16, '0');
    } catch {
      // Fallback to MD5 hash
      return crypto.createHash('md5').update(buffer).digest('hex');
    }
  }

  /**
   * Detect blur using Laplacian variance
   */
  private async detectBlur(buffer: Buffer): Promise<number> {
    try {
      // Convert to grayscale and apply Laplacian-like edge detection
      const processed = await sharp(buffer)
        .grayscale()
        .convolve({
          width: 3,
          height: 3,
          kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
        })
        .raw()
        .toBuffer();

      // Calculate variance
      const mean = processed.reduce((sum, val) => sum + val, 0) / processed.length;
      const variance =
        processed.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / processed.length;

      return variance;
    } catch {
      return 1000; // Assume not blurry if we can't detect
    }
  }

  /**
   * Find duplicate image in the database
   */
  private async findDuplicate(_hash: string, _excludeListingId?: string): Promise<string | null> {
    // This would require storing hashes in the database
    // For now, we'll skip this check
    // In production, you'd add a 'hash' column to ListingPhoto
    return null;
  }

  /**
   * Batch analyze multiple images
   */
  async analyzeMultipleImages(
    images: Array<{ buffer: Buffer; filename: string }>,
    listingId?: string
  ): Promise<Array<{ filename: string; result: ImageAnalysisResult }>> {
    const results: Array<{ filename: string; result: ImageAnalysisResult }> = [];
    const seenHashes = new Set<string>();

    for (const { buffer, filename } of images) {
      const result = await this.analyzeImage(buffer, listingId);

      // Check for duplicates within the batch
      if (seenHashes.has(result.metadata.hash)) {
        result.issues.push('Doublon dans le lot d\'images');
        result.duplicateOf = 'batch';
      } else {
        seenHashes.add(result.metadata.hash);
      }

      results.push({ filename, result });
    }

    return results;
  }

  /**
   * Get quality recommendations
   */
  getQualityRecommendations(result: ImageAnalysisResult): string[] {
    const recommendations: string[] = [];

    if (result.metadata.width < 1200) {
      recommendations.push('Utilisez une image d\'au moins 1200 pixels de large pour une meilleure qualité');
    }

    if (result.issues.some((i) => i.includes('floue'))) {
      recommendations.push('Prenez la photo avec un bon éclairage et en stabilisant l\'appareil');
    }

    if (result.issues.some((i) => i.includes('compressée'))) {
      recommendations.push('Évitez de trop compresser l\'image avant de la télécharger');
    }

    if (result.quality === 'high') {
      recommendations.push('Excellente qualité d\'image !');
    }

    return recommendations;
  }
}

export const imageAnalysisService = new ImageAnalysisService();
