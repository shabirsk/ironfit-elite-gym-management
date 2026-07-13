import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { getPlans } from '../../api/plans';
import { convertLeadToMember } from '../../api/members';
import { Search, Plus, MoreHorizontal, User, Phone, Mail, Calendar, Trash2, ArrowRight, X } from 'lucide-react';
import { useToast } from '../../components/Toast';

const STATUSES = ['new', 'contacted', 'trial_scheduled', 'converted', 'lost'];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [converting, setConverting] = useState(null);
  const [plans, setPlans] = useState([]);
  const [convertForm, setConvertForm] = useState({ planId: '', gender: '', address: '' });
  const [convertSaving, setConvertSaving] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const filteredLeads = leads.filter(l => 
    l.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone?.includes(searchQuery)
  );

  const fetchLeads = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/leads', { params });
      setLeads(data.leads);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [filter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      addToast('Status updated', 'success');
      fetchLeads();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      addToast('Lead deleted', 'success');
      fetchLeads();
    } catch (err) {
      addToast('Failed to delete lead', 'error');
    }
  };

  const openConvert = async (lead) => {
    try {
      const plansData = await getPlans({ status: 'active' });
      setPlans(plansData);
    } catch {}
    setConverting(lead._id);
    setConvertForm({ planId: '', gender: '', address: '' });
  };

  const handleConvert = async (leadId) => {
    if (!convertForm.planId) {
      addToast('Please select a membership plan', 'error');
      return;
    }
    setConvertSaving(true);
    try {
      await convertLeadToMember(leadId, convertForm);
      addToast('Lead successfully converted to member!', 'success');
      setConverting(null);
      fetchLeads();
      navigate('/admin/members');
    } catch (err) {
      console.error('Convert failed:', err);
      addToast(err.response?.data?.message || 'Failed to convert lead', 'error');
    } finally {
      setConvertSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Leads</h1>
          <p className="text-secondary text-sm">Manage incoming inquiries and prospects.</p>
        </div>
      </div>

      <div className="saas-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              className="saas-input" 
              placeholder="Search leads..." 
              style={{ paddingLeft: '44px', marginBottom: 0 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="saas-input"
            style={{ width: '200px', marginBottom: 0 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading leads...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Prospect</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{lead.fullName}</div>
                      {lead.source && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Source: {lead.source}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Mail size={12}/> {lead.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <Phone size={12}/> {lead.phone || '—'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="saas-input"
                        style={{ 
                          padding: '4px 8px', height: 'auto', fontSize: '12px', width: 'auto', marginBottom: 0,
                          backgroundColor: lead.status === 'converted' ? 'var(--status-success-bg)' : lead.status === 'lost' ? 'var(--status-error-bg)' : lead.status === 'new' ? 'var(--primary-focus)' : 'var(--bg-base)',
                          color: lead.status === 'converted' ? 'var(--success)' : lead.status === 'lost' ? 'var(--danger)' : lead.status === 'new' ? 'var(--primary)' : 'var(--text-secondary)',
                          border: 'none', fontWeight: 600
                        }}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {lead.status !== 'converted' && lead.status !== 'lost' && (
                          <button className="saas-btn saas-btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => openConvert(lead)}>
                            <ArrowRight size={14}/> Convert
                          </button>
                        )}
                        <button className="saas-btn" style={{ background: 'var(--status-error-bg)', color: 'var(--danger)', padding: '6px 12px', border: '1px solid transparent' }} onClick={() => handleDelete(lead._id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No leads found matching your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Convert to Member Side Drawer */}
      <AnimatePresence>
        {converting && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
              onClick={() => setConverting(null)}
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
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Convert to Member</h2>
                <button onClick={() => setConverting(null)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <div className="saas-input-group">
                  <label className="saas-label">Membership Plan *</label>
                  <select
                    className="saas-input"
                    value={convertForm.planId}
                    onChange={(e) => setConvertForm((p) => ({ ...p, planId: e.target.value }))}
                  >
                    <option value="">Select Plan</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>{p.planName} (${p.price})</option>
                    ))}
                  </select>
                </div>

                <div className="saas-input-group">
                  <label className="saas-label">Gender</label>
                  <select
                    className="saas-input"
                    value={convertForm.gender}
                    onChange={(e) => setConvertForm((p) => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="saas-input-group">
                  <label className="saas-label">Address</label>
                  <textarea
                    className="saas-input"
                    rows="3"
                    value={convertForm.address}
                    onChange={(e) => setConvertForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button className="saas-btn saas-btn-secondary" onClick={() => setConverting(null)}>Cancel</button>
                <button className="saas-btn saas-btn-primary" onClick={() => handleConvert(converting)} disabled={convertSaving}>
                  {convertSaving ? 'Converting...' : 'Convert to Member'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leads;
