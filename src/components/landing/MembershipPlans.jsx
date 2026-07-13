import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { getPlans } = await import('../../api/plans');
        const data = await getPlans({ status: 'active' });
        setPlans(data.slice(0, 3)); // Display up to 3 plans for UI harmony
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <section id="membership" className="py-32 bg-iron-dark relative overflow-hidden landing-page">
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-iron-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="w-8 h-[2px] bg-iron-gold"></div>
            <span className="text-iron-gold tracking-widest text-sm font-bold uppercase">Membership</span>
            <div className="w-8 h-[2px] bg-iron-gold"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-cinematic text-5xl md:text-6xl font-bold uppercase mb-6"
          >
            Choose Your <span className="text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>Path</span>
          </motion.h2>
        </div>

        {loading ? (
          <div className="text-center text-iron-gold font-cinematic text-2xl animate-pulse">Loading Plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const highlight = index === 1; // Highlight middle plan
              return (
                <motion.div
                  key={plan._id || plan.planName}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03, y: -10, transition: { type: 'spring', stiffness: 400, damping: 10 } }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  style={{ willChange: 'transform' }}
                  className={`relative rounded-3xl p-8 flex flex-col ${
                    highlight 
                      ? 'bg-iron-black border border-iron-gold/50 shadow-[0_0_30px_rgba(255,193,7,0.15)] z-10' 
                      : 'bg-iron-black/40 border border-white/10 hover:border-white/30 transition-colors'
                  }`}
                >
                  {highlight && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-iron-gold text-iron-black text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-sm">
                      Recommended
                    </div>
                  )}

                  <div className="mb-8 border-b border-white/10 pb-8">
                    <h3 className="font-cinematic text-3xl font-bold uppercase mb-2 text-white">{plan.planName}</h3>
                    <p className="text-iron-light/60 text-sm mb-6 h-10">{plan.duration} Days Access</p>
                    <div className="flex items-end gap-1">
                      <span className="text-iron-gold text-2xl font-bold">$</span>
                      <span className="text-5xl font-cinematic font-bold text-white">
                        {plan.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <ul className="flex flex-col gap-4 mb-8">
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-iron-light/90">
                          <Check size={18} className="text-iron-gold mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/member/register"
                    className={`w-full py-4 text-sm font-bold uppercase tracking-widest rounded-sm transition-all text-center group relative overflow-hidden ${
                      highlight 
                        ? 'bg-iron-gold text-iron-black hover:bg-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="relative z-10">Select Plan</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MembershipPlans;
