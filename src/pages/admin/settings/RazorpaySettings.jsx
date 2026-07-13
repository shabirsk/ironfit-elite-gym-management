import { useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

const RazorpaySettings = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Razorpay Settings</h1>
          <p className="text-secondary text-sm">Manage payment gateway configuration.</p>
        </div>
      </div>

      <div className="saas-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--status-success-bg)', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
          <span style={{ fontWeight: 500, color: 'var(--success)', fontSize: '14px' }}>Razorpay Integration is Active</span>
        </div>

        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Key ID</label>
            <input type="text" className="saas-input" value="rzp_test_**********" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px', display: 'block' }}>Configured via RAZORPAY_KEY_ID in .env</span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Key Secret</label>
            <input type="password" className="saas-input" value="****************" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px', display: 'block' }}>Configured via RAZORPAY_KEY_SECRET in .env</span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Webhook Secret</label>
            <input type="password" className="saas-input" value="****************" disabled style={{ background: 'var(--bg-main)', cursor: 'not-allowed', color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px', display: 'block' }}>Configured via RAZORPAY_WEBHOOK_SECRET in .env</span>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="saas-btn" style={{ background: 'var(--bg-main)', color: 'var(--text-tertiary)', border: '1px solid var(--border-medium)', cursor: 'not-allowed' }} disabled>
              Settings Managed via ENV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RazorpaySettings;
