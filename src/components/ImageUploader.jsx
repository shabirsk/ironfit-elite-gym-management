import { useState, useRef } from 'react';
import api from '../api/axios';
import { useToast } from './Toast';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024;

const ImageUploader = ({ currentImage, onImageChange, folder = 'ironfit-elite', resource = 'general', label = 'Image' }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const { addToast } = useToast();

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      const msg = 'Invalid format. Use JPEG, PNG, GIF, WebP, or SVG.';
      setError(msg);
      addToast(msg, 'error');
      return false;
    }
    if (file.size > MAX_SIZE) {
      const msg = 'File too large. Maximum size is 5MB.';
      setError(msg);
      addToast(msg, 'error');
      return false;
    }
    return true;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!validateFile(file)) { e.target.value = ''; return; }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);
      formData.append('resource', resource);

      const isReplace = currentImage && currentImage.includes('cloudinary');
      let data;

      if (isReplace) {
        // Extract public ID from Cloudinary URL robustly
        // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/resource/filename.ext
        let oldPublicId = null;
        const parts = currentImage.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
          const publicIdParts = parts.slice(uploadIndex + 2);
          oldPublicId = publicIdParts.join('/').replace(/\.[^.]+$/, '');
        }
        if (oldPublicId) {
          formData.append('oldPublicId', oldPublicId);
        }
        const res = await api.put('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        data = res.data;
      } else {
        const res = await api.post('/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        data = res.data;
      }

      if (data.success) {
        setPreview(data.url);
        onImageChange(data.url);
        addToast('Image uploaded successfully', 'success');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      setError(msg);
      addToast(msg, 'error');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!currentImage) return;
    setUploading(true);
    setError(null);
    try {
      if (currentImage.includes('cloudinary')) {
        await api.delete('/uploads/image', { data: { url: currentImage } });
      }
      setPreview(null);
      onImageChange('');
      addToast('Image removed', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="image-uploader">
      {label && <label className="image-uploader__label">{label}</label>}
      {error && <div className="image-uploader__error">{error}</div>}
      <div className="image-uploader__area" onClick={handleClick}>
        {uploading ? (
          <div className="image-uploader__uploading">
            <div className="image-uploader__spinner" />
            <span>Uploading...</span>
          </div>
        ) : preview ? (
          <div className="image-uploader__preview-wrap">
            <img src={preview} alt="Preview" className="image-uploader__preview" onError={() => setPreview(null)} />
            <div className="image-uploader__overlay"><span>Click to change</span></div>
          </div>
        ) : (
          <div className="image-uploader__placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            <span>Click to upload</span>
            <span className="image-uploader__hint">JPEG, PNG, GIF, WebP, SVG (max 5MB)</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} onChange={handleFileSelect} style={{ display: 'none' }} />
      {preview && !uploading && (
        <div className="image-uploader__actions">
          <button type="button" className="image-uploader__replace-btn" onClick={handleClick}>Replace</button>
          <button type="button" className="image-uploader__remove-btn" onClick={handleDelete}>Remove</button>
        </div>
      )}

      <style>{`
        .image-uploader { margin-bottom: 16px; }
        .image-uploader__label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .image-uploader__error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.75rem; color: #ef4444; }
        .image-uploader__area { border: 2px dashed #333; border-radius: 10px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s ease; background: #0d0d0d; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        .image-uploader__area:hover { border-color: #ff6200; background: #111; }
        .image-uploader__placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #666; }
        .image-uploader__placeholder span { font-size: 0.85rem; }
        .image-uploader__hint { font-size: 0.7rem !important; color: #555; }
        .image-uploader__preview-wrap { position: relative; width: 100%; max-width: 200px; margin: 0 auto; }
        .image-uploader__preview { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; }
        .image-uploader__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; border-radius: 8px; }
        .image-uploader__preview-wrap:hover .image-uploader__overlay { opacity: 1; }
        .image-uploader__overlay span { color: #fff; font-size: 0.8rem; }
        .image-uploader__uploading { display: flex; align-items: center; gap: 10px; color: #888; font-size: 0.85rem; }
        .image-uploader__spinner { width: 20px; height: 20px; border: 2px solid #333; border-top-color: #ff6200; border-radius: 50%; animation: image-uploader-spin 0.8s linear infinite; }
        @keyframes image-uploader-spin { to { transform: rotate(360deg); } }
        .image-uploader__actions { display: flex; gap: 8px; margin-top: 8px; justify-content: center; }
        .image-uploader__replace-btn, .image-uploader__remove-btn { padding: 6px 14px; border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .image-uploader__replace-btn { background: rgba(255,98,0,0.15); color: #ff6200; }
        .image-uploader__replace-btn:hover { background: rgba(255,98,0,0.25); }
        .image-uploader__remove-btn { background: rgba(239,68,68,0.15); color: #ef4444; }
        .image-uploader__remove-btn:hover { background: rgba(239,68,68,0.25); }
      `}</style>
    </div>
  );
};

export default ImageUploader;
