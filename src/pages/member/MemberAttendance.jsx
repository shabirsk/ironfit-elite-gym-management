import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getMyAttendance, generateQRCode } from '../../api/memberPortal';
import { motion } from 'framer-motion';

const SkeletonAttendance = () => (
  <div className="mp-grid-2">
    <div className="mp-skeleton-card"><div className="mp-skeleton mp-skeleton-line" style={{width:'60%'}} /><div className="mp-skeleton mp-skeleton-circle" style={{width:180,height:180}} /></div>
    <div className="mp-skeleton-card"><div className="mp-skeleton mp-skeleton-line" style={{width:'40%'}} /><div className="mp-skeleton mp-skeleton-line" /><div className="mp-skeleton mp-skeleton-line" /></div>
  </div>
);

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const MemberAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const qrRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getMyAttendance();
      setAttendance(data);
    } catch (err) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateQR = async () => {
    setQrLoading(true);
    setError('');
    try {
      const data = await generateQRCode();
      setQrData(data);
    } catch (err) {
      setError('Failed to generate QR');
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `ironfit-qr-${qrData?.memberName || 'member'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const getDayStatus = (idx, records) => {
    if (!records) return '';
    const day = idx + 1;
    const rec = records.find(r => new Date(r.date).getDate() === day);
    if (!rec) return '';
    return rec.status === 'present' ? 'present' : rec.status === 'late' ? 'late' : 'absent';
  };

  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();

  if (loading) return <SkeletonAttendance />;

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <div className="mp-page-header">
        <h1>Attendance</h1>
        <p>Track your gym visits and QR check-in</p>
      </div>

      {error && <div className="mp-error-banner"><p>{error}</p></div>}

      <div className="mp-grid-2" style={{marginBottom:24}}>
        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>My QR Code</h3>
            </div>
            <div className="mp-qr-card">
              {!qrData ? (
                <div className="mp-empty" style={{padding:0}}>
                  <p style={{marginBottom:16}}>Generate your unique QR code to scan at the gym</p>
                  <button onClick={handleGenerateQR} className="mp-btn mp-btn-primary mp-btn-lg" disabled={qrLoading}>
                    {qrLoading ? 'Generating...' : 'Generate QR Code'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mp-qr-container" ref={qrRef}>
                    <QRCodeCanvas value={qrData.qrData} size={200} level="M" />
                  </div>
                  <div className="mp-qr-member">{qrData.memberName}</div>
                  <div className="mp-qr-plan">{qrData.membershipStatus || 'Active Member'}</div>
                  <div className="mp-qr-actions">
                    <button onClick={handleGenerateQR} className="mp-btn mp-btn-secondary" disabled={qrLoading}>Regenerate</button>
                    <button onClick={handleDownloadQR} className="mp-btn mp-btn-secondary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      Download
                    </button>
                    <button onClick={() => setFullscreen(true)} className="mp-btn mp-btn-secondary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                      Fullscreen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-header">
              <h3>Attendance Overview</h3>
              <span className="mp-badge mp-badge-primary">{attendance?.percentage || 0}%</span>
            </div>
            <div className="mp-card-body">
              <div className="mp-stat-row" style={{marginBottom:16}}>
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
              <div className="mp-divider" style={{margin:'12px 0'}} />
              <div className="mp-stat-row">
                <div className="mp-stat-box">
                  <div className="mp-stat-box-value" style={{fontSize:20}}>{attendance?.currentStreak || 0}</div>
                  <div className="mp-stat-box-label">Current Streak</div>
                </div>
                <div className="mp-stat-box">
                  <div className="mp-stat-box-value" style={{fontSize:20}}>{attendance?.longestStreak || 0}</div>
                  <div className="mp-stat-box-label">Best Streak</div>
                </div>
                <div className="mp-stat-box">
                  <div className="mp-stat-box-value" style={{fontSize:20}}>{attendance?.totalThisMonth || 0}</div>
                  <div className="mp-stat-box-label">Monthly Visits</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} style={{marginBottom:24}}>
        <div className="mp-card">
          <div className="mp-card-header">
            <h3>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <div style={{display:'flex', gap:12, alignItems:'center', fontSize:11, color:'var(--mp-text-tertiary)'}}>
              <span style={{display:'flex', alignItems:'center', gap:4}}><span style={{width:10,height:10,borderRadius:2,background:'var(--mp-success)'}} /> Present</span>
              <span style={{display:'flex', alignItems:'center', gap:4}}><span style={{width:10,height:10,borderRadius:2,background:'var(--mp-warning)'}} /> Late</span>
              <span style={{display:'flex', alignItems:'center', gap:4}}><span style={{width:10,height:10,borderRadius:2,background:'var(--mp-danger)'}} /> Absent</span>
            </div>
          </div>
          <div className="mp-card-body">
            <div className="mp-heatmap">
              {['S','M','T','W','T','F','S'].map((d, idx) => (
                <div key={`${d}-${idx}`} style={{fontSize:9,color:'var(--mp-text-tertiary)',textAlign:'center',padding:'2px 0',fontWeight:600}}>{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(i, attendance?.records);
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className={`mp-heatmap-day ${status} ${isToday ? 'today' : ''}`}
                    title={`Day ${day}: ${status || 'no record'}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="mp-table-container">
          <div className="mp-table-toolbar">
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--mp-text)'}}>Attendance History</h3>
            <span style={{fontSize:12,color:'var(--mp-text-tertiary)'}}>{attendance?.records?.length || 0} records</span>
          </div>
          {attendance?.records?.length > 0 ? (
            <table className="mp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.records.map(r => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td style={{color:'var(--mp-text-tertiary)'}}>{r.checkInTime || '---'}</td>
                    <td>
                      <span className={`mp-badge mp-badge-${r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mp-empty">
              <div className="mp-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              </div>
              <h3>No records</h3>
              <p>No attendance records found for this month</p>
            </div>
          )}
        </div>
      </motion.div>

      {fullscreen && qrData && (
        <div className="mp-modal-overlay" onClick={() => setFullscreen(false)}>
          <div className="mp-modal" onClick={e => e.stopPropagation()} style={{maxWidth:400,textAlign:'center'}}>
            <div className="mp-modal-header">
              <h2>Your QR Code</h2>
              <button className="mp-modal-close" onClick={() => setFullscreen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="mp-modal-body" style={{padding:'32px 24px'}}>
              <div style={{display:'inline-block',background:'#fff',padding:24,borderRadius:20,boxShadow:'0 16px 48px rgba(0,0,0,0.4)'}}>
                <QRCodeCanvas value={qrData.qrData} size={280} level="M" />
              </div>
              <p style={{marginTop:16,fontSize:16,fontWeight:600}}>{qrData.memberName}</p>
              <p style={{color:'var(--mp-text-tertiary)',fontSize:13}}>Show this to the gym staff to mark attendance</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MemberAttendance;
