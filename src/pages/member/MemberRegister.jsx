import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { memberRegister } from '../../api/memberAuth';
import { motion } from 'framer-motion';
import '../../styles/member/MemberAuth.css';

const MemberRegister = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useMemberAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName || !formData.email || !formData.password) { setError('Please fill in all required fields'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const data = await memberRegister({ fullName: formData.fullName, email: formData.email, phone: formData.phone, password: formData.password });
      login(data.token, data.user);
      navigate('/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="member-auth-page">
      <motion.div className="member-auth-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="member-auth-header">
          <Link to="/" className="member-auth-logo">Iron<span>Fit</span> <small>ELITE</small></Link>
          <h1>Create Account</h1>
          <p>Join IronFit Elite today</p>
        </div>
        {error && <div className="member-auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="member-auth-form">
          <div className="member-auth-field">
            <label htmlFor="fullName">Full Name *</label>
            <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Your full name" required />
          </div>
          <div className="member-auth-field">
            <label htmlFor="email">Email *</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" autoComplete="email" required />
          </div>
          <div className="member-auth-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="member-auth-field">
            <label htmlFor="password">Password *</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" autoComplete="new-password" required />
          </div>
          <div className="member-auth-field">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" autoComplete="new-password" required />
          </div>
          <button type="submit" className="member-auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="member-auth-footer">
          <p>Already have an account? <Link to="/member/login">Sign in</Link></p>
          <p className="member-auth-back"><Link to="/">&larr; Back to Home</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberRegister;
