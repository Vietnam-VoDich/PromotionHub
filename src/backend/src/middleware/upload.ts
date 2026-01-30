import multer from 'multer';
import type { Request } from 'express';
import { BadRequestError } from '../utils/errors.js';
import { uploadConfig } from '../config/cloudinary.js';

// configure multer to store files in memory (for cloudinary upload)
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = file.originalname.split('.').pop()?.toLowerCase();

  if (!ext || !uploadConfig.allowedFormats.includes(ext)) {
    cb(new BadRequestError(`Format non autorisé. Formats acceptés: ${uploadConfig.allowedFormats.join(', ')}`));
    return;
  }

  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestError('Le fichier doit être une image'));
    return;
  }

  cb(null, true);
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
}).single('photo');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 5,
  },
}).array('photos', 5);
