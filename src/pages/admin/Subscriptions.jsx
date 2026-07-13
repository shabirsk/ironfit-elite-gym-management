import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, RefreshCw, XCircle, Trash2, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getSubscriptions, createSubscription, renewSubscription, cancelSubscription, deleteSubscription } from '../../api/subscriptions';
import { getMembers } from '../../api/members';
import { getPlans } from '../../api/plans';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberId: '', planId: '', startDate: new Date().toISOString().split('T')[0], autoRenew: false });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const [subData, mData, pData] = await Promise.all([
        getSubscriptions(params),
        getMembers(),
        getPlans({ status: 'active' }),
      ]);
      setSubscriptions(subData.subscriptions);
      setMembers(mData.members);
      setPlans(pData);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createSubscription(form);
      addToast('Subscription created successfully', 'success');
      setShowForm(false);
      setForm({ memberId: '', planId: '', startDate: new Date().toISOString().split('T')[0], autoRenew: false });
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to create subscription', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = async (id) => {
    if (!confirm('Renew this subscription?')) return;
    try { 
      await renewSubscription(id); 
      addToast('Subscription renewed successfully', 'success');
      fetchData(); 
    }
    catch (err) { addToast(err.message || 'Failed to renew', 'error'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this subscription? This will mark the member as cancelled.')) return;
    try { 
      await cancelSubscription(id); 
      addToast('Subscription cancelled', 'success');
      fetchData(); 
    }
    catch (err) { addToast(err.message || 'Failed to cancel', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subscription record?')) return;
    try { 
      await deleteSubscription(id); 
      addToast('Subscription record deleted', 'success');
      fetchData(); 
    }
    catch (err) { addToast(err.message || 'Failed to delete', 'error'); }
  };

  const filteredSubs = subscriptions.filter(s => 
    s.memberId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.planId?.planName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Subscriptions</h1>
          <p className="text-secondary text-sm">Manage member subscriptions and renewals.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Subscription
        </button>
      </div>

      <div className="saas-table-container">
        <div className="saas-table-toolbar">
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="saas-input" 
                style={{ paddingLeft: '36px', marginBottom: 0 }}
                placeholder="Search by member or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="var(--text-tertiary)" />
              <select 
                className="saas-input" 
                style={{ marginBottom: 0, padding: '8px 12px' }}
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="text-tertiary text-sm">
            Showing {filteredSubs.length} subscriptions
          </div>
        </div>

        <div style={{ overflowX: 'auto', minHeight: '400px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading subscriptions...</div>
          ) : (
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Auto-Renew</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                          {s.memberId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-primary">{s.memberId?.fullName || 'Unknown Member'}</div>
                          <div className="text-xs text-tertiary">{s.memberId?.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{s.planId?.planName || 'Unknown Plan'}</div>
                      <div className="text-xs text-tertiary">${s.planId?.price || 0}</div>
                    </td>
                    <td>
                      <div className="text-sm text-secondary">{new Date(s.startDate).toLocaleDateString()}</div>
                      <div className="text-xs text-tertiary">to {new Date(s.endDate).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <span className={`saas-badge ${s.status === 'active' ? 'success' : s.status === 'expired' ? 'danger' : 'warning'}`}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`saas-badge ${s.autoRenew ? 'success' : 'default'}`}>
                        {s.autoRenew ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {s.status === 'active' && (
                          <>
                            <button className="p-2 rounded-md text-tertiary hover:text-primary transition-colors" title="Renew" onClick={() => handleRenew(s._id)}>
                              <RefreshCw size={16} />
                            </button>
                            <button className="p-2 rounded-md text-tertiary hover:text-warning transition-colors" title="Cancel" onClick={() => handleCancel(s._id)}>
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button className="p-2 rounded-md text-tertiary hover:text-danger transition-colors" title="Delete Record" onClick={() => handleDelete(s._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
              onClick={() => setShowForm(false)}
            />
            <motion.div 
              initial={{ x: '100%', boxShadow: 'none' }}
              animate={{ x: 0, boxShadow: 'var(--shadow-lg)' }}
              exit={{ x: '100%', boxShadow: 'none' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '440px',
                background: 'var(--bg-card)', borderLeft: '1px solid var(--border-light)',
                zIndex: 9999, display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>New Subscription</h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <form id="subs-form" onSubmit={handleCreate}>
                  <div className="saas-input-group">
                    <label className="saas-label">Member *</label>
                    <select className="saas-input" value={form.memberId} onChange={(e) => setForm(p => ({ ...p, memberId: e.target.value }))} required>
                      <option value="">Select Member</option>
                      {members.map(m => (
                        <option key={m._id} value={m._id}>{m.fullName} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Plan *</label>
                    <select className="saas-input" value={form.planId} onChange={(e) => setForm(p => ({ ...p, planId: e.target.value }))} required>
                      <option value="">Select Plan</option>
                      {plans.map(p => (
                        <option key={p._id} value={p._id}>{p.planName} — ${p.price} / {p.duration}d</option>
                      ))}
                    </select>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Start Date</label>
                    <input className="saas-input" type="date" value={form.startDate} onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="saas-input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                    <input 
                      type="checkbox" 
                      id="autoRenew"
                      checked={form.autoRenew} 
                      onChange={(e) => setForm(p => ({ ...p, autoRenew: e.target.checked }))} 
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="autoRenew" style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>Enable Auto-Renew</label>
                  </div>
                </form>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="subs-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Subscription'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscriptions;
