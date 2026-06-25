'use client';

import { useEffect, useRef } from 'react';

export default function ClickSoundProvider({ children }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/click.mp3');
    audio.preload = 'auto';
    audio.volume = 0.5;
    audioRef.current = audio;
  }, []);

  const playClick = () => {
    try {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('button, a[href], [role="button"], input[type="submit"], input[type="button"]');
      if (target) playClick();
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return <>{children}</>;
}
