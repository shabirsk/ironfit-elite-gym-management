import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const defaultImage = "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800";

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const { getTrainers } = await import('../../api/trainers');
        const data = await getTrainers({ status: 'active' });
        // Display top 4 trainers based on experience or just slice
        setTrainers(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  return (
    <section id="trainers" className="py-32 bg-iron-black relative overflow-hidden landing-page">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="w-8 h-[2px] bg-iron-gold"></div>
            <span className="text-iron-gold tracking-widest text-sm font-bold uppercase">Our Coaches</span>
            <div className="w-8 h-[2px] bg-iron-gold"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-cinematic text-5xl md:text-6xl font-bold uppercase mb-6 text-white"
          >
            The <span className="text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>Elite</span> Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-iron-light/60 max-w-2xl mx-auto"
          >
            Train with industry-leading experts. Our coaches don't just instruct; they engineer your success.
          </motion.p>
        </div>

        {loading ? (
          <div className="text-center text-iron-gold font-cinematic text-2xl animate-pulse">Loading Coaches...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer, index) => (
              <motion.div
                key={trainer._id || trainer.fullName}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src={trainer.profileImage || defaultImage}
                    alt={trainer.fullName}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1 filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-iron-black via-iron-black/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-iron-gold text-xs font-bold uppercase tracking-widest mb-2 block">
                      {trainer.specialization || 'Fitness Coach'}
                    </span>
                    <h3 className="font-cinematic text-3xl font-bold uppercase text-white mb-1">
                      {trainer.fullName}
                    </h3>
                    <p className="text-iron-light/60 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {trainer.experienceYears} Years Experience
                    </p>
                    
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                      <a href="#" className="text-white hover:text-iron-gold transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </a>
                      <a href="#" className="text-white hover:text-iron-gold transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Trainers;
