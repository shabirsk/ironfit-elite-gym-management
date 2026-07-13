import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTrainers } from '../api/trainers';
gsap.registerPlugin(ScrollTrigger);

const FilmTrainers = () => {
  const [trainers, setTrainers] = useState([]);
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
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    getTrainers({ status: 'active' }).then(setTrainers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section ref={sectionRef} style={{
      position: 'relative', width: '100vw', minHeight: '100vh',
      overflow: 'hidden', padding: '80px 0', display: 'flex', alignItems: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <video ref={videoRef} autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&q=85"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/trainers-yoga.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(5,5,5,0.75) 0%, transparent 40%, rgba(5,5,5,0.6) 100%), linear-gradient(0deg, #050505 0%, transparent 20%, transparent 80%, #050505 100%)',
        zIndex: 1,
      }} />
      
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#ff6200' }}>
            ELITE COACHES
          </span>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-1.5px', textTransform: 'uppercase', color: '#fff', lineHeight: 1.05, marginTop: 12 }}>
            Your <span style={{ color: '#ff6200' }}>Mentors</span>
          </h2>
        </div>

        {loading ? (
          <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {trainers.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ y: 30 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ height: 240, overflow: 'hidden', position: 'relative' }}>
                  {t.profileImage ? (
                    <img src={t.profileImage} alt={t.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ff6200, #cc4e00)', fontSize: '3rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
                      {t.fullName?.charAt(0) || 'T'}
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.8), transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{t.fullName}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#aaa' }}>{t.specialization || 'Fitness Coach'}</p>
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

export default FilmTrainers;
