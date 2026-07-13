import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, CreditCard, List, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getPayments, recordPayment, getRazorpayOrders } from '../../api/payments';
import { getMembers } from '../../api/members';
import { getSubscriptions } from '../../api/subscriptions';
import { getPlans } from '../../api/plans';
import RazorpayCheckout from '../../components/payments/RazorpayCheckout';

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'online', 'other'];
const PAYMENT_STATUSES = ['completed', 'pending', 'failed', 'refunded'];

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showOnlineForm, setShowOnlineForm] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState(false);
  const [razorpayOrders, setRazorpayOrders] = useState([]);
  const [onlineForm, setOnlineForm] = useState({ memberId: '', planId: '' });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    memberId: '', subscriptionId: '', amount: '', paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0], transactionId: '', status: 'completed', notes: '',
  });
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [payData, mData] = await Promise.all([getPayments(), getMembers()]);
      setPayments(payData.payments);
      setMembers(mData.members);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRazorpayOrders = async () => {
    try {
      const data = await getRazorpayOrders();
      setRazorpayOrders(data.payments);
    } catch (err) {
      console.error('Failed to fetch Razorpay orders:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const loadSubscriptions = async (memberId) => {
    if (!memberId) { setSubscriptions([]); return; }
    try {
      const data = await getSubscriptions({ memberId, status: 'active' });
      setSubscriptions(data.subscriptions);
    } catch { setSubscriptions([]); }
  };

  const handleMemberChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, memberId: val, subscriptionId: '' }));
    loadSubscriptions(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recordPayment({ ...form, amount: Number(form.amount) });
      addToast('Payment recorded successfully', 'success');
      setShowForm(false);
      setForm({ memberId: '', subscriptionId: '', amount: '', paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], transactionId: '', status: 'completed', notes: '' });
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to record payment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.memberId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter ? p.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Payments</h1>
          <p className="text-secondary text-sm">Manage transactions and online payments.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="saas-btn saas-btn-secondary" 
            onClick={async () => {
              setRazorpayTab(!razorpayTab);
              if (!razorpayTab) await fetchRazorpayOrders();
            }}
          >
            <List size={16} /> Online Orders
          </button>
          <button 
            className="saas-btn" 
            style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}
            onClick={async () => {
              setShowOnlineForm(true);
              setShowForm(false);
              setOnlineForm({ memberId: '', planId: '' });
              try {
                const pData = await getPlans({ status: 'active' });
                setPlans(pData);
              } catch {}
            }}
          >
            <CreditCard size={16} /> Pay Online
          </button>
          <button 
            className="saas-btn saas-btn-primary" 
            onClick={() => { setShowForm(true); setShowOnlineForm(false); }}
          >
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {razorpayTab ? (
        <div className="saas-table-container">
          <div className="saas-table-toolbar">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Razorpay Orders</h3>
            <button className="saas-btn saas-btn-secondary" onClick={() => setRazorpayTab(false)}>
              <X size={14} /> Close
            </button>
          </div>
          <div style={{ overflowX: 'auto', minHeight: '400px' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {razorpayOrders.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="font-medium text-primary">{p.memberId?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-tertiary">{p.memberId?.email || '—'}</div>
                    </td>
                    <td className="font-medium text-primary">${p.amount?.toFixed(2)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{p.razorpayOrderId || p.transactionId || '-'}</td>
                    <td className="text-sm text-secondary">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`saas-badge ${p.status === 'completed' || p.status === 'success' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {razorpayOrders.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No online payment orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="saas-table-container">
          <div className="saas-table-toolbar">
            <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  className="saas-input" 
                  style={{ paddingLeft: '36px', marginBottom: 0 }}
                  placeholder="Search by member or transaction..."
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
            <div className="text-tertiary text-sm">
              {filteredPayments.length} transactions
            </div>
          </div>

          <div style={{ overflowX: 'auto', minHeight: '400px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading payments...</div>
            ) : (
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="flex items-center gap-4">
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                            {p.memberId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="font-medium text-primary">{p.memberId?.fullName || 'Unknown Member'}</div>
                        </div>
                      </td>
                      <td className="font-medium text-primary">${p.amount?.toFixed(2)}</td>
                      <td>
                        <span className="saas-badge default">
                          {p.paymentMethod?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="text-sm text-secondary">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`saas-badge ${p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : p.status === 'refunded' ? 'default' : 'warning'}`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-tertiary)' }}>{p.transactionId || '—'}</td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Online Payment Modal */}
      <AnimatePresence>
        {showOnlineForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setShowOnlineForm(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-medium)' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', margin: 0 }}>
                    <CreditCard size={20} /> Pay Online via Razorpay
                  </h2>
                </div>
                
                <div style={{ padding: '24px' }}>
                  <div className="saas-input-group">
                    <label className="saas-label">Member *</label>
                    <select className="saas-input" value={onlineForm.memberId} onChange={(e) => setOnlineForm(p => ({ ...p, memberId: e.target.value }))}>
                      <option value="">Select Member</option>
                      {members.map(m => (<option key={m._id} value={m._id}>{m.fullName} — {m.email}</option>))}
                    </select>
                  </div>
                  <div className="saas-input-group" style={{ marginBottom: '32px' }}>
                    <label className="saas-label">Plan *</label>
                    <select className="saas-input" value={onlineForm.planId} onChange={(e) => setOnlineForm(p => ({ ...p, planId: e.target.value }))}>
                      <option value="">Select Plan</option>
                      {plans.map(p => (<option key={p._id} value={p._id}>{p.planName} — ${p.price} / {p.duration}d</option>))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="saas-btn saas-btn-secondary" onClick={() => setShowOnlineForm(false)}>Cancel</button>
                    <div style={{ '& button': { padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500 } }}>
                      <RazorpayCheckout
                        planId={onlineForm.planId}
                        memberId={onlineForm.memberId}
                        buttonText="Open Checkout"
                        disabled={!onlineForm.memberId || !onlineForm.planId}
                        onSuccess={(result) => {
                          addToast(`Payment successful! Subscription activated.`, 'success');
                          setShowOnlineForm(false);
                          fetchData();
                        }}
                        onError={(err) => {
                          addToast(err.message || 'Payment failed', 'error');
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manual Payment Slide-over */}
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
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Record Manual Payment</h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <form id="payment-form" onSubmit={handleSubmit}>
                  <div className="saas-input-group">
                    <label className="saas-label">Member *</label>
                    <select className="saas-input" value={form.memberId} onChange={handleMemberChange} required>
                      <option value="">Select Member</option>
                      {members.map(m => (<option key={m._id} value={m._id}>{m.fullName}</option>))}
                    </select>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Subscription (optional)</label>
                    <select className="saas-input" value={form.subscriptionId} onChange={(e) => setForm(p => ({ ...p, subscriptionId: e.target.value }))}>
                      <option value="">No Subscription</option>
                      {subscriptions.map(s => (<option key={s._id} value={s._id}>{s.planId?.planName || 'Plan'} - ${s.planId?.price || 0}</option>))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="saas-input-group">
                      <label className="saas-label">Amount ($) *</label>
                      <input className="saas-input" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} required />
                    </div>
                    <div className="saas-input-group">
                      <label className="saas-label">Date</label>
                      <input className="saas-input" type="date" value={form.paymentDate} onChange={(e) => setForm(p => ({ ...p, paymentDate: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="saas-input-group">
                      <label className="saas-label">Method</label>
                      <select className="saas-input" value={form.paymentMethod} onChange={(e) => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                        {PAYMENT_METHODS.map(m => (<option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>))}
                      </select>
                    </div>
                    <div className="saas-input-group">
                      <label className="saas-label">Status</label>
                      <select className="saas-input" value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}>
                        {PAYMENT_STATUSES.map(s => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Transaction ID</label>
                    <input className="saas-input" value={form.transactionId} onChange={(e) => setForm(p => ({ ...p, transactionId: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Notes</label>
                    <textarea className="saas-input" style={{ resize: 'vertical' }} rows="2" value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </form>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="payment-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payments;
