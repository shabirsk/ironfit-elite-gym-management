import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const SceneTransition = ({ id, height = 0.2 }) => {
  const ref = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
      .fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'none' }
      )
      .to(overlayRef.current,
        { opacity: 1, duration: 0.2, ease: 'none' }
      )
      .to(overlayRef.current,
        { opacity: 0, duration: 0.5, ease: 'none' }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      style={{
        position: 'relative',
        height: height * 100 + 'vh',
        width: '100vw',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={overlayRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          background: '#050505',
          opacity: 0,
        }}
      />
    </div>
  );
};

export default SceneTransition;
