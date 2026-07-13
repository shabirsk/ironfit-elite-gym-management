import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimatedNumber = ({ end, duration = 3, delay = 0 }) => {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const spanRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started || !spanRef.current) return;
    
    let rafId;
    let startTime = null;
    let isVisible = false;
    let currentProgress = 0;

    const step = (timestamp) => {
      if (!isVisible) return; 
      
      if (!startTime) startTime = timestamp - (currentProgress * duration * 1000);
      
      const rawProgress = (timestamp - startTime) / (duration * 1000);
      currentProgress = Math.min(rawProgress, 1);
      
      const eased = 1 - Math.pow(1 - currentProgress, 3);
      setValue(Math.floor(eased * end));
      
      if (currentProgress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && currentProgress < 1) {
        startTime = null; 
        rafId = requestAnimationFrame(step);
      } else if (!isVisible && rafId) {
        cancelAnimationFrame(rafId);
      }
    }, { threshold: 0 });

    observer.observe(spanRef.current);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [started, end, duration]);

  return <span ref={spanRef}>{value}</span>;
};

const Hero = ({ onLoadingComplete }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const videoRef = useRef(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, []);
  
  useEffect(() => {
    if (onLoadingComplete) {
      setTimeout(() => onLoadingComplete(), 500);
    }

    const chars = textRef.current.querySelectorAll('.char');
    gsap.fromTo(
      chars,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.05,
        ease: 'power4.out',
        delay: 0.5,
      }
    );
  }, [onLoadingComplete]);

  const splitText = (text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="char inline-block" style={{ opacity: 0 }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section ref={containerRef} className="relative w-full min-h-screen overflow-hidden bg-iron-black landing-page">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full will-change-transform">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover object-center"
          poster="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80"
          style={{ willChange: 'transform' }}
        >
          <source src="https://videos.pexels.com/video-files/3255275/3255275-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        
        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-iron-black/70 via-iron-black/50 to-iron-black/95 mix-blend-multiply"></div>
        
        {/* Subtle gradient glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-iron-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      </div>

      {/* Floating Particles (CSS animated via Tailwind config) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 min-h-screen flex flex-col justify-center max-w-7xl pt-32 pb-24 lg:pt-40">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-12 h-[2px] bg-iron-gold"></div>
            <span className="text-iron-gold tracking-[0.3em] text-sm font-bold uppercase">
              Premium Fitness Experience
            </span>
          </motion.div>

          {/* GSAP Split Text */}
          <h1 
            ref={textRef} 
            className="font-cinematic text-6xl md:text-8xl lg:text-[100px] xl:text-[120px] leading-[0.9] font-bold text-iron-light uppercase mb-8 tracking-tight"
          >
            <div className="overflow-hidden">{splitText('DOMINATE')}</div>
            <div className="overflow-hidden text-transparent" style={{ WebkitTextStroke: '2px #FFFFFF' }}>
              {splitText('YOUR')}
            </div>
            <div className="overflow-hidden text-iron-gold text-glow">{splitText('LIMITS')}</div>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-xl md:text-2xl text-iron-light/70 max-w-2xl mb-12 font-light leading-relaxed"
          >
            Transform your body with world-class coaching, elite trainers, and cutting-edge fitness programs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link
              to="/member/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-iron-gold text-iron-black font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
              <span className="relative flex items-center gap-2">
                Join The Elite <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <button className="group flex items-center justify-center gap-4 px-8 py-4 text-iron-light font-medium hover:text-iron-gold transition-colors">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-iron-gold transition-colors">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent ml-1"></div>
              </div>
              Watch The Film
            </button>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-12 left-6 right-6 md:left-auto md:right-12 flex items-center gap-8 md:gap-16 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12"
        >
          <div>
            <div className="text-3xl md:text-4xl font-bold font-cinematic text-iron-light">
              <AnimatedNumber end={20} duration={3} delay={2} />K+
            </div>
            <div className="text-sm text-iron-light/50 tracking-wider uppercase mt-1">Active Members</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold font-cinematic text-iron-light">
              <AnimatedNumber end={150} duration={3} delay={2} />+
            </div>
            <div className="text-sm text-iron-light/50 tracking-wider uppercase mt-1">Elite Trainers</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold font-cinematic text-iron-gold">
              <AnimatedNumber end={98} duration={3} delay={2} />%
            </div>
            <div className="text-sm text-iron-light/50 tracking-wider uppercase mt-1">Success Rate</div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden md:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-iron-light/40" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} className="text-iron-gold" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
