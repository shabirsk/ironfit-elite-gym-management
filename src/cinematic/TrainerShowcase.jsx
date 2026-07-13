import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTrainers } from '../api/trainers';

gsap.registerPlugin(ScrollTrigger);

const TrainerShowcase = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    getTrainers({ status: 'active' })
      .then(setTrainers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
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
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [trainers.length]);

  if (loading) return null;

  return (
    <section
      ref={sectionRef}
      id="trainers"
      style={{
        padding: '100px 0',
        background: '#050505',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,98,0,0.03), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

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
            Elite Coaches
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
            Meet Your <span style={{ color: '#ff6200' }}>Mentors</span>
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {trainers.map((t, i) => (
            <div
              key={t._id}
              ref={(el) => (cardsRef.current[i] = el)}
              onMouseEnter={() => setActiveCard(i)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#111',
                border: activeCard === i
                  ? '1px solid rgba(255,98,0,0.2)'
                  : '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.4s ease',
                transform: activeCard === i ? 'translateY(-8px)' : 'translateY(0)',
                opacity: 0,
              }}
            >
              {/* Image */}
              <div
                style={{
                  height: 280,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {t.profileImage ? (
                  <img
                    src={t.profileImage}
                    alt={t.fullName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s',
                      transform: activeCard === i ? 'scale(1.08)' : 'scale(1)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #ff6200, #cc4e00)',
                      fontSize: '3rem',
                      fontWeight: 800,
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#fff',
                    }}
                  >
                    {t.fullName?.charAt(0) || 'T'}
                  </div>
                )}
                {/* Hover overlay with play icon */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(5,5,5,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: activeCard === i ? 1 : 0,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(255,98,0,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: 20 }}>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: activeCard === i ? '#ff6200' : '#fff',
                    marginBottom: 2,
                    transition: 'color 0.3s',
                  }}
                >
                  {t.fullName}
                </h3>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: '#666',
                    marginBottom: 12,
                  }}
                >
                  {t.specialization || 'Fitness Coach'}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#ff6200',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {t.experienceYears || 3}+
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Years
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#ff6200',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {t.assignedMembers?.length || 0}+
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Clients
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#ff6200',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      <a href={`mailto:${t.email}`} style={{ color: 'inherit' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </a>
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Email
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainerShowcase;
