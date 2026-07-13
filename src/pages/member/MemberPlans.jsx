import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { getPlans } from '../../api/memberPortal';
import { useToast } from '../../components/Toast';
import RazorpayCheckout from '../../components/payments/RazorpayCheckout';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const MemberPlans = () => {
  const { user, member, checkAuth } = useMemberAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  const fetchPlans = async () => {
    try {
      const data = await getPlans({ status: 'active' });
      setPlans(data || []);
    } catch (err) {
      setError('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSubscription = async () => {
    try {
      const { getMemberDashboard } = await import('../../api/memberPortal');
      const dashData = await getMemberDashboard();
      if (dashData?.subscription?.status === 'active') {
        setHasActiveSub(true);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPlans();
    checkExistingSubscription();
  }, []);

  const getMemberId = () => member?.id || member?._id || null;
  const mostExpensive = plans.length > 0 ? plans.reduce((max, p) => (p.price > max.price ? p : max), plans[0]) : null;

  const durationLabel = (days) => {
    if (days < 30) return `${days} Days`;
    if (days < 365) return `${Math.round(days / 30)} Month${Math.round(days / 30) > 1 ? 's' : ''}`;
    return `${Math.round(days / 365)} Year${Math.round(days / 365) > 1 ? 's' : ''}`;
  };

  const handlePaymentSuccess = async () => {
    setPurchaseSuccess(true);
    addToast('Payment successful! Your membership is now active.', 'success');
    await checkAuth();
    setTimeout(() => navigate('/member/dashboard'), 2000);
  };

  const handlePaymentError = (err) => {
    addToast(err.message || 'Payment failed. Please try again.', 'error');
  };

  const memberId = getMemberId();

  if (loading) {
    return (
      <>
        <div className="mp-page-header"><h1>Plans & Pricing</h1><p>Choose the perfect membership plan</p></div>
        <div className="mp-grid-3">
          {[1,2,3].map(i => <div key={i} className="mp-skeleton-card" style={{minHeight:400}}><div className="mp-skeleton mp-skeleton-line" style={{width:'60%'}} /><div className="mp-skeleton mp-skeleton-line" style={{width:120,height:40}} /><div className="mp-skeleton mp-skeleton-line" /><div className="mp-skeleton mp-skeleton-line" /><div className="mp-skeleton mp-skeleton-line" /></div>)}
        </div>
      </>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
      <div className="mp-page-header">
        <h1>Plans & Pricing</h1>
        <p>Choose the perfect membership plan</p>
      </div>

      {error && <div className="mp-error-banner"><p>{error}</p></div>}

      {purchaseSuccess && (
        <div className="mp-success-banner" style={{marginBottom:24}}>
          <p>Payment successful! Your membership is now active. Redirecting...</p>
        </div>
      )}

      {hasActiveSub && (
        <div className="mp-card" style={{marginBottom:24,borderLeft:'3px solid var(--mp-warning)'}}>
          <div className="mp-card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{fontWeight:600,color:'var(--mp-warning)',marginBottom:4}}>You already have an active subscription</div>
              <div style={{fontSize:13,color:'var(--mp-text-tertiary)'}}>View your current plan on your dashboard. You can purchase a new plan when your current subscription expires.</div>
            </div>
            <Link to="/member/dashboard" className="mp-btn mp-btn-primary">View Dashboard</Link>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="mp-card">
          <div className="mp-empty">
            <div className="mp-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3>No Plans Available</h3>
            <p>Membership plans are not yet available. Please check back later or contact the gym.</p>
          </div>
        </div>
      ) : (
        <div className="mp-grid-3" style={{alignItems:'start'}}>
          {plans.map((plan) => {
            const isPopular = plan._id === mostExpensive?._id && plans.length > 1;
            return (
              <motion.div key={plan._id} variants={fadeUp}>
                <div className={`mp-pricing-card ${isPopular ? 'popular' : ''}`}>
                  {isPopular && <div className="mp-pricing-popular">Popular</div>}
                  <div className="mp-pricing-header">
                    <div className="mp-pricing-name">{plan.planName}</div>
                    <div className="mp-pricing-price">
                      <span className="mp-pricing-amount">&#x20B9;{plan.price?.toLocaleString()}</span>
                      <span className="mp-pricing-period">/ {durationLabel(plan.duration)}</span>
                    </div>
                  </div>
                  <div className="mp-pricing-body">
                    <ul className="mp-pricing-features">
                      {plan.features?.length > 0 ? plan.features.map((f, i) => (
                        <li key={i}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M5 13l4 4L19 7"/></svg>
                          {f}
                        </li>
                      )) : (
                        <li style={{color:'var(--mp-text-tertiary)',fontStyle:'italic'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M5 13l4 4L19 7"/></svg>
                          {plan.duration} days of full gym access
                        </li>
                      )}
                    </ul>
                    <div>
                      {hasActiveSub ? (
                        <div style={{padding:'12px 20px',background:'var(--mp-surface)',border:'1px solid var(--mp-border)',borderRadius:'var(--mp-radius-sm)',textAlign:'center',fontSize:13,color:'var(--mp-text-tertiary)'}}>
                          Already subscribed
                        </div>
                      ) : !memberId ? (
                        <div style={{padding:'12px 20px',background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'var(--mp-radius-sm)',textAlign:'center',fontSize:13,color:'var(--mp-iron)'}}>
                          Complete your profile setup first
                        </div>
                      ) : purchaseSuccess ? (
                        <div className="mp-success-banner" style={{margin:0}}><p>Purchase Complete!</p></div>
                      ) : (
                        <RazorpayCheckout
                          planId={plan._id}
                          memberId={memberId}
                          buttonText={`Buy Now - &#x20B9;${plan.price?.toLocaleString()}`}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default MemberPlans;
