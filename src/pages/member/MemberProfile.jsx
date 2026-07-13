import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { updateMemberProfile } from '../../api/memberAuth';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const MemberProfile = () => {
  const { user, member, checkAuth } = useMemberAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await updateMemberProfile(formData);
      setMessage('Profile updated successfully');
      checkAuth().catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <div className="mp-page-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="mp-profile-header">
        <div className="mp-profile-avatar-lg">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'M'}
        </div>
        <div className="mp-profile-info">
          <h2>{user?.fullName || 'Member'}</h2>
          <p>{user?.email || ''}</p>
        </div>
      </div>

      <div className="mp-grid-2">
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Personal Details</h3>
            </div>
            <div className="mp-card-body">
              {error && <div className="mp-error-banner" style={{marginBottom:16}}><p>{error}</p></div>}
              {message && <div className="mp-success-banner" style={{marginBottom:16}}><p>{message}</p></div>}
              <form onSubmit={handleSubmit}>
                <div className="mp-input-group">
                  <label className="mp-label">Email</label>
                  <input className="mp-input" type="email" value={user?.email || ''} disabled />
                </div>
                <div className="mp-input-group">
                  <label className="mp-label">Full Name</label>
                  <input className="mp-input" name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Your full name" />
                </div>
                <div className="mp-input-group">
                  <label className="mp-label">Phone</label>
                  <input className="mp-input" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Your phone number" />
                </div>
                <button type="submit" className="mp-btn mp-btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Account Details</h3>
            </div>
            <div className="mp-card-body">
              <div className="mp-detail-row">
                <span className="mp-detail-label">Role</span>
                <span className="mp-detail-value" style={{textTransform:'capitalize'}}>{user?.role || 'Member'}</span>
              </div>
              <div className="mp-detail-row">
                <span className="mp-detail-label">Member Since</span>
                <span className="mp-detail-value">{member?.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="mp-detail-row">
                <span className="mp-detail-label">Status</span>
                <span className={`mp-badge mp-badge-${member?.status === 'active' ? 'success' : 'danger'}`}>{member?.status || 'N/A'}</span>
              </div>
              <div className="mp-detail-row">
                <span className="mp-detail-label">Trainer</span>
                <span className="mp-detail-value">{member?.trainerId?.fullName || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          <div className="mp-card" style={{marginTop:20}}>
            <div className="mp-card-header">
              <h3>Security</h3>
            </div>
            <div className="mp-card-body">
              <p style={{fontSize:13,color:'var(--mp-text-tertiary)',marginBottom:16}}>
                To change your password, please use the forgot password option on the login page.
              </p>
              <Link to="/member/forgot-password" className="mp-btn mp-btn-secondary" style={{textDecoration:'none',display:'inline-flex'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                Reset Password
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MemberProfile;
