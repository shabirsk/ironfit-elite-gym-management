import { useState, useEffect } from 'react';
import { updateProfile } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import ImageUploader from '../../components/ImageUploader';

const AdminProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (url) => {
    setForm(prev => ({ ...prev, profileImage: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      
      const res = await updateProfile(payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existingUser, ...res.user }));
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Admin Profile</h1>
          <p className="text-secondary text-sm">Manage your personal information and credentials.</p>
        </div>
      </div>

      <div className="saas-card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {message.text && (
            <div style={{ 
              padding: '16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
              background: message.type === 'success' ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: '1px solid var(--border-light)'
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{ width: '100%', maxWidth: '200px' }}>
              <ImageUploader 
                currentImage={form.profileImage}
                onImageChange={handleImageChange}
                folder="ironfit-elite"
                resource="profiles"
                label="Profile Picture"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input 
                className="saas-input"
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address *</label>
              <input 
                className="saas-input"
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input 
                className="saas-input"
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input 
                className="saas-input"
                name="password" 
                type="password"
                value={form.password} 
                onChange={handleChange} 
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="saas-btn saas-btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
