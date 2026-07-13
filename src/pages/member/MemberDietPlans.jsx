import { useState, useEffect } from 'react';
import { getMyDietPlans } from '../../api/memberPortal';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const MemberDietPlans = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        const data = await getMyDietPlans();
        setDietPlans(data.dietPlans || []);
      } catch (err) {
        setError('Failed to load diet plans');
      } finally {
        setLoading(false);
      }
    };
    fetchDietPlans();
  }, []);

  const getTotalCalories = (meals) => {
    return meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
  };

  const totalMacros = (meals) => ({
    protein: meals?.reduce((s,m) => s + (m.protein || 0), 0) || 0,
    carbs: meals?.reduce((s,m) => s + (m.carbs || 0), 0) || 0,
    fats: meals?.reduce((s,m) => s + (m.fats || 0), 0) || 0,
  });

  if (loading) {
    return (
      <>
        <div className="mp-page-header"><h1>Diet Plans</h1><p>Your personalized nutrition plans</p></div>
        <div className="mp-grid">{ [1,2].map(i => <div key={i} className="mp-skeleton-card"><div className="mp-skeleton mp-skeleton-line" /><div className="mp-skeleton mp-skeleton-line" style={{width:'40%'}} /></div>) }</div>
      </>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <div className="mp-page-header">
        <h1>Diet Plans</h1>
        <p>Your personalized nutrition plans</p>
      </div>

      {error && <div className="mp-error-banner"><p>{error}</p></div>}

      {dietPlans.length === 0 ? (
        <div className="mp-card">
          <div className="mp-empty">
            <div className="mp-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            </div>
            <h3>No diet plans assigned</h3>
            <p>Your trainer will create a personalized nutrition plan for you</p>
          </div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {dietPlans.map(dp => (
            <motion.div key={dp.id || dp._id} variants={fadeUp}>
              <div className="mp-card">
                <div className="mp-card-header" style={{cursor:'pointer'}} onClick={() => setExpandedId(expandedId === (dp.id || dp._id) ? null : (dp.id || dp._id))}>
                  <div>
                    <div style={{fontSize:15,fontWeight:600}}>{dp.title}</div>
                    <div style={{display:'flex',gap:8,marginTop:4}}>
                      <span className="mp-badge mp-badge-iron">{(dp.goal || 'general_fitness').replace(/_/g,' ')}</span>
                      <span style={{fontSize:12,color:'var(--mp-text-tertiary)'}}>~{dp.dailyCalories || getTotalCalories(dp.meals)} cal/day</span>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--mp-text-tertiary)',transform:expandedId === (dp.id || dp._id) ? 'rotate(180deg)' : '',transition:'transform 0.2s'}}>
                    <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <AnimatePresence>
                  {expandedId === (dp.id || dp._id) && dp.meals?.length > 0 && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}>
                      <div className="mp-card-body">
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                          {dp.meals.map((meal, idx) => (
                            <div key={idx} className="mp-meal-card">
                              <div className="mp-meal-header">
                                <div className="mp-meal-name">{meal.name}</div>
                                {meal.time && <span className="mp-meal-time">{meal.time}</span>}
                              </div>
                              {meal.foods?.length > 0 && (
                                <div className="mp-meal-foods">
                                  {meal.foods.map((food, fi) => (
                                    <span key={fi} className="mp-meal-food">{food}</span>
                                  ))}
                                </div>
                              )}
                              <div className="mp-meal-macros">
                                {meal.calories > 0 && <span className="mp-meal-macro">🔥 {meal.calories} cal</span>}
                                {meal.protein > 0 && <span className="mp-meal-macro">💪 {meal.protein}g</span>}
                                {meal.carbs > 0 && <span className="mp-meal-macro">🌾 {meal.carbs}g</span>}
                                {meal.fats > 0 && <span className="mp-meal-macro">🧈 {meal.fats}g</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:16,padding:'12px 16px',background:'var(--mp-surface)',border:'1px solid var(--mp-border)',borderRadius:'var(--mp-radius-sm)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                            <span style={{fontSize:13,color:'var(--mp-text-tertiary)',fontWeight:500}}>Daily Totals</span>
                            <span style={{color:'var(--mp-iron)',fontSize:18,fontWeight:700}}>{dp.dailyCalories || getTotalCalories(dp.meals)} cal</span>
                          </div>
                          {dp.meals?.length > 0 && (
                            <div style={{display:'flex',gap:16,fontSize:12,color:'var(--mp-text-tertiary)'}}>
                              <span>Protein: {totalMacros(dp.meals).protein}g</span>
                              <span>Carbs: {totalMacros(dp.meals).carbs}g</span>
                              <span>Fats: {totalMacros(dp.meals).fats}g</span>
                            </div>
                          )}
                        </div>
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

export default MemberDietPlans;
