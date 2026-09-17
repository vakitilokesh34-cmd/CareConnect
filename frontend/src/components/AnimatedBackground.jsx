import React, { useState, useEffect } from 'react';

const PARTICLE_COUNT = 14;

const AnimatedBackground = ({ variant = 'dark', className = '' }) => {
  const dark = variant !== 'light';
  const [particles, setParticles] = useState([]);
  const [glow, setGlow] = useState(null);

  useEffect(() => {
    const generated = Array.from({ length: PARTICLE_COUNT }, () => ({
      id: Math.random().toString(36).slice(2),
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      size: 4 + Math.random() * 6,
      duration: `${5 + Math.random() * 6}s`,
    }));
    setParticles(generated);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setGlow({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${dark ? 'bg-slate-950' : ''} ${className}`}
      aria-hidden="true"
    >
      {/* Ambient gradient base */}
      {dark ? (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-[#0a0f2e]" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-slate-50 to-cyan-100" />
      )}

      {/* Floating orbs */}
      <div className={dark ? 'cc-orb cc-orb-1' : 'cc-orb cc-orb-1 cc-orb-light'} />
      <div className={dark ? 'cc-orb cc-orb-2' : 'cc-orb cc-orb-2 cc-orb-light'} />
      <div className={dark ? 'cc-orb cc-orb-3' : 'cc-orb cc-orb-3 cc-orb-light'} />
      <div className={dark ? 'cc-orb cc-orb-4' : 'cc-orb cc-orb-4 cc-orb-light'} />

      {/* Perspective grid floor */}
      <div className={dark ? 'cc-grid-floor' : 'cc-grid-floor cc-grid-floor-light'} />

      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={dark ? 'cc-particle' : 'cc-particle cc-particle-light'}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Cursor glow */}
      {glow && (
        <div
          className={dark ? 'cc-mouse-glow' : 'cc-mouse-glow cc-mouse-glow-light'}
          style={{ left: glow.x, top: glow.y }}
        />
      )}

      {/* Subtle vignette */}
      <div
        className={
          dark
            ? 'absolute inset-0 shadow-[inset_0_0_220px_60px_rgba(2,6,23,0.85)]'
            : 'absolute inset-0 shadow-[inset_0_0_200px_40px_rgba(148,163,184,0.25)]'
        }
      />
    </div>
  );
};

export default AnimatedBackground;