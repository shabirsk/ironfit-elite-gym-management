import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/memberAuth';
import { motion } from 'framer-motion';
import '../../styles/member/MemberAuth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSent(true);
      setMessage(data.message || 'If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="member-auth-page">
      <motion.div className="member-auth-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="member-auth-header">
          <Link to="/" className="member-auth-logo">Iron<span>Fit</span> <small>ELITE</small></Link>
          <h1>Forgot Password</h1>
          <p>We'll send you a reset link</p>
        </div>
        {error && <div className="member-auth-error">{error}</div>}
        {message && <div className="member-auth-success">{message}</div>}
        {!sent ? (
          <form onSubmit={handleSubmit} className="member-auth-form">
            <div className="member-auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" required />
            </div>
            <button type="submit" className="member-auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="member-auth-form">
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>Check your email inbox for the reset link. It expires in 1 hour.</p>
          </div>
        )}
        <div className="member-auth-footer">
          <p><Link to="/member/login">&larr; Back to Login</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
