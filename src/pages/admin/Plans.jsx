import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../api/plans';

const EMPTY_FORM = { planName: '', price: '', duration: '', features: '', status: 'active' };

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const fetchPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  useEffect(() => {
    const handleCommand = (e) => {
      if (e.detail === 'CREATE_PLAN') openCreate();
    };
    window.addEventListener('COMMAND_ACTION', handleCommand);
    return () => window.removeEventListener('COMMAND_ACTION', handleCommand);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setForm({
      planName: plan.planName,
      price: plan.price,
      duration: plan.duration,
      features: plan.features?.join('\n') || '',
      status: plan.status,
    });
    setEditing(plan._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        features: form.features.split('\n').filter(Boolean).map(s => s.trim()),
      };
      if (editing) {
        await updatePlan(editing, payload);
        addToast('Plan updated successfully', 'success');
      } else {
        await createPlan(payload);
        addToast('Plan created successfully', 'success');
      }
      setShowForm(false);
      fetchPlans();
    } catch (err) {
      addToast(err.message || 'Failed to save plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await deletePlan(id);
      addToast('Plan deleted', 'success');
      fetchPlans();
    } catch (err) {
      addToast(err.message || 'Failed to delete plan', 'error');
    }
  };

  const durationLabel = (days) => {
    if (days < 30) return `${days} Days`;
    if (days < 365) return `${Math.round(days / 30)} Month${Math.round(days / 30) > 1 ? 's' : ''}`;
    return `${Math.round(days / 365)} Year${Math.round(days / 365) > 1 ? 's' : ''}`;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Pricing Plans</h1>
          <p className="text-secondary text-sm">Create and manage your membership tiers.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Plan
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading plans...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => (
            <motion.div 
              key={plan._id} 
              className="saas-card"
              style={{ padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', opacity: plan.status === 'inactive' ? 0.6 : 1 }}
              whileHover={{ y: -4 }}
            >
              <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
                <button className="text-tertiary hover:text-primary transition-colors" onClick={() => openEdit(plan)}>
                  <Edit2 size={16} />
                </button>
                <button className="text-tertiary hover:text-danger transition-colors" onClick={() => handleDelete(plan._id)}>
                  <Trash2 size={16} />
                </button>
              </div>

              <span className={`saas-badge ${plan.status === 'active' ? 'success' : 'neutral'}`} style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>

              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{plan.planName}</h3>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>${plan.price}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: 500 }}>/ {durationLabel(plan.duration)}</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '16px' }}>Features included</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features?.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{f}</span>
                    </li>
                  ))}
                  {(!plan.features || plan.features.length === 0) && (
                    <li style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No features listed</li>
                  )}
                </ul>
              </div>
            </motion.div>
          ))}
          {plans.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-medium)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
              No plans yet. Create your first membership plan!
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
              onClick={() => setShowForm(false)}
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
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{editing ? 'Edit Plan' : 'New Plan'}</h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <form id="plan-form" onSubmit={handleSubmit}>
                  <div className="saas-input-group">
                    <label className="saas-label">Plan Name</label>
                    <input className="saas-input" name="planName" value={form.planName} onChange={handleChange} required placeholder="Pro Membership" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="saas-input-group">
                      <label className="saas-label">Price ($)</label>
                      <input className="saas-input" type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} required />
                    </div>
                    <div className="saas-input-group">
                      <label className="saas-label">Duration (days)</label>
                      <input className="saas-input" type="number" min="1" name="duration" value={form.duration} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Status</label>
                    <select className="saas-input" name="status" value={form.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Features (one per line)</label>
                    <textarea className="saas-input" style={{ resize: 'vertical' }} rows="6" name="features" value={form.features} onChange={handleChange} placeholder="24/7 Access&#10;Locker Room&#10;1 PT Session" />
                  </div>
                </form>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="plan-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plans;
