import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Trash2, CheckCircle, Archive, 
  RefreshCcw, CreditCard, Activity, UserPlus, FileText,
  Mail, Settings, X, Calendar, DollarSign, AlertTriangle, Info, Plus, Circle
} from 'lucide-react';
import { 
  getAllNotificationsAdmin, getAdminNotificationStats, bulkActionNotifications, 
  deleteNotification, createNotification 
} from '../../api/notifications';
import { getMembers } from '../../api/members';
import { useToast } from '../../components/Toast';

const TYPE_CONFIG = {
  'Payment': { icon: DollarSign, color: 'var(--success)', bg: 'var(--status-success-bg)' },
  'Membership': { icon: CreditCard, color: 'var(--warning)', bg: 'var(--status-warning-bg)' },
  'Attendance': { icon: Calendar, color: 'var(--primary)', bg: 'var(--primary-focus)' },
  'Workout': { icon: Activity, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  'Diet Plan': { icon: FileText, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  'Lead': { icon: UserPlus, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  'Contact Form': { icon: Mail, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  'Subscription': { icon: RefreshCcw, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  'Reminder': { icon: Bell, color: 'var(--warning)', bg: 'var(--status-warning-bg)' },
  'Renewal': { icon: RefreshCcw, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  'Welcome Email': { icon: Mail, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
  'System': { icon: Settings, color: 'var(--text-secondary)', bg: 'var(--bg-surface)' },
  'info': { icon: Info, color: 'var(--primary)', bg: 'var(--primary-focus)' },
  'success': { icon: CheckCircle, color: 'var(--success)', bg: 'var(--status-success-bg)' },
  'warning': { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--status-warning-bg)' },
  'error': { icon: AlertTriangle, color: 'var(--danger)', bg: 'var(--status-error-bg)' },
  'alert': { icon: Bell, color: 'var(--danger)', bg: 'var(--status-error-bg)' },
};

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return hours === 1 ? '1h ago' : `${hours}h ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'System',
  userId: '',
  link: '',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, todays: 0, archived: 0, payments: 0, renewals: 0 });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [archivedFilter, setArchivedFilter] = useState('false');
  const [sort, setSort] = useState('newest');

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [pollingKey, setPollingKey] = useState(0);

  const fetchStats = async () => {
    try {
      const data = await getAdminNotificationStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const params = {
        search,
        type: typeFilter,
        status: statusFilter,
        archived: archivedFilter,
        sort
      };
      const notifs = await getAllNotificationsAdmin(params);
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch notifications', 'error');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [search, typeFilter, statusFilter, archivedFilter, sort, addToast]);

  useEffect(() => {
    const init = async () => {
      try {
        const memData = await getMembers({ limit: 1000 });
        setMembers(memData.members || []);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    fetchStats();
    
    const delayDebounceFn = setTimeout(() => {
      fetchNotifications(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchNotifications, pollingKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPollingKey(k => k + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkActionNotifications(selectedIds, action);
      addToast(`Successfully applied action: ${action}`, 'success');
      setSelectedIds([]);
      fetchStats();
      fetchNotifications(false);
    } catch (err) {
      console.error(err);
      addToast('Bulk action failed', 'error');
    }
  };

  const handleSingleDelete = async () => {
    if (!deleteModalId) return;
    try {
      await deleteNotification(deleteModalId);
      addToast('Notification deleted permanently', 'success');
      setDeleteModalId(null);
      if (selectedNotification?._id === deleteModalId) setIsDrawerOpen(false);
      fetchStats();
      fetchNotifications(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete notification', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.userId) {
        const validMembers = members.filter(m => m.userId);
        await Promise.all(
          validMembers.map(m => createNotification({ ...form, userId: m.userId }))
        );
        addToast(`Notification sent to ${validMembers.length} members`, 'success');
      } else {
        await createNotification(form);
        addToast('Notification sent successfully', 'success');
      }
      setIsCreateModalOpen(false);
      setForm(EMPTY_FORM);
      fetchStats();
      fetchNotifications(false);
    } catch (err) {
      console.error(err);
      addToast('Error sending notification', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTargetName = (userId) => {
    if (!userId) return 'Deleted User';
    if (typeof userId === 'object') return userId.fullName || userId.email || 'Deleted User';
    const member = members.find(m => m._id === userId);
    return member ? member.fullName : 'Deleted User';
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openDrawer = (n) => {
    setSelectedNotification(n);
    setIsDrawerOpen(true);
  };

  const Skeletons = () => (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)', opacity: 1 - (i*0.1) }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-base)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '30%', height: '16px', background: 'var(--bg-base)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '80%', height: '14px', background: 'var(--bg-base)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '15%', height: '20px', background: 'var(--bg-base)', borderRadius: '12px' }} />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Notifications Center</h1>
          <p className="text-secondary text-sm">Manage system alerts and send member notifications.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Send Notification
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="saas-card" style={{ padding: '16px' }}><div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total</div><div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</div></div>
        <div className="saas-card" style={{ padding: '16px' }}><div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Unread</div><div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{stats.unread}</div></div>
        <div className="saas-card" style={{ padding: '16px' }}><div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Today's</div><div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{stats.todays}</div></div>
        <div className="saas-card" style={{ padding: '16px' }}><div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Payment Alerts</div><div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{stats.payments}</div></div>
        <div className="saas-card" style={{ padding: '16px' }}><div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Renewals Today</div><div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{stats.renewals}</div></div>
        <div className="saas-card" style={{ padding: '16px' }}><div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Archived</div><div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-tertiary)' }}>{stats.archived}</div></div>
      </div>

      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input type="text" className="saas-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', marginBottom: 0 }} />
        </div>
        <select className="saas-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
          <option value="All">All Types</option>
          {Object.keys(TYPE_CONFIG).filter(t => !['info','success','warning','error','alert'].includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="saas-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <select className="saas-input" value={archivedFilter} onChange={e => setArchivedFilter(e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
          <option value="false">Active Only</option>
          <option value="true">Archived Only</option>
          <option value="all">Active + Archived</option>
        </select>
        <select className="saas-input" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', marginBottom: 0 }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="unread">Unread First</option>
        </select>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--primary-focus)', border: '1px solid var(--primary)', borderRadius: '8px', marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 500, fontSize: '14px' }}>
              <CheckCircle size={16} />
              {selectedIds.length} Selected
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="saas-btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => handleBulkAction('read')}><CheckCircle size={14}/> Mark Read</button>
              <button className="saas-btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => handleBulkAction('unread')}><Circle size={14}/> Mark Unread</button>
              <button className="saas-btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => handleBulkAction('archive')}><Archive size={14}/> Archive</button>
              <button className="saas-btn" style={{ background: 'var(--status-error-bg)', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => handleBulkAction('delete')}><Trash2 size={14}/> Delete</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? <Skeletons /> : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-light)', color: 'var(--text-tertiary)' }}>
            <Bell size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No notifications found</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>You're all caught up. Send a notification or adjust your filters.</p>
          </div>
        ) : (
          notifications.map(n => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG['System'];
            const Icon = config.icon;
            const isSelected = selectedIds.includes(n._id);
            return (
              <motion.div 
                layout
                key={n._id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="saas-card"
                style={{ 
                  padding: '16px', display: 'flex', gap: '16px', cursor: 'pointer', transition: 'all 0.2s',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                  background: isSelected ? 'var(--primary-focus)' : !n.read ? 'var(--bg-surface)' : 'var(--bg-main)'
                }}
                onClick={() => openDrawer(n)}
              >
                <div onClick={(e) => e.stopPropagation()} style={{ paddingTop: '8px' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }} checked={isSelected} onChange={() => toggleSelection(n._id)} />
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: config.bg, color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: !n.read ? 600 : 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: '16px' }} title={new Date(n.createdAt).toLocaleString()}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="saas-badge default">Target: {getTargetName(n.userId)}</span>
                    <span className="saas-badge" style={{ color: config.color, background: config.bg, border: 'none' }}>{n.type}</span>
                    {n.isArchived && <span className="saas-badge default">Archived</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <button className="saas-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', padding: '8px' }} onClick={(e) => { e.stopPropagation(); setDeleteModalId(n._id); }} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedNotification && (
          <>
            <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} />
            <div className="drawer open">
              <div className="drawer-header">
                <h2 className="drawer-title">Notification Details</h2>
                <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}><X size={20}/></button>
              </div>
              <div className="drawer-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Type</span>
                    <span style={{ color: (TYPE_CONFIG[selectedNotification.type] || TYPE_CONFIG['System']).color, fontWeight: 500, fontSize: '13px' }}>
                      {selectedNotification.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Target Member</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px' }}>{getTargetName(selectedNotification.userId)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Status</span>
                    <span style={{ color: selectedNotification.read ? 'var(--text-tertiary)' : 'var(--primary)', fontWeight: 500, fontSize: '13px' }}>{selectedNotification.read ? 'Read' : 'Unread'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Created Time</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px' }}>{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>{selectedNotification.title}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedNotification.message}</p>
                </div>
              </div>
              <div className="drawer-footer">
                <button className="saas-btn" style={{ background: 'var(--status-error-bg)', color: 'var(--danger)', border: 'none' }} onClick={() => setDeleteModalId(selectedNotification._id)}>Delete</button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalId && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setDeleteModalId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="saas-card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Delete Notification?</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                This action cannot be undone. Are you sure you want to permanently delete this notification?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="saas-btn saas-btn-secondary" onClick={() => setDeleteModalId(null)}>Cancel</button>
                <button className="saas-btn" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={handleSingleDelete}>Delete Permanently</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setIsCreateModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="saas-card" style={{ width: '100%', maxWidth: '500px', padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Send Notification</h2>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }} onClick={() => setIsCreateModalOpen(false)}><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                  <div className="form-group">
                    <label className="form-label">Target Member *</label>
                    <select className="saas-input" name="userId" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}>
                      <option value="">All Members (Bulk)</option>
                      {members.filter(m => m.userId).map(m => <option key={m.userId} value={m.userId}>{m.fullName} ({m.email})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="saas-input" name="type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {Object.keys(TYPE_CONFIG).filter(t => !['info','success','warning','error','alert'].includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="saas-input" name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Message *</label>
                    <textarea className="saas-input" rows="4" style={{ resize: 'vertical' }} name="message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
                  </div>
                </div>
                <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                  <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                  <button type="submit" className="saas-btn saas-btn-primary" disabled={saving}>
                    {saving ? 'Sending...' : 'Send Now'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
