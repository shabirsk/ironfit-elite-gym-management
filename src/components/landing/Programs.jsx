import { useState, useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

const defaultImage = "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800";

const ProgramCard = ({ program, index }) => {
  const cardRef = useRef(null);
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const y = useSpring(0, { stiffness: 300, damping: 30 });

  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 20); // max rotation degrees
    y.set(yPct * -20);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Provide some default spans for layout variation based on index if not set
  let spanClass = "col-span-1 row-span-1";
  if (index === 0) spanClass = "col-span-1 md:col-span-2 row-span-2";
  if (index === 3) spanClass = "col-span-1 row-span-2";
  if (index === 4) spanClass = "col-span-1 md:col-span-2 row-span-1";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateY: x, rotateX: y, transformPerspective: 1000, willChange: 'transform' }}
      className={`relative group rounded-3xl overflow-hidden bg-iron-dark ${spanClass}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={program.image || defaultImage} 
          alt={program.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
          loading="lazy"
          decoding="async"
          style={{ transform: 'translateZ(0)', willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-iron-black via-iron-black/40 to-transparent"></div>
      </div>

      {/* Glow Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-iron-gold/30 rounded-3xl transition-colors duration-500 pointer-events-none"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8 z-10">
        <div className="flex justify-between items-start">
          {program.category && (
            <span className="px-3 py-1 bg-iron-gold text-iron-black text-xs font-bold uppercase tracking-wider rounded-sm">
              {program.category}
            </span>
          )}
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 ml-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-iron-gold"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </div>
        </div>
        
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 mt-20">
          <h3 className="font-cinematic text-3xl font-bold text-white mb-2 uppercase">{program.title}</h3>
          <p className="text-iron-light/70 text-sm mb-6 max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{program.description}</p>
          <Link to="/member/register" className="inline-block text-iron-gold text-sm font-bold tracking-wider uppercase hover:text-white transition-colors">
            Explore Program
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { getPrograms } = await import('../../api/programs');
        const data = await getPrograms({ status: 'active' });
        // Sort by sortOrder and take top 6 to fit the layout
        setPrograms(data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <section id="programs" ref={containerRef} className="py-32 bg-iron-black relative overflow-hidden landing-page">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-8 h-[2px] bg-iron-gold"></div>
              <span className="text-iron-gold tracking-widest text-sm font-bold uppercase">Elite Programs</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-cinematic text-5xl md:text-7xl font-bold uppercase"
            >
              Train With <span className="text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>Purpose</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-iron-light/60 max-w-sm"
          >
            Scientifically designed training programs tailored to sculpt your physique and elevate your performance.
          </motion.p>
        </div>

        {loading ? (
          <div className="text-center text-iron-gold font-cinematic text-2xl animate-pulse py-20">Loading Programs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
            {programs.map((program, index) => (
              <ProgramCard key={program._id || program.title} program={program} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Programs;
