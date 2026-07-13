import { Router } from 'express';
import {
  upload, uploadSingleImage, deleteSingleImage,
  deleteImageByUrl, updateSingleImage, fetchImages
} from '../controllers/uploadController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = Router();
router.use(protect);
router.use(authorize('admin'));
router.get('/image', fetchImages);
router.post('/image', upload.single('image'), uploadSingleImage);
router.put('/image', upload.single('image'), updateSingleImage);
router.delete('/image/:publicId', deleteSingleImage);
router.delete('/image', deleteImageByUrl);
export default router;
