import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { getMemberDashboard } from '../../api/memberPortal';
import { motion } from 'framer-motion';

const SkeletonDashboard = () => (
  <div className="mp-grid">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className="mp-skeleton-card">
        <div className="mp-skeleton mp-skeleton-line" style={{width:'40%'}} />
        <div className="mp-skeleton mp-skeleton-circle" />
        <div className="mp-skeleton mp-skeleton-line" />
        <div className="mp-skeleton mp-skeleton-line" />
      </div>
    ))}
  </div>
);

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const MemberDashboard = () => {
  const { user } = useMemberAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getMemberDashboard();
        setDashboard(data);
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getDaysColor = (days) => {
    if (days <= 7) return 'var(--mp-danger)';
    if (days <= 14) return 'var(--mp-warning)';
    return 'var(--mp-success)';
  };

  const subscription = dashboard?.subscription;
  const attendance = dashboard?.attendance;
  const workouts = dashboard?.workouts || [];
  const dietPlans = dashboard?.dietPlans || [];
  const recentPayments = dashboard?.recentPayments || [];

  const attendancePct = attendance?.percentage || 0;
  const daysRemaining = subscription?.daysRemaining || 0;
  const daysInMonth = attendance?.daysInMonth || 30;

  const todayWorkout = useMemo(() => workouts.find(w => w.progress !== 'completed') || workouts[0], [workouts]);

  if (loading) {
    return (
      <>
        <div className="mp-page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.fullName?.split(' ')[0] || 'Member'}</p>
        </div>
        <SkeletonDashboard />
      </>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <div className="mp-page-header">
        <h1>Welcome back, {user?.fullName?.split(' ')[0] || 'Member'}</h1>
        <p>Here's your fitness overview</p>
      </div>

      {error && (
        <div className="mp-error-banner">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <motion.div variants={fadeUp} className="mp-grid-4" style={{marginBottom: 24}}>
        <div className="mp-card" style={{borderLeft: '3px solid var(--mp-primary)'}}>
          <div className="mp-card-body">
            <div className="mp-stat">
              <span className="mp-stat-label">Membership</span>
              <span className="mp-stat-value small">{subscription?.planName || 'No Plan'}</span>
              {subscription && (
                <div className="mp-progress" style={{marginTop: 8}}>
                  <div className="mp-progress-fill primary" style={{width: `${Math.min(100, (daysRemaining / 365) * 100)}%`}} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mp-card" style={{borderLeft: '3px solid var(--mp-success)'}}>
          <div className="mp-card-body">
            <div className="mp-stat">
              <span className="mp-stat-label">Attendance</span>
              <span className="mp-stat-value">{attendancePct}%</span>
              <span className="mp-stat-label">{attendance?.totalThisMonth || 0} / {daysInMonth} days this month</span>
            </div>
          </div>
        </div>
        <div className="mp-card" style={{borderLeft: '3px solid var(--mp-iron)'}}>
          <div className="mp-card-body">
            <div className="mp-stat">
              <span className="mp-stat-label">Days Remaining</span>
              <span className="mp-stat-value" style={{color: getDaysColor(daysRemaining)}}>{daysRemaining}</span>
              <span className="mp-stat-label">{subscription?.autoRenew ? 'Auto-renew' : 'Manual renewal'}</span>
            </div>
          </div>
        </div>
        <div className="mp-card" style={{borderLeft: '3px solid var(--mp-warning)'}}>
          <div className="mp-card-body">
            <div className="mp-stat">
              <span className="mp-stat-label">Workouts</span>
              <span className="mp-stat-value small">{workouts.length}</span>
              <span className="mp-stat-label">Assigned programs</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mp-grid-2" style={{marginBottom: 24}}>
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Membership</h3>
              {subscription && <span className={`mp-badge mp-badge-${subscription.status === 'active' ? 'success' : 'danger'}`}>{subscription.status}</span>}
            </div>
            <div className="mp-card-body">
              {subscription ? (
                <>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                    <div>
                      <div style={{fontSize:20, fontWeight:700}}>{subscription.planName}</div>
                      <div style={{fontSize:14, color:'var(--mp-text-tertiary)', marginTop:2}}>
                        {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{fontSize:24, fontWeight:800, color: 'var(--mp-iron)'}}>
                      &#x20B9;{subscription.price?.toLocaleString()}
                    </div>
                  </div>
                  <div className="mp-progress" style={{marginBottom:8}}>
                    <div className="mp-progress-fill" style={{width:`${Math.min(100, (daysRemaining / 365) * 100)}%`, background: getDaysColor(daysRemaining)}} />
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--mp-text-tertiary)'}}>
                    <span>{daysRemaining} days remaining</span>
                    <span>{subscription.autoRenew ? 'Auto-renew' : 'Manual renewal'}</span>
                  </div>
                </>
              ) : (
                <div className="mp-empty" style={{padding:0}}>
                  <p>No active subscription</p>
                  <Link to="/member/plans" className="mp-btn mp-btn-primary" style={{marginTop:12}}>View Plans</Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Your Trainer</h3>
            </div>
            <div className="mp-card-body">
              {dashboard?.member?.trainerId ? (
                <div style={{display:'flex', alignItems:'center', gap:16}}>
                  <div style={{width:56, height:56, borderRadius:16, background:'linear-gradient(135deg, var(--mp-primary), var(--mp-primary-hover))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'#fff'}}>
                    {dashboard.member.trainerId.fullName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <div style={{fontSize:16, fontWeight:600}}>{dashboard.member.trainerId.fullName}</div>
                    <div style={{fontSize:13, color:'var(--mp-text-tertiary)'}}>{dashboard.member.trainerId.specialization || 'Personal Trainer'}</div>
                  </div>
                </div>
              ) : (
                <p style={{color:'var(--mp-text-tertiary)', margin:0}}>No trainer assigned yet</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mp-grid-3" style={{marginBottom: 24}}>
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Current Workout</h3>
              <Link to="/member/workouts" className="mp-card-link">View All</Link>
            </div>
            <div className="mp-card-body">
              {todayWorkout ? (
                <>
                  <div style={{fontSize:15, fontWeight:600, marginBottom:4}}>{todayWorkout.title}</div>
                  <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
                    <span className={`mp-badge mp-badge-${todayWorkout.difficulty === 'beginner' ? 'success' : todayWorkout.difficulty === 'intermediate' ? 'warning' : 'danger'}`}>
                      {todayWorkout.difficulty}
                    </span>
                    <span className={`mp-badge ${todayWorkout.progress === 'completed' ? 'mp-badge-success' : todayWorkout.progress === 'in_progress' ? 'mp-badge-warning' : 'mp-badge-neutral'}`}>
                      {todayWorkout.progress?.replace(/_/g, ' ') || 'not started'}
                    </span>
                  </div>
                  {todayWorkout.progress !== 'completed' && (
                    <div className="mp-progress">
                      <div className="mp-progress-fill primary" style={{width: todayWorkout.progress === 'in_progress' ? '50%' : '10%'}} />
                    </div>
                  )}
                </>
              ) : (
                <p style={{color:'var(--mp-text-tertiary)', margin:0}}>No workouts assigned</p>
              )}
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Diet Plans</h3>
              <Link to="/member/diet-plans" className="mp-card-link">View All</Link>
            </div>
            <div className="mp-card-body">
              {dietPlans.length > 0 ? (
                <div className="mp-list">
                  {dietPlans.slice(0, 3).map(d => (
                    <div key={d.id} className="mp-list-item">
                      <div className="mp-list-item-left">
                        <div className="mp-list-item-title">{d.title}</div>
                        <div className="mp-list-item-sub">{(d.goal || 'general_fitness').replace(/_/g, ' ')}</div>
                      </div>
                      <span className="mp-badge mp-badge-iron">{d.dailyCalories || 'N/A'} cal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{color:'var(--mp-text-tertiary)', margin:0}}>No diet plans assigned</p>
              )}
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Attendance</h3>
              <Link to="/member/attendance" className="mp-card-link">Details</Link>
            </div>
            <div className="mp-card-body">
              <div className="mp-stat-row" style={{marginBottom:12}}>
                <div className="mp-stat-box">
                  <div className="mp-stat-box-value" style={{color:'var(--mp-success)'}}>{attendance?.totalPresent || 0}</div>
                  <div className="mp-stat-box-label">Present</div>
                </div>
                <div className="mp-stat-box">
                  <div className="mp-stat-box-value" style={{color:'var(--mp-warning)'}}>{attendance?.totalLate || 0}</div>
                  <div className="mp-stat-box-label">Late</div>
                </div>
                <div className="mp-stat-box">
                  <div className="mp-stat-box-value" style={{color:'var(--mp-danger)'}}>{attendance?.totalAbsent || 0}</div>
                  <div className="mp-stat-box-label">Absent</div>
                </div>
              </div>
              <div className="mp-progress">
                <div className="mp-progress-fill success" style={{width: `${attendancePct}%`}} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mp-grid-2">
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Recent Payments</h3>
              <Link to="/member/payments" className="mp-card-link">View All</Link>
            </div>
            <div className="mp-card-body">
              {recentPayments.length > 0 ? (
                <div className="mp-list">
                  {recentPayments.slice(0, 5).map(p => (
                    <div key={p._id || p.id} className="mp-list-item">
                      <div className="mp-list-item-left">
                        <div className="mp-list-item-title">&#x20B9;{p.amount?.toLocaleString()}</div>
                        <div className="mp-list-item-sub">{new Date(p.paymentDate).toLocaleDateString()}</div>
                      </div>
                      <span className={`mp-badge mp-badge-${p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{color:'var(--mp-text-tertiary)', margin:0}}>No payments yet</p>
              )}
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="mp-card-body">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                <Link to="/member/attendance" className="mp-btn mp-btn-secondary" style={{justifyContent:'center', padding:'12px 8px'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                  QR Attendance
                </Link>
                <Link to="/member/workouts" className="mp-btn mp-btn-secondary" style={{justifyContent:'center', padding:'12px 8px'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Workouts
                </Link>
                <Link to="/member/diet-plans" className="mp-btn mp-btn-secondary" style={{justifyContent:'center', padding:'12px 8px'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                  Diet Plans
                </Link>
                <Link to="/member/plans" className="mp-btn mp-btn-secondary" style={{justifyContent:'center', padding:'12px 8px'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Plans
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MemberDashboard;
