import { useMemo } from 'react';

function AnimatedBackground() {
  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${(i * 5.3 + 7) % 100}%`,
      top: `${(i * 7.1 + 13) % 100}%`,
      size: `${(i % 3) + 2}px`,
      delay: `${(i * 1.3) % 8}s`,
      duration: `${(i % 4) + 5}s`,
    })), []);

  return (
    <div className="animated-bg" aria-hidden="true">
      {/* Mesh gradient layers — large rotating conic blobs */}
      <div className="mesh-gradient mesh-1" />
      <div className="mesh-gradient mesh-2" />
      <div className="mesh-gradient mesh-3" />

      {/* Glowing radial lights */}
      <div className="radial-light light-1" />
      <div className="radial-light light-2" />
      <div className="radial-light light-3" />

      {/* Floating blur orbs */}
      <div className="blur-orb orb-1" />
      <div className="blur-orb orb-2" />
      <div className="blur-orb orb-3" />
      <div className="blur-orb orb-4" />
      <div className="blur-orb orb-5" />

      {/* Floating particles */}
      <div className="particles">
        {particles.map((p) => (
          <div key={p.id} className="particle" style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }} />
        ))}
      </div>

      {/* Animated wave pattern at the bottom */}
      <svg className="wave-pattern" viewBox="0 0 1440 180" preserveAspectRatio="none">
        <path className="wave wave-1" d="M0,80 C360,140 720,20 1080,80 C1260,110 1380,60 1440,80 L1440,180 L0,180 Z" />
        <path className="wave wave-2" d="M0,100 C240,40 480,150 720,100 C960,50 1200,140 1440,100 L1440,180 L0,180 Z" />
        <path className="wave wave-3" d="M0,120 C180,160 540,80 900,120 C1080,140 1260,90 1440,120 L1440,180 L0,180 Z" />
      </svg>

      {/* Grid overlay for that tech/matrix feel */}
      <div className="grid-overlay" />

      {/* Noise/grain texture */}
      <div className="noise-overlay" />
    </div>
  );
}

export default AnimatedBackground;
