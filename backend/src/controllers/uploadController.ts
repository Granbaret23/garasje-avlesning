import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../config/logger';
import { validateImageUpload } from '../utils/validation';

// Configure multer for image upload
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Ingen fil ble lastet opp'
      });
      return;
    }

    const { error, value } = validateImageUpload(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const { meter_id } = value;
    const timestamp = Date.now();
    const filename = `meter_${meter_id}_${timestamp}.jpg`;
    const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

    // Process and compress image
    await sharp(req.file.buffer)
      .jpeg({ quality: 80 })
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toFile(filepath);

    logger.info(`Image uploaded: ${filename} for meter ${meter_id}`);

    res.json({
      success: true,
      data: {
        filename,
        filepath: `/images/${filename}`,
        meter_id,
        size: req.file.size,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    logger.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved opplasting av bilde'
    });
  }
};

export const getImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.status(400).json({
        success: false,
        message: 'Ugyldig filnavn'
      });
      return;
    }

    res.sendFile(path.resolve(filepath), (err) => {
      if (err) {
        logger.error('Error serving image:', err);
        res.status(404).json({
          success: false,
          message: 'Bilde ikke funnet'
        });
      }
    });
  } catch (error) {
    logger.error('Error getting image:', error);
    res.status(500).json({
      success: false,
      message: 'Intern serverfeil ved henting av bilde'
    });
  }
};