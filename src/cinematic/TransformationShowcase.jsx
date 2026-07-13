import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const transformations = [
  {
    title: 'From Zero to Hero',
    desc: 'Our structured programs take you from absolute beginner to competition-ready. Every milestone tracked, every rep counted.',
    stat: '12 Weeks',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=85',
  },
  {
    title: 'Strength Redefined',
    desc: 'Progressive overload, periodized programming, and expert form coaching. Build raw power that translates to every aspect of life.',
    stat: '2x Strength',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=85',
  },
  {
    title: 'The Elite Edge',
    desc: 'Advanced athletes push beyond plateaus with our elite programming. Olympic lifts, plyometrics, and sport-specific conditioning.',
    stat: 'Pro Level',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=800&q=85',
  },
];

const TransformationShowcase = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const titleRef = useRef(null);
  const [counts, setCounts] = useState({ members: 0, sessions: 0, trainers: 0 });
  const counted = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards stagger
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animated counters
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || counted.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const targets = { members: 528, sessions: 12470, trainers: 15 };
          const duration = 2000;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCounts({
              members: Math.floor(eased * targets.members),
              sessions: Math.floor(eased * targets.sessions),
              trainers: Math.floor(eased * targets.trainers),
            });
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="transformations"
      style={{
        padding: '100px 0',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div
          ref={titleRef}
          style={{ textAlign: 'center', marginBottom: 64, opacity: 0 }}
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
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            Real Results
          </span>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-1.5px',
              textTransform: 'uppercase',
              color: '#fff',
              lineHeight: 1.05,
            }}
          >
            Transformations That{' '}
            <span style={{ color: '#ff6200' }}>Speak</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            marginBottom: 80,
          }}
        >
          {[
            { value: counts.members, label: 'Active Members', suffix: '+' },
            { value: counts.sessions, label: 'Training Sessions', suffix: '+' },
            { value: counts.trainers, label: 'Expert Coaches', suffix: '' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #ff6200, #ff4500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Transformation Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          {transformations.map((t, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#111',
                border: '1px solid rgba(255,255,255,0.04)',
                opacity: 0,
              }}
            >
              <div
                style={{
                  height: 240,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={t.image}
                  alt={t.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s',
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    padding: '6px 14px',
                    background: 'rgba(5,5,5,0.6)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 100,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#ff6200',
                    letterSpacing: '1px',
                    border: '1px solid rgba(255,98,0,0.15)',
                  }}
                >
                  {t.stat}
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 8,
                  }}
                >
                  {t.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#888',
                    lineHeight: 1.7,
                  }}
                >
                  {t.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransformationShowcase;
