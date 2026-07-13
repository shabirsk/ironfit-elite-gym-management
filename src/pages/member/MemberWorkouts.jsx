import { useState, useEffect } from 'react';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { getMyWorkouts, updateWorkoutProgress } from '../../api/memberPortal';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const WorkoutIcon = ({ progress }) => {
  const icons = {
    completed: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    in_progress: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    not_started: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  };
  return icons[progress] || icons.not_started;
};

const MemberWorkouts = () => {
  const { user } = useMemberAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const data = await getMyWorkouts();
        setWorkouts(data.workouts || []);
      } catch (err) {
        setError('Failed to load workouts');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const handleProgressUpdate = async (id, progress) => {
    setUpdating(id);
    try {
      await updateWorkoutProgress(id, progress);
      setWorkouts(prev => prev.map(w => w._id === id ? { ...w, progress } : w));
    } catch (err) {
      setError('Failed to update progress');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <>
        <div className="mp-page-header"><h1>Workouts</h1><p>Your assigned workout programs</p></div>
        <div className="mp-grid">
          {[1,2,3].map(i => <div key={i} className="mp-skeleton-card"><div className="mp-skeleton mp-skeleton-line" /><div className="mp-skeleton mp-skeleton-line" style={{width:'60%'}} /></div>)}
        </div>
      </>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <div className="mp-page-header">
        <h1>Workouts</h1>
        <p>Your assigned workout programs</p>
      </div>

      {error && <div className="mp-error-banner"><p>{error}</p></div>}

      {workouts.length === 0 ? (
        <div className="mp-card">
          <div className="mp-empty">
            <div className="mp-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3>No workouts assigned</h3>
            <p>Your trainer will assign workouts tailored to your goals</p>
          </div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {workouts.map((w, idx) => (
            <motion.div key={w._id} variants={fadeUp}>
              <div className="mp-workout-card">
                <div className="mp-workout-header" onClick={() => setExpandedId(expandedId === w._id ? null : w._id)}>
                  <div className={`mp-workout-icon ${w.progress || 'not_started'}`}>
                    <WorkoutIcon progress={w.progress || 'not_started'} />
                  </div>
                  <div className="mp-workout-info">
                    <div className="mp-workout-title">{w.title}</div>
                    <div className="mp-workout-meta">
                      <span className={`mp-badge mp-badge-${w.difficulty === 'beginner' ? 'success' : w.difficulty === 'intermediate' ? 'warning' : 'danger'}`}>{w.difficulty}</span>
                      <span style={{fontSize:12,color:'var(--mp-text-tertiary)'}}>{w.durationWeeks} weeks</span>
                      <span className={`mp-badge ${w.progress === 'completed' ? 'mp-badge-success' : w.progress === 'in_progress' ? 'mp-badge-warning' : 'mp-badge-neutral'}`}>
                        {w.progress?.replace(/_/g, ' ') || 'not started'}
                      </span>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--mp-text-tertiary)',transform: expandedId === w._id ? 'rotate(180deg)' : '',transition:'transform 0.2s'}}>
                    <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <AnimatePresence>
                  {expandedId === w._id && (
                    <motion.div className="mp-workout-body" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}>
                      {w.description && (
                        <p style={{color:'var(--mp-text-tertiary)',fontSize:13,marginBottom:16}}>{w.description}</p>
                      )}
                      {w.exercises?.length > 0 && (
                        <div className="mp-table-container" style={{marginBottom:16}}>
                          <table className="mp-table">
                            <thead>
                              <tr>
                                <th>Exercise</th>
                                <th style={{textAlign:'center'}}>Sets</th>
                                <th style={{textAlign:'center'}}>Reps</th>
                                <th style={{textAlign:'center'}}>Weight</th>
                              </tr>
                            </thead>
                            <tbody>
                              {w.exercises.map((ex, idx) => (
                                <tr key={idx}>
                                  <td style={{fontWeight:500}}>{ex.name}</td>
                                  <td style={{textAlign:'center',color:'var(--mp-text-tertiary)'}}>{ex.sets}</td>
                                  <td style={{textAlign:'center',color:'var(--mp-text-tertiary)'}}>{ex.reps}</td>
                                  <td style={{textAlign:'center',color:'var(--mp-text-tertiary)'}}>{ex.weight || '---'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div style={{display:'flex',gap:8}}>
                        {['not_started','in_progress','completed'].map(p => (
                          <button
                            key={p}
                            onClick={() => handleProgressUpdate(w._id, p)}
                            disabled={updating === w._id || w.progress === p}
                            className={`mp-btn ${w.progress === p ? 'mp-btn-primary' : 'mp-btn-secondary'} mp-btn-sm`}
                          >
                            {updating === w._id ? '...' : p.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MemberWorkouts;
