import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '../../api/trainers';
import ImageUploader from '../../components/ImageUploader';

const EMPTY_FORM = {
  fullName: '', email: '', phone: '', specialization: '',
  experienceYears: '', certifications: '', profileImage: '', status: 'active',
};

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const { addToast } = useToast();

  const fetchTrainers = async () => {
    try {
      const data = await getTrainers();
      setTrainers(data);
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrainers(); }, []);

  useEffect(() => {
    const handleCommand = (e) => {
      if (e.detail === 'CREATE_TRAINER') openCreate();
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

  const openEdit = (trainer) => {
    setForm({
      fullName: trainer.fullName,
      email: trainer.email,
      phone: trainer.phone || '',
      specialization: trainer.specialization || '',
      experienceYears: trainer.experienceYears || '',
      certifications: trainer.certifications?.join('\n') || '',
      profileImage: trainer.profileImage || '',
      status: trainer.status,
    });
    setEditing(trainer._id);
    setShowForm(true);
    setActionMenuOpen(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears) || 0,
        certifications: form.certifications.split('\n').filter(Boolean).map(s => s.trim()),
      };
      if (editing) {
        await updateTrainer(editing, payload);
        addToast('Trainer updated successfully', 'success');
      } else {
        await createTrainer(payload);
        addToast('Trainer created successfully', 'success');
      }
      setShowForm(false);
      fetchTrainers();
    } catch (err) {
      addToast(err.message || 'Failed to save trainer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trainer?')) return;
    try {
      await deleteTrainer(id);
      addToast('Trainer deleted', 'success');
      fetchTrainers();
    } catch (err) {
      addToast(err.message || 'Failed to delete trainer', 'error');
    }
    setActionMenuOpen(null);
  };

  const filteredTrainers = trainers.filter(t => 
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Trainers</h1>
          <p className="text-secondary text-sm">Manage your coaching staff and their specializations.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      <div className="saas-table-container">
        <div className="saas-table-toolbar">
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="saas-input" 
                style={{ paddingLeft: '36px', marginBottom: 0 }}
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="text-tertiary text-sm">
            {filteredTrainers.length} {filteredTrainers.length === 1 ? 'trainer' : 'trainers'}
          </div>
        </div>

        <div style={{ overflowX: 'auto', minHeight: '400px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading trainers...</div>
          ) : (
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Trainer</th>
                  <th>Contact</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainers.map((trainer) => (
                  <tr key={trainer._id}>
                    <td>
                      <div className="flex items-center gap-4">
                        {trainer.profileImage ? (
                           <img src={trainer.profileImage} alt={trainer.fullName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                            {trainer.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-primary">{trainer.fullName}</div>
                          <div className="text-xs text-tertiary">ID: {trainer._id.substring(trainer._id.length - 6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-secondary">{trainer.email}</div>
                      <div className="text-xs text-tertiary">{trainer.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <div className="text-sm text-secondary">{trainer.specialization || 'General'}</div>
                      <div className="text-xs text-tertiary">
                        {trainer.certifications?.length > 0 ? `${trainer.certifications.length} Certs` : 'No Certs'}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-secondary">{trainer.experienceYears || 0} years</div>
                      <div className="text-xs text-tertiary">
                        {trainer.assignedMembers?.length || 0} Members
                      </div>
                    </td>
                    <td>
                      <span className={`saas-badge ${trainer.status === 'active' ? 'success' : 'warning'}`}>
                        {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button 
                        style={{ padding: '8px', color: 'var(--text-tertiary)', borderRadius: '6px' }}
                        className="hover:bg-card hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(actionMenuOpen === trainer._id ? null : trainer._id);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      <AnimatePresence>
                        {actionMenuOpen === trainer._id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: 'absolute', right: '40px', top: '20px', zIndex: 50,
                              background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                              borderRadius: '8px', boxShadow: 'var(--shadow-lg)', width: '160px',
                              padding: '4px', textAlign: 'left'
                            }}
                          >
                            <button className="flex items-center gap-2 w-full text-sm text-secondary transition-colors" style={{ padding: '8px 12px', borderRadius: '4px' }} onClick={() => openEdit(trainer)} onMouseOver={e => e.currentTarget.style.background='var(--bg-card-hover)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                              <Edit2 size={14} /> Edit Trainer
                            </button>
                            <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />
                            <button className="flex items-center gap-2 w-full text-sm text-danger transition-colors" style={{ padding: '8px 12px', borderRadius: '4px' }} onClick={() => handleDelete(trainer._id)} onMouseOver={e => e.currentTarget.style.background='var(--danger-bg)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
                {filteredTrainers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                      No trainers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{editing ? 'Edit Trainer' : 'New Trainer'}</h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <form id="trainer-form" onSubmit={handleSubmit}>
                  <div className="saas-input-group">
                    <label className="saas-label">Full Name *</label>
                    <input className="saas-input" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Jane Doe" />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Email *</label>
                    <input className="saas-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Phone</label>
                    <input className="saas-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="saas-input-group">
                      <label className="saas-label">Specialization</label>
                      <input className="saas-input" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Yoga, Strength" />
                    </div>
                    <div className="saas-input-group">
                      <label className="saas-label">Experience (Years)</label>
                      <input className="saas-input" type="number" min="0" name="experienceYears" value={form.experienceYears} onChange={handleChange} />
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
                    <label className="saas-label">Certifications (one per line)</label>
                    <textarea className="saas-input" style={{ resize: 'vertical' }} rows="3" name="certifications" value={form.certifications} onChange={handleChange} placeholder="NASM Certified&#10;CPR/AED" />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Profile Image</label>
                    <div style={{ border: '1px solid var(--border-medium)', borderRadius: '8px', overflow: 'hidden' }}>
                      <ImageUploader
                        currentImage={form.profileImage}
                        onImageChange={(url) => setForm(prev => ({ ...prev, profileImage: url }))}
                        folder="ironfit-elite"
                        resource="trainers"
                        label=""
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="trainer-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Trainer'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trainers;
