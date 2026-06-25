'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HiShieldCheck, HiKey, HiCheckCircle, HiSearch, HiClock } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WhitelistPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [resellerInfo, setResellerInfo] = useState(null);
  const [uid, setUid] = useState('');
  const [duration, setDuration] = useState('daily');
  const [whitelisting, setWhitelisting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (!token) { setInvalidToken(true); return; }
    fetch(`${API_URL}/resellers/public-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resellerToken: token }),
    })
      .then(r => r.json())
      .then(d => { if (d.success) setResellerInfo(d.data); else setInvalidToken(true); })
      .catch(() => setInvalidToken(true));
  }, [token]);

  const handleWhitelist = async (e) => {
    e.preventDefault();
    if (!uid.trim()) return toast.error('Enter a UID');
    setWhitelisting(true); setError(''); setResult(null);
    try {
      const res = await axios.post(`${API_URL}/resellers/public-whitelist`, {
        uid: uid.trim(), duration, resellerToken: token,
      });
      if (res.data.success) {
        setResult(res.data.data);
        toast.success('UID whitelisted!');
        setUid('');
      } else {
        setError(res.data.message);
        toast.error(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error whitelisting UID';
      setError(msg);
      toast.error(msg);
    } finally { setWhitelisting(false); }
  };

  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
        <Toaster position="top-right" />
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-900/30 flex items-center justify-center mb-4">
            <HiShieldCheck className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-gray-400">This whitelist link is invalid or expired. Contact the reseller for a new link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-4">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
                <HiShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">UID Whitelist</h1>
              {resellerInfo && (
                <p className="text-sm text-gray-400 mt-1">
                  via <span className="text-purple-400 font-medium">{resellerInfo.name}</span>
                </p>
              )}
            </div>

            {/* Reseller Info */}
            {resellerInfo && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-lg font-bold text-white">{resellerInfo.uidLimit === -1 ? '∞' : resellerInfo.uidLimit - resellerInfo.uidUsed}</p>
                  <p className="text-xs text-gray-400">Remaining</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-lg font-bold text-white">{resellerInfo.uidUsed}</p>
                  <p className="text-xs text-gray-400">Used</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleWhitelist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Game UID</label>
                <div className="relative">
                  <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="text" value={uid} onChange={e => setUid(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Enter your game UID" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'daily', label: '1 Day', icon: '🕐' },
                    { value: 'weekly', label: '7 Days', icon: '📅' },
                    { value: 'fifteen_day', label: '15 Days', icon: '🗓️' },
                    { value: 'monthly', label: '30 Days', icon: '📆' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setDuration(opt.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${duration === opt.value
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}>
                      <span className="text-lg">{opt.icon}</span>
                      <p className="mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={whitelisting || (resellerInfo && !resellerInfo.isActive)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {whitelisting ? (
                  <span className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Whitelisting...</span>
                ) : 'Whitelist UID'}
              </button>
            </form>

            {/* Success Result */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <HiCheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="font-bold text-green-300">Success!</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">UID</span><span className="text-white font-mono">{result.uid}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white capitalize">{result.duration}</span></div>
                  {result.license_key && (
                    <div className="flex justify-between"><span className="text-gray-400">License Key</span><span className="text-purple-300 font-mono text-xs">{result.license_key}</span></div>
                  )}
                  {result.expires_at && (
                    <div className="flex justify-between"><span className="text-gray-400">Expires</span><span className="text-white">{result.expires_at}</span></div>
                  )}
                </div>
              </motion.div>
            )}

            <p className="text-center text-xs text-gray-500 mt-6">Powered by Vision X Cheats</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
