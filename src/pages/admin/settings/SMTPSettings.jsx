import { useState } from 'react';
import api from '../../../api/axios';
import { Mail, Send } from 'lucide-react';

const SMTPSettings = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestEmail = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await api.post('/admin/test-email');
      setResult({ type: 'success', message: res.data.message });
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Failed to send test email' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>SMTP Settings</h1>
          <p className="text-secondary text-sm">Manage automated email delivery.</p>
        </div>
      </div>

      <div className="saas-card" style={{ padding: '32px' }}>
        {result && (
          <div style={{ 
            padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 500,
            background: result.type === 'success' ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
            color: result.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: '1px solid var(--border-light)'
          }}>
            {result.message}
          </div>
        )}

        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">SMTP Host</label>
            <input type="text" className="saas-input" value="smtp.hostinger.com (ENV: SMTP_HOST)" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">SMTP Port</label>
            <input type="text" className="saas-input" value="465 (ENV: SMTP_PORT)" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">SMTP User / Email</label>
            <input type="text" className="saas-input" value="Configured via SMTP_USER in .env" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
          </div>

          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              className="saas-btn saas-btn-primary" 
              onClick={handleTestEmail}
              disabled={testing}
            >
              <Send size={16} /> {testing ? 'Sending Test...' : 'Send Test Email'}
            </button>
            <button type="button" className="saas-btn" style={{ background: 'var(--bg-main)', color: 'var(--text-tertiary)', border: '1px solid var(--border-medium)', cursor: 'not-allowed' }} disabled>
              Settings Managed via ENV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SMTPSettings;
