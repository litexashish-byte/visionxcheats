'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi';

export default function SplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const dark = saved !== null ? saved === 'true' : true;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('darkMode', next);
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 4800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5, a: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
        const a = p.a * (0.5 + 0.5 * Math.sin(p.pulse));
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(168,132,250,${a})` : `rgba(124,58,237,${a * 0.6})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark ? `rgba(139,92,246,${0.08 * (1 - dist / 120)})` : `rgba(124,58,237,${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [isDark]);

  const letters = 'VISION X CHEATS'.split('');

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* Background */}
          <div className={`absolute inset-0 ${isDark ? 'bg-[#0a0014]' : 'bg-gradient-to-br from-gray-100 via-white to-purple-50'}`} />

          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Glow rings */}
          <motion.div
            className={`absolute rounded-full border ${isDark ? 'border-purple-500/20' : 'border-purple-400/15'}`}
            style={{ width: 300, height: 300 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute rounded-full border ${isDark ? 'border-violet-500/15' : 'border-violet-400/10'}`}
            style={{ width: 450, height: 450 }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Toggle */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            onClick={toggleDarkMode}
            className={`absolute top-6 right-6 z-20 p-3 rounded-full backdrop-blur-md border transition-all hover:scale-110 ${
              isDark ? 'bg-white/10 border-white/10 text-yellow-300' : 'bg-gray-800/10 border-gray-300/30 text-gray-700'
            }`}
          >
            {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
          </motion.button>

          {/* Content */}
          <div className="relative z-10 text-center flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`mx-auto mb-6 w-20 h-20 rounded-2xl overflow-hidden ring-2 ${
                isDark ? 'shadow-2xl shadow-purple-500/30 ring-purple-500/30' : 'shadow-2xl shadow-purple-400/20 ring-purple-400/25'
              }`}
            >
              <img src="/logo.png" alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* Text */}
            <div className="flex items-center justify-center flex-wrap gap-0">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`splash-text text-5xl md:text-7xl lg:text-8xl font-black tracking-wider inline-block ${letter === ' ' ? 'w-4 md:w-6 lg:w-8' : ''} ${isDark ? 'splash-dark' : 'splash-light'}`}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`mt-5 text-lg md:text-xl font-medium tracking-[0.3em] uppercase ${isDark ? 'text-purple-300/70' : 'text-purple-600/60'}`}
            >
              Premium Digital Panels
            </motion.p>

            {/* Loading bar */}
            <motion.div
              className={`mt-8 mx-auto w-64 h-1 rounded-full overflow-hidden ${isDark ? 'bg-purple-900/30' : 'bg-purple-200/50'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.4 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: isDark ? 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)' : 'linear-gradient(90deg, #6d28d9, #7c3aed, #8b5cf6)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 2.2, duration: 2, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
