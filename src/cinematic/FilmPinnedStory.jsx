import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const chapters = [
  { title: 'PREMIUM EQUIPMENT', stat: '50+ MACHINES', desc: 'State-of-the-art machines from the world\'s leading manufacturers. Every tool you need to forge your best physique.' },
  { title: 'EXPERT COACHING', stat: '15+ TRAINERS', desc: 'Certified coaches with decades of combined experience. Every session personalized to your body and your goals.' },
  { title: 'UNRELENTING COMMUNITY', stat: '500+ MEMBERS', desc: 'Train alongside athletes, entrepreneurs, and champions. More than a gym — a brotherhood and sisterhood of grind.' },
  { title: 'PROVEN RESULTS', stat: '95% SATISFACTION', desc: 'Transformations that speak for themselves. Scientifically backed programs delivered with military precision.' },
];

const FilmPinnedStory = () => {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const textRef = useRef(null);
  const progressRef = useRef(null);
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
    const ctx = gsap.context(() => {
      const panels = textRef.current?.querySelectorAll('.story-panel');
      if (!panels?.length) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=' + (panels.length * 120) + '%',
        pin: pinRef.current,
        pinSpacing: true,
      });

      panels.forEach((panel, i) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: (i * 25) + '%',
            end: ((i + 1) * 25) + '%',
            scrub: 1.2,
          },
        })
        .fromTo(panel, { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1 })
        .to(panel, { opacity: 0, y: -40, scale: 0.95 }, 0.5);
      });

      gsap.fromTo(progressRef.current, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '+=' + (panels.length * 120) + '%', scrub: 0.5 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: chapters.length * 120 + 'vh' }}>
      <div ref={pinRef} style={{ position: 'absolute', inset: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '130%', top: '-15%' }}>
          <video ref={videoRef} autoPlay muted loop playsInline
            poster="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1920&q=85"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src="/videos/story-gym.mp4" type="video/mp4" />
          </video>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.3) 60%, transparent 100%), linear-gradient(0deg, #050505 0%, transparent 30%)',
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 2, background: 'rgba(255,255,255,0.04)', zIndex: 5 }}>
          <div ref={progressRef} style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #ff6200, #ff4500)', transformOrigin: 'left center', transform: 'scaleX(0)' }} />
        </div>
        <div ref={textRef} style={{ position: 'relative', zIndex: 4, maxWidth: 640, padding: '0 48px' }}>
          {chapters.map((c, i) => (
            <div key={i} className="story-panel" style={{
              position: 'absolute', left: 48, right: 48,
              opacity: i === 0 ? 1 : 0,
              transform: i === 0 ? 'translateY(0)' : 'translateY(20px)',
              pointerEvents: 'none',
            }}>
              <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#ff6200', marginBottom: 16, padding: '6px 14px', border: '1px solid rgba(255,98,0,0.15)', borderRadius: 100, background: 'rgba(255,98,0,0.06)' }}>
                {String(i + 1).padStart(2, '0')} — {c.stat}
              </span>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.5px', textTransform: 'uppercase', color: '#fff', marginBottom: 20 }}>{c.title}</h2>
              <p style={{ fontSize: '1.0625rem', color: '#999', lineHeight: 1.7, maxWidth: 480 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FilmPinnedStory;
