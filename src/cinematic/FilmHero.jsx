import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const FilmHero = ({ onEnter }) => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  // Ensure video plays
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const playPromise = el.play();
    if (playPromise) playPromise.catch(() => {
      const handler = () => { el.play(); document.removeEventListener('click', handler); };
      document.addEventListener('click', handler, { once: true });
    });
  }, []);

  // Camera-drift parallax on video background (scroll-based, always works)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(videoRef.current?.parentElement, {
        yPercent: 15, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const words = ['TRANSFORM', 'YOUR', 'LIMITS'];

  return (
    <section ref={sectionRef} style={{
      position: 'relative', width: '100vw', height: '100vh',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '120%', top: '-10%' }}>
        <video ref={videoRef} autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=85"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/hero-workout.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(5,5,5,0.7) 0%, transparent 50%, rgba(5,5,5,0.3) 100%), linear-gradient(0deg, #050505 0%, transparent 40%)',
        zIndex: 1,
      }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(3rem, 12vw, 9rem)',
          fontWeight: 900, lineHeight: 0.92, letterSpacing: '-5px',
          textTransform: 'uppercase', color: '#fff', marginBottom: 28,
        }}>
          {words.map((w, i) => (
            <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
              <span style={{
                display: 'block',
                color: i === 2 ? '#ff6200' : '#fff',
                textShadow: i === 2 ? '0 0 60px rgba(255,98,0,0.3)' : 'none',
              }}>{w}</span>
            </span>
          ))}
        </h1>
        <p style={{
          fontSize: '1.125rem', color: '#888', maxWidth: 520,
          margin: '0 auto 36px', lineHeight: 1.7,
        }}>
          Elite training. Premium coaching. Unrelenting community.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onEnter} style={{
            padding: '16px 40px', background: 'linear-gradient(135deg, #ff6200, #ff4500)',
            color: '#fff', fontSize: '0.8125rem', fontWeight: 800,
            letterSpacing: '2px', textTransform: 'uppercase',
            border: 'none', borderRadius: 100, cursor: 'pointer',
            transition: 'all 0.3s',
          }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px) scale(1.02)'; e.target.style.boxShadow = '0 16px 48px rgba(255,98,0,0.3)'; }}
            onMouseLeave={(e) => { e.target.style.transform = ''; e.target.style.boxShadow = ''; }}
          >
            Enter the Arena
          </button>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
        zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: '0.6rem', color: '#555', letterSpacing: '3px', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{
          width: 1, height: 32,
          background: 'linear-gradient(to bottom, #ff6200, transparent)',
          animation: 'filmScrollPulse 2s ease-in-out infinite',
        }} />
      </div>
      <style>{`@keyframes filmScrollPulse { 0%,100% { opacity:1; transform:scaleY(1); } 50% { opacity:0.3; transform:scaleY(0.6); } }`}</style>
    </section>
  );
};

export default FilmHero;
