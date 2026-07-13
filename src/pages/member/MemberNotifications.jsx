import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../api/notifications';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const typeIcons = {
  success: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  warning: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>,
  error: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
};

const typeClass = { success: 'success', warning: 'warning', error: 'error', info: 'info' };

const MemberNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {}
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const getRelativeTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <>
        <div className="mp-page-header"><h1>Notifications</h1><p>Stay updated with your gym activity</p></div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[1,2,3,4].map(i => <div key={i} className="mp-skeleton-card"><div className="mp-skeleton mp-skeleton-line" style={{width:'60%'}} /><div className="mp-skeleton mp-skeleton-line" /></div>)}
        </div>
      </>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }}>
      <div className="mp-page-header">
        <h1>Notifications</h1>
        <p>Stay updated with your gym activity</p>
      </div>

      {error && <div className="mp-error-banner"><p>{error}</p></div>}

      <div className="mp-card" style={{marginBottom:16}}>
        <div className="mp-card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',gap:4}}>
            {['all','unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`mp-btn mp-btn-sm ${filter === f ? 'mp-btn-primary' : 'mp-btn-secondary'}`}>
                {f === 'all' ? 'All' : `Unread (${unread})`}
              </button>
            ))}
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAllRead} className="mp-btn mp-btn-sm mp-btn-secondary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mp-card">
          <div className="mp-empty">
            <div className="mp-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </div>
            <h3>All clear!</h3>
            <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
          </div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(n => (
            <motion.div key={n._id} variants={fadeUp}>
              <div
                className={`mp-notif-card ${!n.read ? 'unread' : ''}`}
                onClick={() => !n.read && handleMarkRead(n._id)}
              >
                <div className="mp-notif-card-body">
                  <div className={`mp-notif-icon ${typeClass[n.type] || 'info'}`}>
                    {typeIcons[n.type] || typeIcons.info}
                  </div>
                  <div className="mp-notif-content">
                    <div className="mp-notif-title">{n.title}</div>
                    <div className="mp-notif-message">{n.message}</div>
                    <div className="mp-notif-time">{getRelativeTime(n.createdAt)}</div>
                    {n.link && (
                      <Link to={n.link} style={{color:'var(--mp-primary)',fontSize:12,marginTop:4,display:'inline-block'}}>
                        View details →
                      </Link>
                    )}
                  </div>
                  <div className="mp-notif-actions">
                    {!n.read && <span className="mp-notif-dot" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                      className="mp-btn mp-btn-sm"
                      style={{color:'var(--mp-text-tertiary)',padding:'2px 6px',background:'transparent',border:'none'}}
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MemberNotifications;
