import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

// configure cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export const uploadConfig = {
  folder: 'promotionhub',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  transformation: [
    { width: 1200, height: 900, crop: 'limit' },
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
  ],
};

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || uploadConfig.folder,
      public_id: options.publicId,
      transformation: uploadConfig.transformation,
      resource_type: 'image' as const,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          logger.error({ error }, 'Cloudinary upload failed');
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('No result from Cloudinary'));
          return;
        }

        logger.info({ publicId: result.public_id }, 'Image uploaded to Cloudinary');
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      })
      .end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info({ publicId }, 'Image deleted from Cloudinary');
  } catch (error) {
    logger.error({ error, publicId }, 'Failed to delete image from Cloudinary');
    throw error;
  }
}
