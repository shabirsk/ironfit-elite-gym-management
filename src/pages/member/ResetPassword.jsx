import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/memberAuth';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { motion } from 'framer-motion';
import '../../styles/member/MemberAuth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useMemberAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const data = await resetPassword(token, email, password);
      setMessage('Password reset successful!');
      login(data.token, data.user);
      setTimeout(() => navigate('/member/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="member-auth-page">
      <motion.div className="member-auth-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="member-auth-header">
          <Link to="/" className="member-auth-logo">Iron<span>Fit</span> <small>ELITE</small></Link>
          <h1>Reset Password</h1>
          <p>Choose a new password</p>
        </div>
        {error && <div className="member-auth-error">{error}</div>}
        {message && <div className="member-auth-success">{message}</div>}
        {!message ? (
          <form onSubmit={handleSubmit} className="member-auth-form">
            <div className="member-auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" required />
            </div>
            <div className="member-auth-field">
              <label htmlFor="password">New Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" required />
            </div>
            <div className="member-auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" required />
            </div>
            <button type="submit" className="member-auth-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="member-auth-form">
            <p style={{ color: '#4caf50', textAlign: 'center', padding: '20px 0' }}>
              Redirecting to your dashboard...
            </p>
          </div>
        )}
        <div className="member-auth-footer">
          <p><Link to="/member/login">&larr; Back to Login</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
