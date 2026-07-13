import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPrograms } from '../api/programs';
gsap.registerPlugin(ScrollTrigger);

const FilmPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  // Ensure video plays (browser autoplay policies require user interaction fallback)
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const playPromise = el.play();
    if (playPromise) playPromise.catch(() => {
      const handler = () => { el.play(); document.removeEventListener('click', handler); };
      document.addEventListener('click', handler, { once: true });
    });
  }, []);

  // Camera-drift parallax on video background
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(videoRef.current?.parentElement, {
        yPercent: 15, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    getPrograms({ status: 'active' }).then(setPrograms).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section ref={sectionRef} style={{
      position: 'relative', width: '100vw', height: '100vh',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '120%', top: '-10%' }}>
        <video ref={videoRef} autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=85"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/programs-cardio.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(5,5,5,0.6) 0%, transparent 40%, rgba(5,5,5,0.5) 100%)',
        zIndex: 1,
      }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 900, padding: '0 32px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#ff6200', display: 'block', marginBottom: 24, textAlign: 'center' }}>
          OUR PROGRAMS
        </span>
        {loading ? (
          <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {programs.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ y: 40, opacity: 1 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '20px 28px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 16,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.6rem', color: '#555', letterSpacing: '2px' }}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{p.title}</h3>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#ff6200', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{p.category || 'Training'}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FilmPrograms;
