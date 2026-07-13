import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  {
    title: 'Premium Equipment',
    desc: 'State-of-the-art machines and free weights from the world\'s leading manufacturers. Every tool you need to forge your best physique.',
    stat: '50+ Machines',
  },
  {
    title: 'Expert Coaching',
    desc: 'Our certified trainers bring decades of combined experience. Each session is personalized to your goals, your body, your timeline.',
    stat: '15+ Trainers',
  },
  {
    title: 'Unrelenting Community',
    desc: 'Train alongside athletes, entrepreneurs, and champions. IronFit Elite is more than a gym — it\'s a brotherhood and sisterhood of grind.',
    stat: '500+ Members',
  },
  {
    title: 'Proven Results',
    desc: 'Our members achieve transformations that speak for themselves. Scientifically backed programs delivered with military precision.',
    stat: '95% Satisfaction',
  },
];

const PinnedStorySection = () => {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const textRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = textRef.current?.querySelectorAll('.story-panel');
      if (!panels?.length) return;

      // Pin the section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${panels.length * 100}%`,
        pin: pinRef.current,
        pinSpacing: true,
        scrub: 1,
      });

      // Animate each panel
      panels.forEach((panel, i) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `${i * (100 / panels.length)}%`,
            end: `${(i + 1) * (100 / panels.length)}%`,
            scrub: 1.5,
          },
        });

        tl.fromTo(
          panel,
          { opacity: 0, y: 40, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5 }
        ).to(panel, {
          opacity: 0,
          y: -30,
          scale: 0.97,
          duration: 0.3,
        }, `-=${0.3}`);
      });

      // Progress bar
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${panels.length * 100}%`,
            scrub: 0.5,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="story"
      style={{
        position: 'relative',
        height: `${chapters.length * 100}vh`,
      }}
    >
      {/* Pinned Content */}
      <div
        ref={pinRef}
        style={{
          position: 'absolute',
          inset: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Video Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1920&q=85"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="https://videos.pexels.com/video-files/3848679/3848679-uhd_2560_1440_30fps.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.4) 50%, transparent 100%),
              linear-gradient(0deg, #050505 0%, transparent 30%)
            `,
          }}
        />

        {/* Progress Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 2,
            background: 'rgba(255,255,255,0.05)',
            zIndex: 5,
          }}
        >
          <div
            ref={progressRef}
            style={{
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, #ff6200, #ff4500)',
              transformOrigin: 'left center',
              transform: 'scaleX(0)',
            }}
          />
        </div>

        {/* Text Panels */}
        <div
          ref={textRef}
          style={{
            position: 'relative',
            zIndex: 4,
            maxWidth: 640,
            padding: '0 48px',
          }}
        >
          {chapters.map((chapter, i) => (
            <div
              key={i}
              className="story-panel"
              style={{
                position: 'absolute',
                left: 48,
                right: 48,
                opacity: 0,
                transform: 'translateY(20px)',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#ff6200',
                  marginBottom: 16,
                  padding: '6px 14px',
                  border: '1px solid rgba(255,98,0,0.15)',
                  borderRadius: 100,
                  background: 'rgba(255,98,0,0.06)',
                }}
              >
                {String(i + 1).padStart(2, '0')} — {chapter.stat}
              </span>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-1.5px',
                  textTransform: 'uppercase',
                  color: '#fff',
                  marginBottom: 20,
                }}
              >
                {chapter.title}
              </h2>
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: '#999',
                  lineHeight: 1.7,
                  maxWidth: 480,
                }}
              >
                {chapter.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PinnedStorySection;
