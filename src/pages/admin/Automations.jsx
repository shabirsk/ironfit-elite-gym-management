import { useState, useEffect } from 'react';
import api from '../../api/axios';

const CATEGORIES = ['all', 'membership', 'lead', 'attendance', 'payment', 'revenue', 'system'];
const CATEGORY_LABELS = {
  all: 'All Categories',
  membership: 'Membership',
  lead: 'Leads',
  attendance: 'Attendance',
  payment: 'Payment',
  revenue: 'Revenue',
  system: 'System'
};
const STATUS_COLORS = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--danger)'
};

const Automations = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = category !== 'all' ? '?category=' + category : '';
      const res = await api.get('/admin/automations' + params);
      setLogs(res.data.logs);
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [category]);

  const getSummaryCount = (cat, status) => {
    const item = summary.find(s => s._id.category === cat && s._id.status === status);
    return item ? item.count : 0;
  };

  const refresh = () => { fetchLogs(); };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Automation Logs</h1>
          <p className="text-secondary text-sm">Monitor all 24 automated background processes.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {CATEGORIES.filter(c => c !== 'all').map(cat => {
          const s = getSummaryCount(cat, 'success');
          const w = getSummaryCount(cat, 'warning');
          const e = getSummaryCount(cat, 'error');
          const total = s + w + e;
          return (
            <div key={cat} onClick={() => setCategory(cat)}
              className="saas-card"
              style={{
                background: category === cat ? 'var(--primary-focus)' : 'var(--bg-main)',
                border: '1px solid ' + (category === cat ? 'var(--primary)' : 'var(--border-light)'),
                padding: '20px', cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                {CATEGORY_LABELS[cat]}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 500 }}>
                <span style={{ color: STATUS_COLORS.success }}>{s} OK</span>
                {w > 0 && <span style={{ color: STATUS_COLORS.warning }}>{w} WARN</span>}
                {e > 0 && <span style={{ color: STATUS_COLORS.error }}>{e} ERR</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`saas-btn ${category === cat ? 'saas-btn-primary' : 'saas-btn-secondary'}`}
            style={{
              padding: '6px 16px', fontSize: '13px',
              border: category === cat ? 'none' : '1px solid var(--border-medium)',
              background: category === cat ? 'var(--primary)' : 'var(--bg-surface)',
              color: category === cat ? '#fff' : 'var(--text-secondary)'
            }}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div style={{ background: 'var(--status-error-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: 'var(--danger)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Failed to load automation logs. 
          <button className="saas-btn" onClick={refresh} style={{ padding: '4px 12px', background: 'var(--danger)', color: '#fff', border: 'none', fontSize: '12px' }}>Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-tertiary)' }}>Loading automation logs...</div>
      )}

      {/* Logs Table */}
      {!loading && !error && (
        <div className="saas-card" style={{ padding: 0, overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>No automation logs found.</div>
              <div style={{ fontSize: '14px' }}>Automations run on scheduled intervals. Check back after their next scheduled run.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Category</th>
                    <th>Automation</th>
                    <th>Status</th>
                    <th>Summary</th>
                    <th style={{ textAlign: 'right' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id}>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(log.triggeredAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="saas-badge" style={{ background: 'var(--primary-focus)', color: 'var(--primary)', border: 'none' }}>
                          {CATEGORY_LABELS[log.category]}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{log.automation}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[log.status] }} />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: STATUS_COLORS[log.status], textTransform: 'capitalize' }}>{log.status}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.summary}>{log.summary}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>
                        {log.duration > 1000 ? (log.duration/1000).toFixed(1) + 's' : log.duration + 'ms'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Automations;
