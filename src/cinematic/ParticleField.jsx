import { memo } from 'react';

/**
 * Lightweight animated particle background.
 * Uses pure CSS animations — no WebGL, no Three.js.
 * Zero GPU overhead, works on all devices.
 */
const ParticleField = memo(({ className = '' }) => (
  <div
    className={className}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    {/* Animated gradient orbs */}
    <div style={{
      position: 'absolute',
      width: 500,
      height: 500,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,98,0,0.08) 0%, transparent 70%)',
      top: '-10%',
      left: '-10%',
      animation: 'pf-float 20s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 70%)',
      bottom: '-10%',
      right: '-10%',
      animation: 'pf-float 25s ease-in-out infinite reverse',
    }} />
    <div style={{
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,98,0,0.05) 0%, transparent 70%)',
      top: '40%',
      left: '60%',
      animation: 'pf-float 18s ease-in-out infinite 5s',
    }} />

    {/* Floating particle dots */}
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        borderRadius: '50%',
        background: `rgba(255, ${98 + Math.floor(Math.random() * 80)}, 0, ${0.15 + Math.random() * 0.35})`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `pf-drift ${15 + Math.random() * 25}s ease-in-out ${Math.random() * 10}s infinite`,
        opacity: 0,
      }} />
    ))}

    <style>{`
      @keyframes pf-float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(40px, -50px) scale(1.15); }
        66% { transform: translate(-30px, 40px) scale(0.85); }
      }
      @keyframes pf-drift {
        0%, 100% { opacity: 0; transform: translateY(0) translateX(0); }
        10% { opacity: 1; }
        50% { opacity: 0.6; transform: translateY(-120px) translateX(60px); }
        90% { opacity: 1; }
      }
    `}</style>
  </div>
));

ParticleField.displayName = 'ParticleField';

export default ParticleField;
