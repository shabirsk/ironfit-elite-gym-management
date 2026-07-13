import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const mouseGlowRef = useRef(null);
  const statsRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline reveal
      gsap.fromTo(
        headlineRef.current?.querySelectorAll('.hero-word'),
        { opacity: 0, y: 120, rotateX: 30 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power4.out',
          delay: 0.5,
        }
      );

      // Subtitle fade
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.2, ease: 'power2.out' }
      );

      // CTA fade
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 1.6, ease: 'power2.out' }
      );

      // Stats fade
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.8, ease: 'power2.out' }
      );

      // Parallax video
      gsap.to('.hero-video-wrap', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Fade overlay on scroll
      gsap.to('.hero-overlay', {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom 40%',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const scrollToStory = () => {
    const el = document.querySelector('#story');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const words = ['Transform', 'Your', 'Limits'];

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Video Background */}
      <div
        className="hero-video-wrap"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '120%',
          top: '-10%',
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=85"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="https://videos.pexels.com/video-files/26012709/11994470_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div
        className="hero-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(135deg, rgba(5,5,5,0.7) 0%, transparent 50%, rgba(5,5,5,0.3) 100%),
            linear-gradient(0deg, #050505 0%, transparent 40%)
          `,
          opacity: 0.6,
          transition: 'opacity 0.1s',
        }}
      />

      {/* Mouse Glow */}
      <div
        ref={mouseGlowRef}
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,98,0,0.06), transparent 60%)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          left: mousePos.x,
          top: mousePos.y,
          zIndex: 2,
          transition: 'left 0.3s ease-out, top 0.3s ease-out',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 1000,
        }}
      >
        <h1
          ref={headlineRef}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-4px',
            textTransform: 'uppercase',
            color: '#fff',
            marginBottom: 24,
          }}
        >
          {words.map((word, i) => (
            <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
              <span
                className="hero-word"
                style={{
                  display: 'block',
                  opacity: 0,
                  color: i === 2 ? '#ff6200' : '#fff',
                  textShadow: i === 2 ? '0 0 40px rgba(255,98,0,0.3)' : 'none',
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontSize: '1.125rem',
            color: '#888',
            maxWidth: 560,
            margin: '0 auto 40px',
            lineHeight: 1.7,
            opacity: 0,
          }}
        >
          Unleash your true potential with world-class coaching,
          cutting-edge equipment, and an unrelenting community.
        </p>

        <div
          ref={ctaRef}
          style={{ opacity: 0, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={scrollToStory}
            style={{
              padding: '18px 44px',
              background: 'linear-gradient(135deg, #ff6200, #ff4500)',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 100,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 16px 48px rgba(255,98,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = '';
              e.target.style.boxShadow = '';
            }}
          >
            Begin Your Journey
          </button>
          <button
            onClick={scrollToStory}
            style={{
              padding: '18px 44px',
              background: 'transparent',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 100,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#ff6200';
              e.target.style.background = 'rgba(255,98,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.15)';
              e.target.style.background = 'transparent';
            }}
          >
            Watch Film
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        ref={statsRef}
        style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 48,
          zIndex: 3,
          opacity: 0,
        }}
      >
        {[
          { number: '500+', label: 'Active Members' },
          { number: '15+', label: 'Expert Trainers' },
          { number: '5+', label: 'Years Legacy' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#ff6200',
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {stat.number}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.5,
        }}
      >
        <span style={{ fontSize: '0.6rem', color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 30,
            background: 'linear-gradient(to bottom, #ff6200, transparent)',
            animation: 'scrollPulse 2s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.3; transform: scaleY(0.6); }
        }
      `}</style>
    </section>
  );
};

export default CinematicHero;
