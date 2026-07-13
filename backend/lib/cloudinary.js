import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export const uploadImage = async (filePath, options = {}) => {
  const defaultOptions = {
    folder: 'ironfit-elite',
    use_filename: true,
    unique_filename: true,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' },
      { flags: 'lossy' },
    ],
  };
  const uploadOptions = { ...defaultOptions, ...options };
  const result = await cloudinary.uploader.upload(filePath, uploadOptions);
  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
};

export const deleteImage = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

export const getAllImages = async (folder = 'ironfit-elite') => {
  const result = await cloudinary.search
    .expression(`folder:${folder}/*`)
    .sort_by('created_at', 'desc')
    .max_results(500)
    .execute();
  return result.resources;
};

export const updateImage = async (newFilePath, oldPublicId = null, options = {}) => {
  if (oldPublicId) {
    await deleteImage(oldPublicId).catch(() => {});
  }
  return uploadImage(newFilePath, options);
};

export const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(p => p === 'upload');
  if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;
  const publicIdParts = parts.slice(uploadIndex + 2);
  return publicIdParts.join('/').replace(/\.[^.]+$/, '') || null;
};

export default {
  uploadImage, deleteImage, updateImage, extractPublicId,
};
