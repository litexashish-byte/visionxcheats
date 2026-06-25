'use client';

import { useEffect, useRef } from 'react';

export default function ParticlesBackground({ density = 30 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animId = null;

    // Pre-compute color strings to avoid string building in animation loop
    const COLORS = [
      'rgba(56,189,248,',  // sky blue
      'rgba(79,70,229,',   // indigo
      'rgba(129,140,248,', // light indigo
      'rgba(34,211,238,',  // cyan
      'rgba(167,139,250,', // violet
    ];

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    let particles = [];

    function initParticles() {
      const count = Math.min(density, Math.floor((width * height) / 35000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 2.5 + 1,
          alpha: Math.random() * 0.35 + 0.15,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let time = 0;

    function animate() {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // First pass: update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // Second pass: draw connections (only between nearby particles)
      // Limit to prevent O(n²) on large counts
      const maxConnections = Math.min(particles.length, 50);
      for (let i = 0; i < maxConnections; i++) {
        for (let j = i + 1; j < maxConnections; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = dx * dx + dy * dy;

          if (dist < 25000) { // ~158px
            const alpha = (1 - Math.sqrt(dist) / 158) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Third pass: draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = Math.sin(time * 2 + p.phase) * 0.15 + 0.85;
        const currentAlpha = p.alpha * pulse;
        const currentR = p.r * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.max(0, currentAlpha) + ')';
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}
