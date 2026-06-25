'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function GetKeySuccess() {
  const searchParams = useSearchParams();
  const panelId = searchParams.get('panel');
  const [step, setStep] = useState('generating');
  const [keyData, setKeyData] = useState(null);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    if (!panelId) { setStep('error'); setError('No panel specified'); return; }
    generateKey();
  }, [panelId]);

  const generateKey = async () => {
    setStep('generating');
    try {
      const panelRes = await fetch(`${API_URL}/free-panels/${panelId}`);
      const panelJson = await panelRes.json();
      if (panelJson.success) setPanel(panelJson.data);
    } catch (e) {}

    try {
      const res = await fetch(`${API_URL}/keyauth/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelId, username: 'VX-' + Math.random().toString(36).substring(2, 8).toUpperCase() }),
      });
      const data = await res.json();
      if (data.success) { setKeyData(data.data); setStep('success'); toast.success('License key generated!'); }
      else { throw new Error(data.message || 'Failed'); }
    } catch (err) { setError(err.message); setStep('error'); toast.error(err.message); }
  };

  const handleCopy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500" />
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 'generating' && (
                <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 border-4 border-amber-200 dark:border-amber-800 border-t-amber-500 rounded-full animate-spin mx-auto" />
                  <p className="text-gray-900 dark:text-white font-semibold text-lg">Generating your license key...</p>
                  <p className="text-sm text-gray-400 mt-1">Connecting to KeyAuth</p>
                </motion.div>
              )}
              {step === 'success' && keyData && (
                <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mt-3">License Key Generated!</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{panel ? panel.name : 'Your'} - Valid for {keyData.duration} day(s)</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-xs text-gray-400 mb-1">License Key</p>
                        <p className="text-sm font-mono font-bold text-gray-900 dark:text-white break-all leading-relaxed">{keyData.key}</p>
                      </div>
                      <button onClick={() => handleCopy(keyData.key)} className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <Link href="/free-panels" className="flex-1 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">Back to Store</Link>
                    <button onClick={() => { navigator.clipboard.writeText(keyData.key); toast.success('Copied!'); }} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all">Copy Key</button>
                  </div>
                </motion.div>
              )}
              {step === 'error' && (
                <motion.div key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Error</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p></div>
                  <div className="flex space-x-3">
                    <button onClick={generateKey} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3">Try Again</button>
                    <Link href="/free-panels" className="flex-1 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 text-center">Back to Store</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span>Powered by KeyAuth</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
