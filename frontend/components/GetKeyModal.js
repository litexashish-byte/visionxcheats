'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SHORTENER_BASE = 'https://indianshortner.com/st?api=3bce91795585029204fdb9e49c95884ee3d87c97&url=';
const TIMER_SECONDS = 5;
const AD_SECONDS = 15;

export default function GetKeyModal({ panel, onClose }) {
  const [step, setStep] = useState('timer');
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [adTimer, setAdTimer] = useState(AD_SECONDS);
  const [licenseData, setLicenseData] = useState(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  );

  useEffect(() => {
    if (step !== 'timer') return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(interval); setStep('ready'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step !== 'ad') return;
    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleWatchAd = () => {
    if (isLocalhost) {
      setStep('ad');
    } else {
      const siteUrl = window.location.origin;
      const destination = `${siteUrl}/getkey-success?panel=${panel._id}`;
      window.open(SHORTENER_BASE + encodeURIComponent(destination), '_blank');
      setStep('ad');
    }
  };

  const generateKey = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/keyauth/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelId: panel._id, username: 'VX-' + Math.random().toString(36).substring(2, 8).toUpperCase() }),
      });
      const data = await res.json();
      if (data.success) { setLicenseData(data.data); setStep('success'); toast.success('License key generated!'); }
      else { setError(data.message || 'Failed'); setStep('error'); }
    } catch (err) { setError('Server error: ' + err.message); setStep('error'); }
    finally { setIsGenerating(false); }
  };

  const handleCopy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }} className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-500" />
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="p-6 sm:p-8">
              <div className="text-center mb-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Get Key - {panel.name}</h3>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">

                  {step === 'timer' && (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="relative w-28 h-28">
                          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="7" fill="none" className="text-gray-200 dark:text-gray-700" />
                            <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="7" fill="none" className="text-amber-500" strokeLinecap="round" strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - timer / TIMER_SECONDS)} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-black text-amber-600 dark:text-amber-400">{timer}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Please wait... {timer}s remaining</p>
                      </div>
                    </div>
                  )}

                  {step === 'ready' && (
                    <div className="text-center space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/30">
                        <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h4 className="text-base font-bold text-green-700 dark:text-green-300">Ready!</h4>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Watch the ad to get your license key</p>
                      </div>
                      <button onClick={handleWatchAd} className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-4 shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Watch Ad & Get License Key
                        </span>
                      </button>
                    </div>
                  )}

                  {step === 'ad' && (
                    <div className="text-center space-y-4">
                      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-200 dark:border-amber-800/30 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center" style={{ height: '300px' }}>
                        <div className="text-center space-y-3 px-4">
                          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <p className="text-white font-semibold text-lg">Sponsored Ad</p>
                          <p className="text-amber-400 font-bold text-3xl">{adTimer}s</p>
                          <p className="text-gray-400 text-sm">Please wait for the ad to complete...</p>
                        </div>
                        {adTimer > 0 && <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full">{adTimer}s remaining</div>}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000" style={{ width: `${((AD_SECONDS - adTimer) / AD_SECONDS) * 100}%` }} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{adTimer > 0 ? `Watch the ad for ${adTimer} more seconds...` : 'Ad completed!'}</p>
                      <button onClick={generateKey} disabled={adTimer > 0 || isGenerating}
                        className={`w-full rounded-2xl font-semibold py-4 shadow-lg transition-all duration-300 ${adTimer > 0 || isGenerating ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5'}`}>
                        <span className="flex items-center justify-center">
                          {isGenerating ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Generating...</>
                            : adTimer > 0 ? <><div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />Waiting... {adTimer}s</>
                            : <><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>Get License Key</>}
                        </span>
                      </button>
                    </div>
                  )}

                  {step === 'success' && licenseData && (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">License Key Generated!</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Valid for {licenseData.duration} day(s)</p>
                      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-xs text-gray-400 mb-1">License Key</p>
                            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white break-all leading-relaxed">{licenseData.key}</p>
                          </div>
                          <button onClick={() => handleCopy(licenseData.key)} className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-2">
                        <button onClick={onClose} className="flex-1 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">Close</button>
                        <button onClick={() => handleCopy(licenseData.key)} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all">Copy Key</button>
                      </div>
                    </div>
                  )}

                  {step === 'error' && (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                      <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Error</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p></div>
                      <div className="flex space-x-3">
                        <button onClick={() => { setStep('timer'); setTimer(TIMER_SECONDS); setAdTimer(AD_SECONDS); setError(''); setLicenseData(null); }} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3">Try Again</button>
                        <button onClick={onClose} className="flex-1 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3">Close</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span>Powered by KeyAuth</span>
                </div>
              </div>
          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
