'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';

export default function SplashWrapper({ children }) {
  const [splashDone, setSplashDone] = useState(false);

  const handleComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleComplete} />}

      {splashDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
