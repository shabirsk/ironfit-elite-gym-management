import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { MessageCircle, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';

const WhatsAppSettings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/whatsapp/status');
      setStatus(res.data);
    } catch (err) {
      console.error(err);
      setStatus({ isConfigured: false, message: 'Failed to fetch status' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>WhatsApp API Settings</h1>
          <p className="text-secondary text-sm">Manage Twilio WhatsApp Business API.</p>
        </div>
      </div>

      <div className="saas-card" style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ padding: '16px', color: 'var(--text-tertiary)', marginBottom: '32px' }}>Checking status...</div>
        ) : (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px', marginBottom: '32px',
            background: status?.isConfigured ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
            border: '1px solid var(--border-light)'
          }}>
            {status?.isConfigured ? <CheckCircle2 size={20} style={{ color: 'var(--success)' }} /> : <XCircle size={20} style={{ color: 'var(--danger)' }} />}
            <span style={{ fontWeight: 500, fontSize: '14px', color: status?.isConfigured ? 'var(--success)' : 'var(--danger)' }}>
              {status?.isConfigured ? 'WhatsApp Integration is Active' : 'WhatsApp Integration is Missing/Inactive'}
            </span>
          </div>
        )}

        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Twilio Account SID</label>
            <input type="text" className="saas-input" value="Configured via TWILIO_ACCOUNT_SID in .env" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Twilio Auth Token</label>
            <input type="password" className="saas-input" value="****************" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Twilio WhatsApp Number</label>
            <input type="text" className="saas-input" value="Configured via TWILIO_WHATSAPP_NUMBER in .env" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
          </div>

          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="saas-btn saas-btn-secondary" onClick={fetchStatus}>
              <RefreshCcw size={16} /> Refresh Status
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

export default WhatsAppSettings;
