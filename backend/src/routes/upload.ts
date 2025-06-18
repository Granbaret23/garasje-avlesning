import { Router } from 'express';
import { upload, uploadImage, getImage } from '../controllers/uploadController';

const router = Router();

// POST /api/upload/image - Upload meter image
router.post('/image', upload.single('image'), uploadImage);

// GET /api/images/:filename - Get uploaded image
router.get('/:filename', getImage);

export default router;