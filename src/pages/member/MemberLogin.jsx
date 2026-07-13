import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { memberLogin } from '../../api/memberAuth';
import { motion } from 'framer-motion';
import '../../styles/member/MemberAuth.css';

const MemberLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useMemberAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await memberLogin(email, password);
      login(data.token, data.user);
      navigate('/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="member-auth-page">
      <motion.div className="member-auth-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="member-auth-header">
          <Link to="/" className="member-auth-logo">Iron<span>Fit</span> <small>ELITE</small></Link>
          <h1>Member Login</h1>
          <p>Access your fitness dashboard</p>
        </div>

        {error && <div className="member-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="member-auth-form">
          <div className="member-auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" required />
          </div>
          <div className="member-auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
          </div>
          <div className="member-auth-options">
            <Link to="/member/forgot-password" className="member-auth-link">Forgot Password?</Link>
          </div>
          <button type="submit" className="member-auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="member-auth-footer">
          <p>Don&apos;t have an account? <Link to="/member/register">Register here</Link></p>
          <p className="member-auth-back"><Link to="/">&larr; Back to Home</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberLogin;
