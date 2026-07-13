import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { submitContactForm } from '../api/contact';
gsap.registerPlugin(ScrollTrigger);

const FilmCTA = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');

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

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult('');
    try {
      const res = await submitContactForm(form);
      setResult(res.message || 'Thank you!');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setResult(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} style={{
      position: 'relative', width: '100vw', height: '100vh',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <video ref={videoRef} autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=85"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/videos/cta-class.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.3) 100%)', zIndex: 1 }} />

      <motion.div
        initial={{ y: 30 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative', zIndex: 2,
          background: 'rgba(5,5,5,0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: '40px 48px',
          maxWidth: 500,
          width: '90%',
        }}
      >
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 8 }}>
          Join <span style={{ color: '#ff6200' }}>IronFit Elite</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#888', textAlign: 'center', marginBottom: 24 }}>
          Begin your transformation today
        </p>

        {result && (
          <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '0.875rem', textAlign: 'center' }}>
            {result}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required
            style={{
              padding: '14px 16px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
              color: '#fff', fontSize: '0.9375rem',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff6200'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
          />
          <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} required
            style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#fff', fontSize: '0.9375rem', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#ff6200'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
          />
          <textarea name="message" placeholder="Your Message" value={form.message} onChange={handleChange} required rows={3}
            style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: '#fff', fontSize: '0.9375rem', resize: 'vertical', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#ff6200'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
          />
          <button type="submit" disabled={submitting}
            style={{
              padding: '14px 24px', background: 'linear-gradient(135deg, #ff6200, #ff4500)',
              color: '#fff', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '1.5px',
              textTransform: 'uppercase', border: 'none', borderRadius: 100, cursor: 'pointer',
              marginTop: 4, transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(255,98,0,0.3)'; }}
            onMouseLeave={(e) => { e.target.style.transform = ''; e.target.style.boxShadow = ''; }}
          >
            {submitting ? 'SENDING...' : 'BEGIN JOURNEY'}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default FilmCTA;
