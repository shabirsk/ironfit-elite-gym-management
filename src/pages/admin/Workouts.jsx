import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, UserPlus, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getWorkouts, createWorkout, updateWorkout, deleteWorkout, assignToMember, updateProgress } from '../../api/workouts';
import { getMembers } from '../../api/members';
import { getTrainers } from '../../api/trainers';

const EMPTY_FORM = {
  title: '', description: '', difficulty: 'beginner',
  durationWeeks: '', exercises: '', trainerId: '', status: 'active',
};

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const PROGRESS_OPTS = ['not_started', 'in_progress', 'completed'];

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [assignMember, setAssignMember] = useState('');

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [wData, mData, tData] = await Promise.all([
        getWorkouts(), getMembers(), getTrainers(),
      ]);
      setWorkouts(wData);
      setMembers(mData.members);
      setTrainers(tData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (w) => {
    setForm({
      title: w.title,
      description: w.description || '',
      difficulty: w.difficulty,
      durationWeeks: w.durationWeeks,
      exercises: w.exercises?.map(e => `${e.name}|${e.sets}|${e.reps}|${e.weight}|${e.notes}`).join('\n') || '',
      trainerId: w.trainerId?._id || '',
      status: w.status,
    });
    setEditing(w._id);
    setShowForm(true);
  };

  const parseExercises = (str) => {
    return str.split('\n').filter(Boolean).map(line => {
      const parts = line.split('|');
      return {
        name: parts[0]?.trim() || '',
        sets: parseInt(parts[1]) || 3,
        reps: parts[2]?.trim() || '12',
        weight: parts[3]?.trim() || '',
        notes: parts[4]?.trim() || '',
      };
    }).filter(e => e.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        durationWeeks: Number(form.durationWeeks),
        exercises: parseExercises(form.exercises),
      };
      
      if (!payload.trainerId) {
        payload.trainerId = null;
      }

      if (editing) {
        await updateWorkout(editing, payload);
        addToast('Workout updated successfully', 'success');
      } else {
        await createWorkout(payload);
        addToast('Workout created successfully', 'success');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to save workout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workout plan?')) return;
    try {
      await deleteWorkout(id);
      addToast('Workout deleted', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to delete workout', 'error');
    }
  };

  const handleAssign = async (id) => {
    if (!assignMember) return;
    try {
      await assignToMember(id, assignMember);
      addToast('Workout assigned successfully', 'success');
      setAssigning(null);
      setAssignMember('');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to assign workout', 'error');
    }
  };

  const handleProgress = async (id, progress) => {
    try {
      await updateProgress(id, progress);
      addToast('Progress updated', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to update progress', 'error');
    }
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'beginner': return 'var(--success)';
      case 'intermediate': return 'var(--warning)';
      case 'advanced': return 'var(--danger)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Workout Plans</h1>
          <p className="text-secondary text-sm">Create templates and assign workouts to members.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Workout
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading workouts...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {workouts.map(w => (
            <motion.div 
              key={w._id} 
              className="saas-card"
              style={{ 
                opacity: w.status === 'inactive' ? 0.6 : 1, 
                padding: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative', 
                overflow: 'hidden' 
              }}
              whileHover={{ y: -2 }}
            >
              {/* Header */}
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{w.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', fontWeight: 500 }}>
                    <span style={{ color: getDifficultyColor(w.difficulty), textTransform: 'uppercase', letterSpacing: '0.05em' }}>{w.difficulty}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{w.durationWeeks} Weeks</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{w.exercises?.length || 0} Exercises</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="p-2 rounded-md hover:bg-surface text-tertiary hover:text-primary transition-colors" onClick={() => openEdit(w)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 rounded-md text-tertiary hover:text-danger transition-colors" onClick={() => handleDelete(w._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', flex: 1 }}>
                {w.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>{w.description}</p>}

                {w.exercises?.length > 0 ? (
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table className="saas-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '8px 12px' }}>Exercise</th>
                          <th style={{ padding: '8px 12px' }}>Sets x Reps</th>
                          <th style={{ padding: '8px 12px' }}>Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {w.exercises.map((ex, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px 12px', fontSize: '13px' }}>{ex.name}</td>
                            <td style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{ex.sets} × {ex.reps}</td>
                            <td style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{ex.weight || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-medium)', borderRadius: '8px', fontSize: '13px' }}>
                    No exercises added.
                  </div>
                )}
              </div>

              {/* Footer / Assignment */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px' }}>
                  {w.assignedMemberId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Assigned to:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{w.assignedMemberId.fullName}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>Not assigned</span>
                  )}
                </div>

                <div>
                  {w.assignedMemberId ? (
                    <select
                      className="saas-input"
                      style={{ padding: '4px 8px', fontSize: '12px', marginBottom: 0, height: '32px' }}
                      value={w.progress}
                      onChange={(e) => handleProgress(w._id, e.target.value)}
                    >
                      {PROGRESS_OPTS.map(p => <option key={p} value={p}>{p.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                  ) : (
                    <button className="saas-btn saas-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setAssigning(w._id)}>
                      <UserPlus size={14} /> Assign
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment Overlay */}
              <AnimatePresence>
                {assigning === w._id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(8px)', zIndex: 10, display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: 'inherit' }}
                  >
                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>Assign Workout</h4>
                    <select className="saas-input mb-4" value={assignMember} onChange={(e) => setAssignMember(e.target.value)}>
                      <option value="">Select a Member...</option>
                      {members.map(m => (
                         <option key={m._id} value={m._id}>{m.fullName} ({m.email})</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                      <button className="saas-btn saas-btn-secondary" style={{ flex: 1, border: 'none', background: 'var(--bg-surface)' }} onClick={() => { setAssigning(null); setAssignMember(''); }}>Cancel</button>
                      <button className="saas-btn saas-btn-primary" style={{ flex: 1 }} onClick={() => handleAssign(w._id)} disabled={!assignMember}>Assign</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {workouts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-medium)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
              No workouts yet. Create your first workout template!
            </div>
          )}
        </div>
      )}

      {/* Form Slide-over */}
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
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{editing ? 'Edit Workout' : 'New Workout'}</h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <form id="workout-form" onSubmit={handleSubmit}>
                  <div className="saas-input-group">
                    <label className="saas-label">Title *</label>
                    <input className="saas-input" name="title" value={form.title} onChange={handleChange} required placeholder="Full Body Hypertrophy" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="saas-input-group">
                      <label className="saas-label">Duration (weeks) *</label>
                      <input className="saas-input" type="number" min="1" name="durationWeeks" value={form.durationWeeks} onChange={handleChange} required />
                    </div>
                    <div className="saas-input-group">
                      <label className="saas-label">Difficulty</label>
                      <select className="saas-input" name="difficulty" value={form.difficulty} onChange={handleChange}>
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
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
                    <label className="saas-label">Description</label>
                    <textarea className="saas-input" style={{ resize: 'vertical' }} rows="3" name="description" value={form.description} onChange={handleChange} />
                  </div>
                  <div className="saas-input-group">
                    <label className="saas-label">Exercises (Name | Sets | Reps | Weight | Notes)</label>
                    <textarea className="saas-input" style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} rows="6" name="exercises" value={form.exercises} onChange={handleChange} placeholder="Bench Press | 4 | 10 | 135lb | Barbell&#10;Squats | 3 | 12 | 185lb | Deep" />
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Use pipe '|' to separate columns. One exercise per line.</span>
                  </div>
                </form>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-surface)' }}>
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="workout-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Workout'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workouts;
