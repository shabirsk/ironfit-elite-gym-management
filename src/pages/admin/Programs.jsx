import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../../api/programs';
import ImageUploader from '../../components/ImageUploader';

const EMPTY_FORM = {
  title: '', description: '', category: '',
  image: '', status: 'active', sortOrder: 0,
};

const CATEGORIES = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'other', label: 'Other' },
];

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const fetchPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || '',
      description: p.description || '',
      category: p.category || '',
      image: p.image || '',
      status: p.status,
      sortOrder: p.sortOrder ?? 0,
    });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category || 'other',
        image: form.image,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editing) {
        await updateProgram(editing, payload);
        addToast('Program updated successfully', 'success');
      } else {
        await createProgram(payload);
        addToast('Program created successfully', 'success');
      }
      setShowForm(false);
      fetchPrograms();
    } catch (err) {
      addToast(err.message || 'Failed to save program', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try { 
      await deleteProgram(id); 
      addToast('Program deleted', 'success');
      fetchPrograms(); 
    } catch (err) { 
      addToast(err.message || 'Failed to delete program', 'error'); 
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Programs</h1>
          <p className="text-secondary text-sm">Manage workout tracks and curriculum.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Program
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading programs...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {programs.map(p => (
            <motion.div 
              key={p._id} 
              className="saas-card"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: p.status === 'inactive' ? 0.6 : 1, padding: 0 }}
              whileHover={{ y: -4 }}
            >
              <div style={{ height: '180px', background: 'var(--bg-surface)', position: 'relative' }}>
                {p.image ? (
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 700, color: 'var(--border-medium)' }}>
                    {p.title?.charAt(0) || 'P'}
                  </div>
                )}
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                  <button 
                    style={{ padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.65)'; e.currentTarget.style.color = '#fff'; }}
                    onClick={() => openEdit(p)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    style={{ padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.65)'; }}
                    onClick={() => handleDelete(p._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{p.title}</h3>
                  <span className={`saas-badge ${p.status === 'active' ? 'success' : 'warning'}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
                {p.category && (
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    {p.category}
                  </div>
                )}
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: 0 }}>
                  {p.description || 'No description provided.'}
                </p>
              </div>
            </motion.div>
          ))}
          {programs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-medium)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
              No programs yet. Create your first program!
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
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{editing ? 'Edit Program' : 'New Program'}</h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <form id="program-form" onSubmit={handleSubmit}>
                  <div className="saas-input-group">
                    <label className="saas-label">Program Title *</label>
                    <input className="saas-input" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. 12-Week Transformation" />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Category</label>
                    <select className="saas-input" name="category" value={form.category} onChange={handleChange}>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="saas-input-group">
                      <label className="saas-label">Sort Order</label>
                      <input className="saas-input" type="number" min="0" step="1" name="sortOrder" value={form.sortOrder} onChange={handleChange} />
                    </div>
                    <div className="saas-input-group">
                      <label className="saas-label">Status</label>
                      <select className="saas-input" name="status" value={form.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Description</label>
                    <textarea className="saas-input" style={{ resize: 'vertical' }} rows="3" name="description" value={form.description} onChange={handleChange} />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Program Image</label>
                    <div style={{ 
                      border: '1px solid var(--border-medium)', borderRadius: '8px', overflow: 'hidden'
                    }}>
                      <ImageUploader
                        currentImage={form.image}
                        onImageChange={(url) => setForm(prev => ({ ...prev, image: url }))}
                        folder="ironfit-elite"
                        resource="programs"
                        label=""
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="program-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Program'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Programs;
