import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadImage, deleteImage, updateImage, extractPublicId, getAllImages } from '../lib/cloudinary.js';
import { validateImageMagicBytes } from '../lib/sanitize.js';
import AutomationLog from '../models/AutomationLog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) { fs.mkdirSync(tempDir, { recursive: true }); }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG'), false);
  }
  cb(null, true);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    // Validate magic bytes to prevent spoofed mimetype attacks
    const isValidImage = await validateImageMagicBytes(req.file.path, req.file.mimetype);
    if (!isValidImage) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: 'Invalid image file — content does not match declared type' });
    }

    const folder = req.body.folder || req.query.folder || 'ironfit-elite';
    const resource = req.body.resource || req.query.resource || 'general';
    const result = await uploadImage(req.file.path, { folder: folder + '/' + resource });
    fs.unlink(req.file.path, () => {});
    res.json({ success: true, publicId: result.public_id, url: result.secure_url, width: result.width, height: result.height, format: result.format });
  } catch(error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const fetchImages = async (req, res) => {
  try {
    const images = await getAllImages();
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images', error: error.message });
  }
};

export const deleteSingleImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) return res.status(400).json({ message: 'Public ID required' });
    const result = await deleteImage(publicId);
    res.json({ success: true, message: 'Image deleted', result });
  } catch(error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

export const deleteImageByUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL required' });
    const publicId = extractPublicId(url);
    if (!publicId) return res.status(400).json({ message: 'Invalid Cloudinary URL' });
    const result = await deleteImage(publicId);
    res.json({ success: true, message: 'Image deleted', publicId, result });
  } catch(error) {
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

export const updateSingleImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    // Validate magic bytes to prevent spoofed mimetype attacks
    const isValidImage = await validateImageMagicBytes(req.file.path, req.file.mimetype);
    if (!isValidImage) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: 'Invalid image file — content does not match declared type' });
    }

    const oldPublicId = req.body.oldPublicId || null;
    const folder = req.body.folder || req.query.folder || 'ironfit-elite';
    const resource = req.body.resource || req.query.resource || 'general';
    const result = await updateImage(req.file.path, oldPublicId, { folder: folder + '/' + resource });
    fs.unlink(req.file.path, () => {});
    res.json({ success: true, publicId: result.public_id, url: result.secure_url });
  } catch(error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
