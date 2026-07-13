import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const LoadingScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const barRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => onComplete?.(),
        });
      },
    });

    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: 40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      )
      .fromTo(
        barRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.5, ease: 'power3.inOut' },
        '-=0.2'
      );
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      <div ref={logoRef} style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          IRON<span style={{ color: '#ff6200' }}>FIT</span>
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            letterSpacing: '8px',
            color: '#555',
            fontWeight: 300,
            marginTop: 4,
          }}
        >
          ELITE
        </div>
      </div>

      <div
        style={{
          width: 180,
          height: 2,
          background: '#1a1a1a',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <div
          ref={barRef}
          style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #ff6200, #ff4500)',
            borderRadius: 1,
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
          }}
        />
      </div>

      <div
        ref={subtitleRef}
        style={{
          fontSize: '0.7rem',
          color: '#555',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        Premium Fitness Training
      </div>
    </div>
  );
};

export default LoadingScreen;
