import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { env } from '../config/env.js';

// Configuration can fall back to env if needed, but per the prompt we use the exact credentials
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || 'ffjt1wkl',
  api_key: env.CLOUDINARY_API_KEY || '886124727776774',
  api_secret: env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trend-tech/uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

const router = Router();

// Secure all upload routes with authentication and ADMIN role check
router.use(authenticate, authorize('ADMIN'));

router.post('/', upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No image file provided' },
      });
    }
    
    // req.file.path contains the secure Cloudinary URL
    res.status(200).json({
      success: true,
      data: {
        imageUrl: req.file.path,
        cloudinaryId: req.file.filename
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
