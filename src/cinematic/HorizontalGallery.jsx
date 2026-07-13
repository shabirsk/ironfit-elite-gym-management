import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPrograms } from '../api/programs';

gsap.registerPlugin(ScrollTrigger);

const HorizontalGallery = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrograms({ status: 'active' })
      .then(setPrograms)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!programs.length || !trackRef.current) return;

    let st = null;

    const setupScroll = () => {
      if (st) st.kill();
      const track = trackRef.current;
      if (!track) return;
      const totalWidth = track.scrollWidth;
      const viewportWidth = window.innerWidth;
      const maxScroll = Math.max(totalWidth - viewportWidth, 0);

      st = gsap.to(track, {
        x: -maxScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${maxScroll + viewportWidth}`,
          pin: true,
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });
      ScrollTrigger.refresh();
    };

    const timer = setTimeout(setupScroll, 200);

    const handleResize = () => {
      clearTimeout(timer);
      setTimeout(setupScroll, 200);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (st) st.kill();
    };
  }, [programs.length]);

  if (loading) return null;

  const colors = ['#ff6200', '#ff4500', '#cc4e00', '#ff8533', '#e55a00'];

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: '#050505',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#ff6200',
            padding: '6px 14px',
            border: '1px solid rgba(255,98,0,0.15)',
            borderRadius: 100,
            background: 'rgba(255,98,0,0.06)',
          }}
        >
          Our Programs
        </span>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-1px',
            textTransform: 'uppercase',
            color: '#fff',
            marginTop: 12,
          }}
        >
          Explore <span style={{ color: '#ff6200' }}>Programs</span>
        </h2>
      </div>

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 0,
          height: '100vh',
          alignItems: 'center',
          padding: '0 10vw',
          willChange: 'transform',
        }}
      >
        {programs.map((p, i) => (
          <div
            key={p._id}
            style={{
              minWidth: '70vw',
              height: '60vh',
              marginRight: 48,
              borderRadius: 24,
              overflow: 'hidden',
              position: 'relative',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              flexShrink: 0,
            }}
          >
            {p.image && (
              <img
                src={p.image}
                alt={p.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 60%)',
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '48px',
              }}
            >
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: colors[i % colors.length],
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                {String(i + 1).padStart(2, '0')} — {p.category || 'Training'}
              </span>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: 12,
                  letterSpacing: '-0.5px',
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: '#888',
                  maxWidth: 400,
                  lineHeight: 1.6,
                }}
              >
                {p.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HorizontalGallery;
