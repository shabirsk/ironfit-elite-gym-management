import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  format: {
    type: String,
  },
  folder: {
    type: String,
    default: 'ironfit-elite/general',
  },
}, { timestamps: true });

galleryImageSchema.index({ createdAt: -1 });

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);
export default GalleryImage;
