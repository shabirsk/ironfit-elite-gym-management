import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Download, Filter, MoreVertical, User, CreditCard, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getMembers, createMember, updateMember, deleteMember } from '../../api/members';
import { getPlans } from '../../api/plans';
import { getTrainers } from '../../api/trainers';
import { downloadExport } from '../../utils/downloadExport';
import RazorpayCheckout from '../../components/payments/RazorpayCheckout';

const EMPTY_FORM = {
  fullName: '', email: '', phone: '', address: '', gender: '',
  planId: '', trainerId: '', profileImage: '', joinDate: '',
};

const Members = () => {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [subscribeMember, setSubscribeMember] = useState(null);
  const [subscribePlanId, setSubscribePlanId] = useState('');
  const [subscribeMsg, setSubscribeMsg] = useState({ type: '', text: '' });
  
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const [membersData, plansData, trainersData] = await Promise.all([
        getMembers(params),
        getPlans({ status: 'active' }),
        getTrainers({ status: 'active' }),
      ]);
      setMembers(membersData.members);
      setPlans(plansData);
      setTrainers(trainersData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  useEffect(() => {
    const handleCommand = (e) => {
      if (e.detail === 'CREATE_MEMBER') openCreate();
    };
    window.addEventListener('COMMAND_ACTION', handleCommand);
    return () => window.removeEventListener('COMMAND_ACTION', handleCommand);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, joinDate: new Date().toISOString().split('T')[0] });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (member) => {
    setForm({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      gender: member.gender || '',
      planId: member.planId?._id || '',
      trainerId: member.trainerId?._id || '',
      profileImage: member.profileImage || '',
      joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : '',
    });
    setEditing(member._id);
    setShowForm(true);
    setActionMenuOpen(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateMember(editing, form);
        addToast('Member updated successfully', 'success');
      } else {
        await createMember(form);
        addToast('Member created successfully', 'success');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to save member', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this member? This action cannot be undone.')) return;
    try {
      await deleteMember(id);
      addToast('Member deleted', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to delete member', 'error');
    }
    setActionMenuOpen(null);
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await downloadExport('members', format);
      addToast(`Exported as ${format.toUpperCase()}`, 'success');
    } catch(e) {
      addToast(e.message || 'Export failed', 'error');
    } finally {
      setExporting(null);
    }
  };

  const filteredMembers = members.filter(m => 
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header Area */}
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Members</h1>
          <p className="text-secondary text-sm">Manage your gym members and their subscriptions.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-surface" style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              className="px-3 py-2 text-xs font-medium text-secondary hover:text-primary transition-colors"
              style={{ borderRight: '1px solid var(--border-light)' }}
              onClick={() => handleExport('pdf')} disabled={exporting}
            >
              {exporting === 'pdf' ? '...' : 'PDF'}
            </button>
            <button 
              className="px-3 py-2 text-xs font-medium text-secondary hover:text-primary transition-colors"
              style={{ borderRight: '1px solid var(--border-light)' }}
              onClick={() => handleExport('excel')} disabled={exporting}
            >
              {exporting === 'excel' ? '...' : 'Excel'}
            </button>
            <button 
              className="px-3 py-2 text-xs font-medium text-secondary hover:text-primary transition-colors"
              onClick={() => handleExport('csv')} disabled={exporting}
            >
              {exporting === 'csv' ? '...' : 'CSV'}
            </button>
          </div>
          <button className="saas-btn saas-btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      {/* Premium Table Container */}
      <div className="saas-table-container">
        {/* Table Toolbar */}
        <div className="saas-table-toolbar">
          <div className="flex gap-4" style={{ flex: 1 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="saas-input" 
                style={{ paddingLeft: '36px', marginBottom: 0 }}
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} color="var(--text-tertiary)" />
              <select 
                className="saas-input" 
                style={{ marginBottom: 0, padding: '8px 12px', width: '160px' }}
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
            {filteredMembers.length} members
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto', minHeight: '400px' }}>
          {loading ? (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1,2,3,4].map(i => <div key={i} className="saas-skeleton" style={{ height: '48px' }} />)}
            </div>
          ) : (
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Contact</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-focus)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 }}>
                          {member.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-primary">{member.fullName}</div>
                          <div className="text-xs text-tertiary">ID: {member._id.substring(member._id.length - 6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-secondary">{member.email}</div>
                      <div className="text-xs text-tertiary">{member.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <div className="text-sm text-secondary">{member.planId?.planName || '—'}</div>
                      <div className="text-xs text-tertiary">{member.trainerId?.fullName ? `Trainer: ${member.trainerId.fullName}` : 'No trainer'}</div>
                    </td>
                    <td>
                      <span className={`saas-badge ${member.status === 'active' ? 'success' : member.status === 'expired' ? 'danger' : 'warning'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="text-sm text-secondary">
                      {new Date(member.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        style={{ padding: '8px', color: 'var(--text-tertiary)', borderRadius: '6px' }}
                        className="hover:bg-card hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === member._id ? null : member._id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      <AnimatePresence>
                        {actionMenuOpen === member._id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: 'absolute', right: '40px', top: '20px', zIndex: 50,
                              background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                              borderRadius: '8px', boxShadow: 'var(--shadow-lg)', width: '160px',
                              padding: '4px', textAlign: 'left'
                            }}
                          >
                            <button className="flex items-center gap-2 w-full text-sm text-secondary transition-colors" style={{ padding: '8px 12px', borderRadius: '4px' }} onClick={() => navigate(`/admin/members/${member._id}`)} onMouseOver={e => e.currentTarget.style.background='var(--bg-card-hover)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                              <User size={14} /> Profile
                            </button>
                            {(!member.planId || member.status !== 'active') && (
                              <button className="flex items-center gap-2 w-full text-sm text-secondary transition-colors" style={{ padding: '8px 12px', borderRadius: '4px' }} onClick={() => {
                                setSubscribeMember(member);
                                setActionMenuOpen(null);
                              }} onMouseOver={e => e.currentTarget.style.background='var(--bg-card-hover)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                                <CreditCard size={14} /> Subscribe
                              </button>
                            )}
                            <button className="flex items-center gap-2 w-full text-sm text-secondary transition-colors" style={{ padding: '8px 12px', borderRadius: '4px' }} onClick={() => openEdit(member)} onMouseOver={e => e.currentTarget.style.background='var(--bg-card-hover)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />
                            <button className="flex items-center gap-2 w-full text-sm text-danger transition-colors" style={{ padding: '8px 12px', borderRadius: '4px' }} onClick={() => handleDelete(member._id)} onMouseOver={e => e.currentTarget.style.background='var(--danger-bg)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                      No members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over Form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
              onClick={() => setShowForm(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '440px',
                background: 'var(--bg-card)', borderLeft: '1px solid var(--border-light)',
                zIndex: 9999, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{editing ? 'Edit Member' : 'New Member'}</h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <form id="member-form" onSubmit={handleSubmit}>
                  <div className="saas-input-group">
                    <label className="saas-label">Full Name *</label>
                    <input className="saas-input" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="John Doe" />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Email *</label>
                    <input className="saas-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Phone</label>
                    <input className="saas-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="saas-input-group">
                      <label className="saas-label">Gender</label>
                      <select className="saas-input" name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="saas-input-group">
                      <label className="saas-label">Join Date</label>
                      <input className="saas-input" type="date" name="joinDate" value={form.joinDate} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Membership Plan</label>
                    <select className="saas-input" name="planId" value={form.planId} onChange={handleChange}>
                      <option value="">No Plan</option>
                      {plans.map((p) => <option key={p._id} value={p._id}>{p.planName} (${p.price})</option>)}
                    </select>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Assigned Trainer</label>
                    <select className="saas-input" name="trainerId" value={form.trainerId} onChange={handleChange}>
                      <option value="">No Trainer</option>
                      {trainers.map((t) => <option key={t._id} value={t._id}>{t.fullName} ({t.specialization})</option>)}
                    </select>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Address</label>
                    <input className="saas-input" name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" />
                  </div>
                </form>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="member-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Member'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Subscribe & Pay Modal */}
      <AnimatePresence>
        {subscribeMember && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSubscribeMember(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-xl)' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-6 text-primary" style={{ fontSize: '20px', marginBottom: '24px' }}>Subscribe {subscribeMember.fullName}</h2>
              {subscribeMsg.text && (
                <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '6px', background: subscribeMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)', color: subscribeMsg.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: '14px' }}>
                  {subscribeMsg.text}
                </div>
              )}
              <div className="saas-input-group mb-8">
                <label className="saas-label">Select Plan</label>
                <select className="saas-input" value={subscribePlanId} onChange={(e) => setSubscribePlanId(e.target.value)}>
                  <option value="">Choose a plan...</option>
                  {plans.filter(p => p.status === 'active').map(p => (
                    <option key={p._id} value={p._id}>{p.planName} — ${p.price} / {p.duration} days</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="saas-btn saas-btn-secondary" onClick={() => setSubscribeMember(null)}>Cancel</button>
                <RazorpayCheckout
                  planId={subscribePlanId}
                  memberId={subscribeMember._id}
                  buttonText="Pay with Razorpay"
                  disabled={!subscribePlanId}
                  onSuccess={(result) => {
                    setSubscribeMsg({ type: 'success', text: `Payment successful! Subscription activated.` });
                    fetchData();
                  }}
                  onError={(err) => setSubscribeMsg({ type: 'error', text: err.message || 'Payment failed' })}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Members;
