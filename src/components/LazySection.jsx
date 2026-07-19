import { useState, useRef, useEffect } from 'react';

const LazySection = ({ placeholder, margin = '200px', once = true, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        }
      },
      { rootMargin: margin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [margin, once]);

  return (
    <div ref={ref}>
      {isVisible ? children : (placeholder || null)}
    </div>
  );
};

export default LazySection;
