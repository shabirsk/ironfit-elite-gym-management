import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      login(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="login-content"
      >
        {/* Logo */}
        <div className="login-header-logo group">
          <span className="logo-iron">IRON</span>
          <span className="logo-fit">FIT</span>
          <span className="logo-admin">Admin</span>
        </div>

        {/* Login Card */}
        <div className="login-glass-card">
          <div className="login-card-highlight"></div>

          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Authenticate to access the command center</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="login-error-box"
            >
              <div className="login-error-dot"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <div className="login-input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className="login-input"
              />
            </div>

            <div className="login-input-group">
              <div className="login-input-icon">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                minLength={6}
                className="login-input"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              <span className="login-btn-content">
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    AUTHORIZE ACCESS
                    <ArrowRight size={18} className="arrow-icon" />
                  </>
                )}
              </span>
              <div className="login-btn-hover-effect"></div>
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <p className="login-footer-text">
          IronFit Elite © {new Date().getFullYear()} <br/> Secured Access Only
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
