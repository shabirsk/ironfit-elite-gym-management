import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAttendance, markAttendance, getAttendanceReport } from '../../api/attendance';
import { downloadExport } from '../../utils/downloadExport';
import { useToast } from '../../components/Toast';
import { getMembers } from '../../api/members';
import { Download, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ memberId: '', status: '' });
  const [marking, setMarking] = useState(false);
  const [markForm, setMarkForm] = useState({ memberId: '', status: 'present', date: new Date().toISOString().split('T')[0] });
  const [report, setReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [exporting, setExporting] = useState(null);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    try {
      const params = {};
      if (filter.memberId) params.memberId = filter.memberId;
      if (filter.status) params.status = filter.status;
      const [attData, mData] = await Promise.all([
        getAttendance(params),
        getMembers(),
      ]);
      setRecords(attData.records);
      setMembers(mData.members);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleMark = async (e) => {
    e.preventDefault();
    setMarking(true);
    try {
      await markAttendance(markForm);
      setMarkForm({ memberId: '', status: 'present', date: new Date().toISOString().split('T')[0] });
      setMarking(false);
      fetchData();
      addToast('Attendance marked successfully', 'success');
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      addToast('Failed to mark attendance', 'error');
      setMarking(false);
    }
  };

  const { addToast } = useToast();

  const fetchReport = async () => {
    try {
      const data = await getAttendanceReport({ month: reportMonth, year: reportYear });
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    }
  };

  useEffect(() => {
    if (showReport) fetchReport();
  }, [showReport, reportMonth, reportYear]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Attendance</h1>
          <p className="text-secondary text-sm">Track member attendance and generate reports.</p>
        </div>
        <button className="saas-btn saas-btn-secondary" onClick={() => setShowReport(!showReport)}>
          {showReport ? 'Hide Report' : 'Monthly Report'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Mark Attendance */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>Mark Attendance</h2>
          <form onSubmit={handleMark}>
            <div className="saas-input-group">
              <label className="saas-label">Member *</label>
              <select
                className="saas-input"
                value={markForm.memberId}
                onChange={(e) => setMarkForm(p => ({ ...p, memberId: e.target.value }))}
                required
              >
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.fullName}</option>
                ))}
              </select>
            </div>
            <div className="saas-input-group">
              <label className="saas-label">Date</label>
              <input
                className="saas-input"
                type="date"
                value={markForm.date}
                onChange={(e) => setMarkForm(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="saas-input-group">
              <label className="saas-label">Status</label>
              <select
                className="saas-input"
                value={markForm.status}
                onChange={(e) => setMarkForm(p => ({ ...p, status: e.target.value }))}
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <button type="submit" className="saas-btn saas-btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={marking || !markForm.memberId}>
              {marking ? 'Marking...' : 'Mark Present'}
            </button>
          </form>
        </div>

        {/* Right Column: History / Report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <AnimatePresence>
            {showReport && report && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="saas-card" 
                style={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Attendance Report — {months[report.summary.month - 1]} {report.summary.year}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select className="saas-input" style={{ width: 'auto', marginBottom: 0 }} value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))}>
                      {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <input
                      className="saas-input"
                      type="number"
                      value={reportYear}
                      onChange={(e) => setReportYear(Number(e.target.value))}
                      style={{ width: 100, marginBottom: 0 }}
                    />
                    <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid var(--border-light)', paddingLeft: '12px', marginLeft: '4px' }}>
                      <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('pdf'); try { await downloadExport('attendance', 'pdf', { month: reportMonth, year: reportYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={exporting === 'pdf'}><Download size={14} /> {exporting === 'pdf' ? '...' : 'PDF'}</button>
                      <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('excel'); try { await downloadExport('attendance', 'excel', { month: reportMonth, year: reportYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={exporting === 'excel'}><Download size={14} /> {exporting === 'excel' ? '...' : 'Excel'}</button>
                      <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('csv'); try { await downloadExport('attendance', 'csv', { month: reportMonth, year: reportYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={exporting === 'csv'}><Download size={14} /> {exporting === 'csv' ? '...' : 'CSV'}</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Records</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{report.summary.totalRecords}</div>
                  </div>
                  <div style={{ background: 'var(--status-success-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14}/> Present</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{report.summary.totalPresent}</div>
                  </div>
                  <div style={{ background: 'var(--status-warning-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--warning)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> Late</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{report.summary.totalLate}</div>
                  </div>
                  <div style={{ background: 'var(--status-error-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--danger)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><XCircle size={14}/> Absent</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>{report.summary.totalAbsent}</div>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="saas-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Present</th>
                        <th>Late</th>
                        <th>Absent</th>
                        <th>Total</th>
                        <th>Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.report.map((s) => (
                        <tr key={s.member?._id || Math.random()}>
                          <td className="font-medium text-primary">{s.member?.fullName || 'Unknown'}</td>
                          <td style={{ color: 'var(--success)' }}>{s.present}</td>
                          <td style={{ color: 'var(--warning)' }}>{s.late}</td>
                          <td style={{ color: 'var(--danger)' }}>{s.absent}</td>
                          <td className="text-secondary">{s.total}</td>
                          <td>
                            <span className={`saas-badge ${s.percentage >= 70 ? 'success' : s.percentage >= 40 ? 'warning' : 'danger'}`}>
                              {s.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {report.report.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No records this month</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="saas-table-container">
            <div className="saas-table-toolbar">
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Attendance History</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  className="saas-input" style={{ width: '160px', marginBottom: 0 }}
                  value={filter.memberId}
                  onChange={(e) => setFilter(p => ({ ...p, memberId: e.target.value }))}
                >
                  <option value="">All Members</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.fullName}</option>
                  ))}
                </select>
                <select
                  className="saas-input" style={{ width: '140px', marginBottom: 0 }}
                  value={filter.status}
                  onChange={(e) => setFilter(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', minHeight: '300px' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading history...</div>
              ) : (
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Date</th>
                      <th>Check-in</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r._id}>
                        <td>
                           <div className="flex items-center gap-3">
                             <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--primary)' }}>
                               {r.memberId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                             </div>
                             <div className="font-medium text-primary">{r.memberId?.fullName || 'Unknown'}</div>
                           </div>
                        </td>
                        <td className="text-secondary">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="text-tertiary" style={{ fontFamily: 'monospace' }}>{r.checkInTime || '\u2014'}</td>
                        <td>
                          <span className={`saas-badge ${r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}`}>
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>No attendance records found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Attendance;
