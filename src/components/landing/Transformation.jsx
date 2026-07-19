import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';

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

const Transformation = () => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
      x.set(containerRef.current.offsetWidth / 2);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        x.set(containerRef.current.offsetWidth / 2);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x]);

  const clipPathBefore = useTransform(x, (val) => `inset(0 ${containerWidth - val}px 0 0)`);

  return (
    <section className="py-32 bg-iron-black relative overflow-hidden landing-page">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Text & Stats Content */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-8 h-[2px] bg-iron-gold"></div>
              <span className="text-iron-gold tracking-widest text-sm font-bold uppercase">Real Results</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-cinematic text-5xl md:text-6xl font-bold uppercase mb-6"
            >
              Defy Your <span className="text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>Genetics</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-iron-light/70 text-lg mb-10 leading-relaxed"
            >
              "I joined IronFit Elite looking for a change. In just 6 months, the elite coaching staff completely transformed my approach to fitness and nutrition. This isn't just a gym; it's a completely different standard of living."
              <br /><br />
              <span className="font-bold text-iron-light">— James Carter, Lost 45 lbs</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-8"
            >
              <div>
                <div className="text-4xl font-bold font-cinematic text-iron-gold mb-1">
                  <AnimatedNumber end={45} duration={3} /> lbs
                </div>
                <div className="text-xs uppercase tracking-widest text-iron-light/50">Fat Lost</div>
              </div>
              <div>
                <div className="text-4xl font-bold font-cinematic text-iron-gold mb-1">
                  <AnimatedNumber end={6} duration={3} /> Months
                </div>
                <div className="text-xs uppercase tracking-widest text-iron-light/50">Duration</div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Slider */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-iron-dark w-full max-w-md mx-auto shadow-2xl shadow-black"
              ref={containerRef}
            >
              {/* After Image (Background) */}
              <picture>
                <source srcSet="https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800" type="image/webp" />
                <img 
                  src="https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="After Transformation" 
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div className="absolute top-6 right-6 bg-iron-gold text-iron-black text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-lg">
                After
              </div>

              {/* Before Image (Clipped) */}
              <motion.div 
                className="absolute inset-0 w-full h-full z-10"
                style={{ clipPath: clipPathBefore, willChange: 'clip-path' }}
              >
                <picture>
                  <source srcSet="https://images.pexels.com/photos/3289711/pexels-photo-3289711.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800" type="image/webp" />
                  <img 
                    src="https://images.pexels.com/photos/3289711/pexels-photo-3289711.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="Before Transformation" 
                    className="absolute inset-0 w-full h-full object-cover select-none filter grayscale sepia-[0.3]"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    style={{ transform: 'translateZ(0)' }}
                  />
                </picture>
                <div className="absolute top-6 left-6 bg-iron-dark/80 text-white backdrop-blur-md text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-lg">
                  Before
                </div>
              </motion.div>

              {/* Drag Handle */}
              <motion.div
                className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-col-resize flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                style={{ x, touchAction: 'none', willChange: 'transform' }}
                drag="x"
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
              >
                <div className="w-10 h-10 rounded-full bg-white text-iron-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <ArrowLeftRight size={16} />
                </div>
              </motion.div>
            </motion.div>
            <p className="text-center text-iron-light/40 text-xs tracking-widest uppercase mt-6">Drag to compare</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Transformation;
