'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiX, HiExternalLink, HiDownload, HiCheck, HiShieldCheck, 
  HiClock, HiCalendar, HiDocumentText,
  HiRefresh, HiEye
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
const SHORTENER_WAIT_TIME = 5;

export default function DownloadModal({ panel, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState('initial');
  const [shortenerLink, setShortenerLink] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [downloadRecord, setDownloadRecord] = useState(null);
  const [countdown, setCountdown] = useState(SHORTENER_WAIT_TIME);
  const [shortenerTimer, setShortenerTimer] = useState(SHORTENER_WAIT_TIME);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentTime] = useState(new Date());

  const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleStartDownload = async () => {
    try {
      setStep('processing');
      const token = typeof window !== 'undefined' ? localStorage.getItem('vision_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/free-panels/${panel._id}/download`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();

      if (data.requiresShortener) {
        setShortenerLink(data.shortenerLink);
        setStep('shortener');
        startShortenerSimulation();
      } else if (data.directLink) {
        setDownloadLink(data.directLink);
        setStep('downloading');
        window.open(data.directLink, '_blank');
        startCountdown();
      }
    } catch (error) {
      toast.error(error.message || 'Download failed');
      setStep('initial');
    }
  };

  const startShortenerSimulation = () => {
    setShortenerTimer(SHORTENER_WAIT_TIME);
    setIsVerifying(false);
    const timer = setInterval(() => {
      setShortenerTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsVerifying(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleShortenerComplete = async () => {
    if (!isVerifying) return;
    
    setStep('processing');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vision_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/free-panels/${panel._id}/confirm-download`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      setDownloadLink(data.downloadLink);
      setDownloadRecord(data.download);
      setStep('downloading');
      window.open(data.downloadLink, '_blank');
      startCountdown();
    } catch (error) {
      toast.error('Failed to get download link');
      setStep('shortener');
      startShortenerSimulation();
    }
  };

  const startCountdown = () => {
    let count = SHORTENER_WAIT_TIME;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setStep('complete');
      }
    }, 1000);
  };

  const handleManualDownload = () => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
    }
  };

  const handleRetry = () => {
    setStep('initial');
    setShortenerLink('');
    setDownloadLink('');
    setDownloadRecord(null);
    setCountdown(SHORTENER_WAIT_TIME);
    setShortenerTimer(SHORTENER_WAIT_TIME);
    setIsVerifying(false);
    toast.success('Restarting download...');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl shadow-black/20 border border-gray-200/50 dark:border-gray-700/50">
            {/* Top Gradient Bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary-400 via-sky-400 to-accent-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl text-gray-400 hover:text-gray-600 
                         dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-all duration-200"
            >
              <HiX className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Panel Info Header */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 
                                flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <HiDownload className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {panel.name}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg 
                                   bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 
                                   text-xs font-medium">
                      v{panel.version}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg 
                                   bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 
                                   text-xs font-medium">
                      {panel.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Steps Indicator */}
              <div className="flex items-center justify-center space-x-3 mb-6">
                {['initial', 'shortener', 'downloading', 'complete'].map((s, i) => {
                  const stepOrder = ['initial', 'shortener', 'downloading', 'complete'];
                  const currentIdx = stepOrder.indexOf(step);
                  const stepIdx = stepOrder.indexOf(s);
                  const isCompleted = stepIdx < currentIdx;
                  const isCurrent = s === step;

                  return (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {isCompleted ? <HiCheck className="w-4 h-4" /> : i + 1}
                      </div>
                      {i < 3 && (
                        <div className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Step 1: Initial */}
                  {step === 'initial' && (
                    <div className="text-center space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-sky-50 
                                    dark:from-primary-900/20 dark:to-sky-900/20 border border-primary-100 dark:border-primary-800/30">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <HiShieldCheck className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            Secure Download
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Click below to start your download. Complete a quick verification step to access your file.
                          {user && ' You are logged in as ' + user.username + '.'}
                        </p>
                      </div>

                      <button
                        onClick={handleStartDownload}
                        className="w-full rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 
                                 text-white font-semibold py-4 
                                 shadow-lg shadow-primary-500/30 hover:shadow-xl
                                 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <HiDownload className="w-5 h-5 inline mr-2" />
                        Start Download
                      </button>
                    </div>
                  )}

                  {/* Step 2: Shortener Verification */}
                  {step === 'shortener' && (
                    <div className="text-center space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 
                                    dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/30">
                        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 
                                     flex items-center justify-center mb-3">
                          <HiLink className="w-7 h-7 text-amber-500" />
                        </div>
                        <h4 className="text-base font-bold text-amber-700 dark:text-amber-300 mb-2">
                          Quick Verification Required
                        </h4>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                          Please wait {shortenerTimer > 0 ? `${shortenerTimer}s` : ''} to verify you're not a robot
                        </p>

                        {/* Timer Display */}
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="24" fill="none" 
                                    stroke="currentColor" strokeWidth="4"
                                    className="text-amber-200 dark:text-amber-800" />
                            <motion.circle
                              cx="30" cy="30" r="24" fill="none"
                              stroke="currentColor" strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 24}
                              strokeDashoffset={2 * Math.PI * 24 * (1 - shortenerTimer / SHORTENER_WAIT_TIME)}
                              className="text-amber-500"
                              initial={false}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                              {shortenerTimer}
                            </span>
                          </div>
                        </div>

                        {/* Shortener Link */}
                        <div className="flex items-center justify-center space-x-2 text-xs text-amber-600 dark:text-amber-400 mb-3">
                          <HiExternalLink className="w-3.5 h-3.5" />
                          <a href={shortenerLink} target="_blank" rel="noopener noreferrer"
                             className="underline hover:text-amber-700 truncate max-w-[200px] transition-colors">
                            {shortenerLink}
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={handleShortenerComplete}
                        disabled={!isVerifying}
                        className={`w-full rounded-2xl font-semibold py-4 transition-all duration-300 ${
                          isVerifying
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <HiCheck className="w-5 h-5 inline mr-2" />
                        {isVerifying ? 'Verify & Download' : 'Please wait...'}
                      </button>

                      <button
                        onClick={handleRetry}
                        className="text-xs text-gray-400 hover:text-primary-500 transition-colors underline"
                      >
                        Start Over
                      </button>
                    </div>
                  )}

                  {/* Step 3: Processing */}
                  {step === 'processing' && (
                    <div className="text-center py-8 space-y-4">
                      <div className="loading-spinner mx-auto" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-lg">
                          Processing your download...
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Please wait a moment
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Downloading */}
                  {step === 'downloading' && (
                    <div className="text-center space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 
                                    dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
                        <HiDownload className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <h4 className="text-base font-bold text-green-700 dark:text-green-300 mb-2">
                          Download Started!
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Your file should start downloading automatically
                        </p>
                        {downloadRecord && (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-center text-xs text-green-600 dark:text-green-400">
                              <HiCalendar className="w-3.5 h-3.5 inline mr-1" />
                              <span>{formatDateTime(downloadRecord.downloadedAt)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleManualDownload}
                        className="w-full rounded-2xl bg-gray-100 dark:bg-gray-700 
                                 text-gray-700 dark:text-gray-300 font-semibold py-3 
                                 hover:bg-gray-200 dark:hover:bg-gray-600 
                                 transition-all duration-200"
                      >
                        <HiDownload className="w-4 h-4 inline mr-2" />
                        Download Again ({countdown}s)
                      </button>
                    </div>
                  )}

                  {/* Step 5: Complete */}
                  {step === 'complete' && (
                    <div className="text-center space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 
                                    dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 
                                     flex items-center justify-center mb-3">
                          <HiCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <h4 className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                          Download Complete!
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Thank you for downloading from VISION X CHEATS
                        </p>
                        
                        {downloadRecord && (
                          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800 
                                       space-y-2 text-xs text-green-600 dark:text-green-400">
                            <div className="flex items-center justify-center space-x-2">
                              <HiDocumentText className="w-3.5 h-3.5" />
                              <span>{downloadRecord.panelName}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                              <HiCalendar className="w-3.5 h-3.5" />
                              <span>Downloaded: {formatDateTime(downloadRecord.downloadedAt)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                        <HiShieldCheck className="w-4 h-4 text-green-500" />
                        <span>Secure download verified</span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={handleManualDownload}
                          className="flex-1 rounded-2xl bg-gray-100 dark:bg-gray-700 
                                   text-gray-700 dark:text-gray-300 font-semibold py-3 
                                   hover:bg-gray-200 dark:hover:bg-gray-600 
                                   transition-all duration-200"
                        >
                          <HiRefresh className="w-4 h-4 inline mr-1" />
                          Download Again
                        </button>
                        <button
                          onClick={onClose}
                          className="flex-1 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 
                                   text-white font-semibold py-3 shadow-lg shadow-primary-500/20
                                   hover:shadow-xl transition-all duration-300"
                        >
                          <HiEye className="w-4 h-4 inline mr-1" />
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bottom Info */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <HiShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    <span>Secure Connection</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <HiClock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(currentTime)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
