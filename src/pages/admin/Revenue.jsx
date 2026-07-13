import { useState, useEffect } from 'react';
import { getPaymentReports } from '../../api/payments';
import { getRenewalDashboard } from '../../api/renewals';
import { downloadExport } from '../../utils/downloadExport';
import { useToast } from '../../components/Toast';
import { Download } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Revenue = () => {
  const [reports, setReports] = useState(null);
  const [renewals, setRenewals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(null);
  const { addToast } = useToast();
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [r, rd] = await Promise.all([
          getPaymentReports({ year: selectedYear }),
          getRenewalDashboard(),
        ]);
        setReports(r);
        setRenewals(rd);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [selectedYear]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading revenue data...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Revenue & Financials</h1>
          <p className="text-secondary text-sm">Monitor business performance and subscriptions.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <button className={`saas-btn ${tab === 'overview' ? 'saas-btn-primary' : 'saas-btn-secondary'}`} style={{ border: 'none', background: tab === 'overview' ? 'var(--primary)' : 'transparent', color: tab === 'overview' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setTab('overview')}>Overview</button>
          <button className={`saas-btn ${tab === 'renewals' ? 'saas-btn-primary' : 'saas-btn-secondary'}`} style={{ border: 'none', background: tab === 'renewals' ? 'var(--primary)' : 'transparent', color: tab === 'renewals' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setTab('renewals')}>Renewals</button>
          <button className={`saas-btn ${tab === 'reports' ? 'saas-btn-primary' : 'saas-btn-secondary'}`} style={{ border: 'none', background: tab === 'reports' ? 'var(--primary)' : 'transparent', color: tab === 'reports' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setTab('reports')}>Reports</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '24px' }}>
        {tab === 'overview' && (
          <>
            <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('pdf'); try { await downloadExport('revenue', 'pdf', { year: selectedYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={loading || exporting === 'pdf'}><Download size={14}/> {exporting === 'pdf' ? '...' : 'PDF'}</button>
            <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('excel'); try { await downloadExport('revenue', 'excel', { year: selectedYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={loading || exporting === 'excel'}><Download size={14}/> {exporting === 'excel' ? '...' : 'Excel'}</button>
            <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('csv'); try { await downloadExport('revenue', 'csv', { year: selectedYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={loading || exporting === 'csv'}><Download size={14}/> {exporting === 'csv' ? '...' : 'CSV'}</button>
          </>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && reports && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Revenue ({reports.year})</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--success)' }}>${reports.totalRevenue?.toLocaleString()}</div>
            </div>
            <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Today's Collections</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--primary)' }}>${reports.todayCollections?.toFixed(2)}</div>
            </div>
          </div>

          <div className="saas-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>Revenue by Month</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '8px', paddingBottom: '32px', position: 'relative' }}>
              {MONTHS.map((m, i) => {
                const monthData = reports.revenueByMonth?.find(r => r._id === i + 1);
                const total = monthData?.total || 0;
                const maxTotal = Math.max(...(reports.revenueByMonth?.map(r => r.total) || [1]), 1);
                const pct = (total / maxTotal) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ height: '160px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ width: '60%', minWidth: '12px', maxWidth: '32px', background: 'var(--primary)', height: Math.max(pct, 4) + '%', borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height 0.3s ease' }}>
                        {total > 0 && (
                           <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>${total > 999 ? (total/1000).toFixed(1)+'k' : total.toFixed(0)}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', position: 'absolute', bottom: '0' }}>{m}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="saas-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Revenue by Plan</h3>
              </div>
              <table className="saas-table" style={{ margin: 0 }}>
                <thead><tr><th style={{ padding: '12px 24px' }}>Plan</th><th style={{ padding: '12px 24px' }}>Revenue</th><th style={{ padding: '12px 24px' }}>Count</th></tr></thead>
                <tbody>
                  {(reports.revenueByPlan?.length > 0 ? reports.revenueByPlan : []).map((p) => (
                    <tr key={p._id || 'unknown'}>
                      <td style={{ padding: '12px 24px', fontWeight: 500 }}>{p._id || 'Unknown'}</td>
                      <td style={{ padding: '12px 24px', color: 'var(--success)' }}>${p.total?.toFixed(2)}</td>
                      <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{p.count}</td>
                    </tr>
                  ))}
                  {(!reports.revenueByPlan || reports.revenueByPlan.length === 0) && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No plan data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="saas-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Revenue by Method</h3>
              </div>
              <table className="saas-table" style={{ margin: 0 }}>
                <thead><tr><th style={{ padding: '12px 24px' }}>Method</th><th style={{ padding: '12px 24px' }}>Revenue</th><th style={{ padding: '12px 24px' }}>Count</th></tr></thead>
                <tbody>
                  {(reports.revenueByMethod?.length > 0 ? reports.revenueByMethod : []).map((m) => (
                    <tr key={m._id}>
                      <td style={{ padding: '12px 24px', textTransform: 'capitalize' }}>{m._id?.replace('_', ' ')}</td>
                      <td style={{ padding: '12px 24px', color: 'var(--success)' }}>${m.total?.toFixed(2)}</td>
                      <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{m.count}</td>
                    </tr>
                  ))}
                  {(!reports.revenueByMethod || reports.revenueByMethod.length === 0) && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No method data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* RENEWALS TAB */}
      {tab === 'renewals' && renewals && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="saas-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Active Subscriptions</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>{renewals.counts.activeSubscriptions}</div>
            </div>
            <div className="saas-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Expiring in 7 Days</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--warning)' }}>{renewals.counts.expiringIn7Days}</div>
            </div>
            <div className="saas-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Expiring in 30 Days</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>{renewals.counts.expiringIn30Days}</div>
            </div>
            <div className="saas-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Expired Subscriptions</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--danger)' }}>{renewals.counts.expired}</div>
            </div>
          </div>

          <div className="saas-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '32px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Expiring in 7 Days</h2>
            </div>
            <table className="saas-table" style={{ margin: 0 }}>
              <thead><tr><th style={{ padding: '12px 24px' }}>Member</th><th style={{ padding: '12px 24px' }}>Plan</th><th style={{ padding: '12px 24px' }}>End Date</th><th style={{ padding: '12px 24px' }}>Phone</th></tr></thead>
              <tbody>
                {renewals.expiringIn7Days?.map(s => (
                  <tr key={s._id}>
                    <td style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.memberId?.fullName || 'Unknown'}</td>
                    <td style={{ padding: '12px 24px' }}>{s.planId?.planName || 'Unknown'}</td>
                    <td style={{ padding: '12px 24px', color: 'var(--warning)' }}>{new Date(s.endDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{s.memberId?.phone || '-'}</td>
                  </tr>
                ))}
                {(!renewals.expiringIn7Days || renewals.expiringIn7Days.length === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No subscriptions expiring soon</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="saas-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recently Expired</h2>
            </div>
            <table className="saas-table" style={{ margin: 0 }}>
              <thead><tr><th style={{ padding: '12px 24px' }}>Member</th><th style={{ padding: '12px 24px' }}>Plan</th><th style={{ padding: '12px 24px' }}>Expired On</th><th style={{ padding: '12px 24px' }}>Phone</th></tr></thead>
              <tbody>
                {renewals.expiredSubscriptions?.slice(0, 10).map(s => (
                  <tr key={s._id}>
                    <td style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.memberId?.fullName || 'Unknown'}</td>
                    <td style={{ padding: '12px 24px' }}>{s.planId?.planName || 'Unknown'}</td>
                    <td style={{ padding: '12px 24px', color: 'var(--danger)' }}>{new Date(s.endDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{s.memberId?.phone || '-'}</td>
                  </tr>
                ))}
                {(!renewals.expiredSubscriptions || renewals.expiredSubscriptions.length === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No expired subscriptions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* REPORTS TAB */}
      {tab === 'reports' && reports && (
        <>
          <div className="saas-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Select Year:</label>
              <select className="saas-input" style={{ width: '120px', marginBottom: 0 }} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('pdf'); try { await downloadExport('revenue', 'pdf', { year: selectedYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={exporting === 'pdf'}><Download size={14}/> {exporting === 'pdf' ? '...' : 'PDF'}</button>
              <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('excel'); try { await downloadExport('revenue', 'excel', { year: selectedYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={exporting === 'excel'}><Download size={14}/> {exporting === 'excel' ? '...' : 'Excel'}</button>
              <button className="saas-btn saas-btn-secondary" onClick={async () => { setExporting('csv'); try { await downloadExport('revenue', 'csv', { year: selectedYear }); addToast('Report downloaded', 'success'); } catch(e) { addToast(e.message || 'Export failed', 'error'); } finally { setExporting(null); } }} disabled={exporting === 'csv'}><Download size={14}/> {exporting === 'csv' ? '...' : 'CSV'}</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="saas-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Status Breakdown</h3>
              </div>
              <table className="saas-table" style={{ margin: 0 }}>
                <thead><tr><th style={{ padding: '12px 24px' }}>Status</th><th style={{ padding: '12px 24px' }}>Amount</th><th style={{ padding: '12px 24px' }}>Count</th></tr></thead>
                <tbody>
                  {reports.statusBreakdown?.map(s => (
                    <tr key={s._id}>
                      <td style={{ padding: '12px 24px', textTransform: 'capitalize' }}>
                        <span className={`saas-badge ${s._id === 'completed' ? 'success' : s._id === 'failed' ? 'danger' : s._id === 'refunded' ? 'default' : 'warning'}`}>{s._id}</span>
                      </td>
                      <td style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-primary)' }}>${s.total?.toFixed(2)}</td>
                      <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{s.count}</td>
                    </tr>
                  ))}
                  {(!reports.statusBreakdown || reports.statusBreakdown.length === 0) && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="saas-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Monthly Totals</h3>
              </div>
              <table className="saas-table" style={{ margin: 0 }}>
                <thead><tr><th style={{ padding: '12px 24px' }}>Month</th><th style={{ padding: '12px 24px' }}>Revenue</th><th style={{ padding: '12px 24px' }}>Transactions</th></tr></thead>
                <tbody>
                  {MONTHS.map((m, i) => {
                    const md = reports.revenueByMonth?.find(r => r._id === i + 1);
                    return (
                      <tr key={i}>
                        <td style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-primary)' }}>{m}</td>
                        <td style={{ padding: '12px 24px', color: 'var(--success)' }}>${md?.total?.toFixed(2) || '0.00'}</td>
                        <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{md?.count || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Revenue;
