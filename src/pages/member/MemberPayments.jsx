import { useState, useEffect } from 'react';
import { getMyPayments } from '../../api/memberPortal';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const MemberPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getMyPayments();
        setPayments(data.payments || []);
        setTotalSpent(data.totalSpent || 0);
      } catch (err) {
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatCurrency = (amount) => '₹' + Number(amount).toLocaleString('en-IN');

  if (loading) {
    return (
      <>
        <div className="mp-page-header"><h1>Payments</h1><p>Your payment history and invoices</p></div>
        <div className="mp-grid-2">
          <div className="mp-skeleton-card"><div className="mp-skeleton mp-skeleton-line" style={{width:'40%'}} /><div className="mp-skeleton mp-skeleton-circle" style={{width:80,height:40,borderRadius:8}} /></div>
          <div className="mp-skeleton-card"><div className="mp-skeleton mp-skeleton-line" style={{width:'40%'}} /><div className="mp-skeleton mp-skeleton-line" /><div className="mp-skeleton mp-skeleton-line" /></div>
        </div>
      </>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <div className="mp-page-header">
        <h1>Payments</h1>
        <p>Your payment history and invoices</p>
      </div>

      {error && <div className="mp-error-banner"><p>{error}</p></div>}

      <div className="mp-grid-2" style={{marginBottom:24}}>
        <motion.div variants={fadeUp}>
          <div className="mp-card" style={{borderLeft:'3px solid var(--mp-primary)'}}>
            <div className="mp-card-body">
              <div className="mp-stat">
                <span className="mp-stat-label">Total Spent</span>
                <span className="mp-stat-value" style={{color:'var(--mp-iron)'}}>{formatCurrency(totalSpent)}</span>
                <span className="mp-stat-label">Lifetime total</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="mp-card">
            <div className="mp-card-body">
              <div className="mp-stat">
                <span className="mp-stat-label">Total Transactions</span>
                <span className="mp-stat-value small">{payments.length}</span>
                <span className="mp-stat-label">All time payments</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <div className="mp-table-container">
          <div className="mp-table-toolbar">
            <h3 style={{fontSize:13,fontWeight:600,color:'var(--mp-text)'}}>Payment History</h3>
          </div>
          {payments.length === 0 ? (
            <div className="mp-empty">
              <div className="mp-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <h3>No payments yet</h3>
              <p>Your payment history will appear here after your first purchase</p>
            </div>
          ) : (
            <table className="mp-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{textAlign:'right'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{fontWeight:500}}>Plan Payment</div>
                      {p.transactionId && <div style={{fontSize:11,color:'var(--mp-text-tertiary)',fontFamily:'monospace'}}>#{p.transactionId.slice(0,12)}</div>}
                    </td>
                    <td style={{color:'var(--mp-text-tertiary)'}}>{p.paymentMethod || 'Online'}</td>
                    <td style={{color:'var(--mp-text-tertiary)'}}>{new Date(p.paymentDate).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}</td>
                    <td>
                      <span className={`mp-badge mp-badge-${p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{textAlign:'right',fontWeight:600}}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemberPayments;
