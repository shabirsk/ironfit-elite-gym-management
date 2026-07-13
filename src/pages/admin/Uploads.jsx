import { useState, useEffect } from 'react';
import api from '../../api/axios';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/Toast';
import { Upload, X, Copy, Trash2, File, Image as ImageIcon } from 'lucide-react';

const Uploads = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { addToast } = useToast();

  const fetchImages = async () => {
    try {
      const { data } = await api.get('/uploads/image');
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (publicId) => {
    if (!window.confirm('Are you sure you want to delete this file permanently?')) return;
    try {
      await api.delete(`/uploads/image/${encodeURIComponent(publicId)}`);
      addToast('Image deleted successfully', 'success');
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      addToast('Error deleting image', 'error');
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    addToast('Link copied to clipboard', 'success');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>File Uploads</h1>
          <p className="text-secondary text-sm">Manage assets and media files.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={() => setShowUploadForm(!showUploadForm)}>
          {showUploadForm ? <><X size={16}/> Close</> : <><Upload size={16}/> Upload File</>}
        </button>
      </div>

      {showUploadForm && (
        <div className="saas-card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Upload New File</h2>
          <ImageUploader 
            onImageChange={(url) => {
              if (url) {
                addToast('File uploaded successfully', 'success');
                fetchImages();
                setShowUploadForm(false);
              }
            }} 
            folder="ironfit-elite"
            resource="uploads"
            label="Select image to upload"
          />
        </div>
      )}

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading files...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {images.map(img => (
            <div key={img.public_id} className="saas-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div 
                style={{ height: '160px', background: 'var(--bg-base)', cursor: 'zoom-in', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                onClick={() => setPreviewImage(img.secure_url)}
              >
                <img src={img.secure_url} alt={img.public_id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                     onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                   <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>Preview</div>
                </div>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, background: 'var(--bg-surface)' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={img.public_id}>
                    {img.public_id.split('/').pop()}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>{(img.bytes / 1024).toFixed(1)} KB</span>
                    <span style={{ textTransform: 'uppercase' }}>{img.format}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button className="saas-btn saas-btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '12px' }} onClick={() => handleCopyLink(img.secure_url)}>
                    <Copy size={14}/> Copy URL
                  </button>
                  <button className="saas-btn" style={{ background: 'var(--status-error-bg)', color: 'var(--danger)', padding: '6px 12px', border: '1px solid transparent' }} onClick={() => handleDelete(img.public_id)}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-light)', color: 'var(--text-secondary)' }}>
              <ImageIcon size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
              <p style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No files uploaded</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Upload your first image to get started.</p>
            </div>
          )}
        </div>
      )}

      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }} onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} />
            <button style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '32px', cursor: 'pointer', padding: '8px', lineHeight: 1 }} onClick={() => setPreviewImage(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Uploads;
