import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Utensils, Target, Flame, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan } from '../../api/dietPlans';
import { getMembers } from '../../api/members';

const EMPTY_FORM = {
  title: '', description: '', goal: 'general_fitness', dailyCalories: 0,
  assignedMemberId: '', trainerId: '', startDate: '', endDate: '', status: 'active',
  meals: [],
};

const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'muscle_building', label: 'Muscle Building' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'other', label: 'Other' },
];

const DietPlans = () => {
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [dietData, membersData] = await Promise.all([
        getDietPlans(),
        getMembers()
      ]);
      setPlans(dietData.dietPlans || []);
      setMembers(membersData.members || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, meals: [{ name: 'Breakfast', time: '', foods: '', calories: 0, protein: 0, carbs: 0, fats: 0 }] });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || '',
      description: p.description || '',
      goal: p.goal || 'general_fitness',
      dailyCalories: p.dailyCalories || 0,
      assignedMemberId: p.assignedMemberId?._id || '',
      trainerId: p.trainerId?._id || '',
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
      status: p.status,
      meals: p.meals?.length ? p.meals.map(m => ({
        ...m,
        foods: Array.isArray(m.foods) ? m.foods.join(', ') : m.foods
      })) : [],
    });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleMealChange = (index, field, value) => {
    const newMeals = [...form.meals];
    newMeals[index][field] = value;
    setForm(prev => ({ ...prev, meals: newMeals }));
  };

  const addMeal = () => {
    setForm(prev => ({ ...prev, meals: [...prev.meals, { name: '', time: '', foods: '', calories: 0, protein: 0, carbs: 0, fats: 0 }] }));
  };

  const removeMeal = (index) => {
    setForm(prev => ({ ...prev, meals: prev.meals.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        meals: form.meals.map(m => ({
          ...m,
          foods: typeof m.foods === 'string' ? m.foods.split(',').map(f => f.trim()).filter(f => f) : m.foods
        }))
      };
      
      if (!payload.assignedMemberId) delete payload.assignedMemberId;
      if (!payload.trainerId) delete payload.trainerId;
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;

      if (editing) {
        await updateDietPlan(editing, payload);
        addToast('Diet plan updated successfully', 'success');
      } else {
        await createDietPlan(payload);
        addToast('Diet plan created successfully', 'success');
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to save diet plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diet plan?')) return;
    try { 
      await deleteDietPlan(id); 
      addToast('Diet plan deleted', 'success');
      fetchData(); 
    } catch (err) { 
      addToast(err.message || 'Failed to delete diet plan', 'error'); 
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="font-bold text-primary" style={{ fontSize: '24px', marginBottom: '4px' }}>Diet Plans</h1>
          <p className="text-secondary text-sm">Manage nutrition guidelines and member diets.</p>
        </div>
        <button className="saas-btn saas-btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Diet Plan
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading diet plans...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {plans.map(p => (
            <motion.div 
              key={p._id} 
              className="saas-card"
              style={{ display: 'flex', flexDirection: 'column', opacity: p.status === 'inactive' ? 0.6 : 1, overflow: 'hidden', padding: 0 }}
              whileHover={{ y: -4 }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
                  <button className="saas-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', padding: '6px' }} onClick={() => openEdit(p)} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                    <Edit2 size={16} />
                  </button>
                  <button className="saas-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', padding: '6px' }} onClick={() => handleDelete(p._id)} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span className={`saas-badge ${p.status === 'active' ? 'success' : p.status === 'completed' ? 'primary' : 'warning'}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                  {p.goal && (
                    <span className="saas-badge default" style={{ border: '1px solid var(--border-light)' }}>
                      <Target size={12} style={{ marginRight: '4px' }} /> {p.goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', paddingRight: '48px' }}>{p.title}</h3>
                
                {p.assignedMemberId && (
                  <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
                    👤 Assigned to: {p.assignedMemberId.fullName}
                  </div>
                )}
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--status-warning-bg)', borderRadius: '8px', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flame size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Calories</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.dailyCalories}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--status-success-bg)', borderRadius: '8px', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Utensils size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Meals</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.meals?.length || 0}</div>
                    </div>
                  </div>
                </div>

                {p.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                )}

                {p.meals?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                    {p.meals.slice(0, 3).map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 12px', background: 'var(--bg-base)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{m.calories} kcal</span>
                      </div>
                    ))}
                    {p.meals.length > 3 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '4px', fontWeight: 500 }}>
                        + {p.meals.length - 3} more meals
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {plans.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-light)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
              No diet plans yet. Create your first meal plan template!
            </div>
          )}
        </div>
      )}

      {/* Slide-over form */}
      <AnimatePresence>
        {showForm && (
          <>
            <div className="drawer-overlay" onClick={() => setShowForm(false)} />
            <div className="drawer open" style={{ maxWidth: '600px' }}>
              <div className="drawer-header">
                <h2 className="drawer-title">{editing ? 'Edit Diet Plan' : 'New Diet Plan'}</h2>
                <button className="drawer-close" onClick={() => setShowForm(false)}><X size={20} /></button>
              </div>
              
              <div className="drawer-body">
                <form id="diet-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="saas-input" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Shredding Diet Phase 1" />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Goal</label>
                      <select className="saas-input" name="goal" value={form.goal} onChange={handleChange}>
                        {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Daily Calories</label>
                      <input className="saas-input" type="number" name="dailyCalories" value={form.dailyCalories} onChange={handleChange} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Assign to Member</label>
                      <select className="saas-input" name="assignedMemberId" value={form.assignedMemberId} onChange={handleChange}>
                        <option value="">No one (Template)</option>
                        {members.map(m => <option key={m._id} value={m._id}>{m.fullName}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="saas-input" name="status" value={form.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="saas-input" style={{ resize: 'vertical' }} rows="3" name="description" value={form.description} onChange={handleChange} />
                  </div>

                  <div style={{ marginTop: '32px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Meals</h3>
                    <button type="button" className="saas-btn saas-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={addMeal}>
                      <Plus size={14} /> Add Meal
                    </button>
                  </div>

                  {form.meals.map((meal, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-base)', padding: '20px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Meal {idx + 1}</h4>
                        <button type="button" onClick={() => removeMeal(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                          Remove
                        </button>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Meal Name</label>
                          <input className="saas-input" style={{ fontSize: '13px', padding: '8px 12px' }} value={meal.name} onChange={(e) => handleMealChange(idx, 'name', e.target.value)} required placeholder="Breakfast" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Time</label>
                          <input className="saas-input" style={{ fontSize: '13px', padding: '8px 12px' }} value={meal.time} onChange={(e) => handleMealChange(idx, 'time', e.target.value)} placeholder="08:00 AM" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Calories</label>
                          <input className="saas-input" style={{ fontSize: '13px', padding: '8px 12px' }} type="number" value={meal.calories} onChange={(e) => handleMealChange(idx, 'calories', e.target.value)} />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Foods (comma separated)</label>
                        <input className="saas-input" style={{ fontSize: '13px', padding: '8px 12px' }} value={meal.foods} onChange={(e) => handleMealChange(idx, 'foods', e.target.value)} placeholder="Oats, Banana, Almond Milk" />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Protein (g)</label>
                          <input className="saas-input" style={{ fontSize: '13px', padding: '8px 12px' }} type="number" value={meal.protein} onChange={(e) => handleMealChange(idx, 'protein', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Carbs (g)</label>
                          <input className="saas-input" style={{ fontSize: '13px', padding: '8px 12px' }} type="number" value={meal.carbs} onChange={(e) => handleMealChange(idx, 'carbs', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Fats (g)</label>
                          <input className="saas-input" style={{ fontSize: '13px', padding: '8px 12px' }} type="number" value={meal.fats} onChange={(e) => handleMealChange(idx, 'fats', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {form.meals.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border-medium)', borderRadius: '8px', color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '24px' }}>
                      No meals added. Click "Add Meal" to start building this diet plan.
                    </div>
                  )}
                </form>
              </div>
              <div className="drawer-footer">
                <button type="button" className="saas-btn saas-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" form="diet-form" className="saas-btn saas-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Diet Plan'}
                </button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DietPlans;
