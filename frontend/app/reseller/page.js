'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { HiKey, HiCheckCircle, HiClock, HiLogout, HiRefresh, HiSearch, HiOutlineChip, HiShieldCheck, HiBan, HiTrash, HiPlus, HiShare, HiX } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ResellerDashboard() {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [uid, setUid] = useState('');
  const [duration, setDuration] = useState('daily');
  const [whitelisting, setWhitelisting] = useState(false);
  const [activeTab, setActiveTab] = useState('whitelist');
  const [balance, setBalance] = useState(null);
  const [uids, setUids] = useState([]);
  const [uidsLoading, setUidsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('reseller_token');
    if (saved) { setToken(saved); fetchProfile(saved); }
  }, []);

  const api = (t) => ({ headers: { Authorization: `Bearer ${t || token}` } });

  const fetchProfile = async (t) => {
    try {
      const res = await axios.get(`${API_URL}/uid-management/profile`, api(t));
      if (res.data.success) setProfile(res.data.data);
    } catch { localStorage.removeItem('reseller_token'); setToken(null); }
  };

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${API_URL}/uid-management/balance`, api());
      if (res.data.success) setBalance(res.data.data);
    } catch {}
  };

  const fetchUIDs = async () => {
    setUidsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/uid-management/uids`, api());
      if (res.data.success) setUids(res.data.data || []);
    } catch { toast.error('Failed to load UIDs'); }
    finally { setUidsLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API_URL}/uid-management/login`, loginForm);
      if (res.data.success) {
        localStorage.setItem('reseller_token', res.data.data.token);
        setToken(res.data.data.token);
        fetchProfile(res.data.data.token);
        toast.success('Logged in!');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoginLoading(false); }
  };

  const handleWhitelist = async (e) => {
    e.preventDefault();
    if (!uid.trim()) return toast.error('Enter a UID');
    setWhitelisting(true);
    try {
      const res = await axios.post(`${API_URL}/uid-management/whitelist`, { uid: uid.trim(), duration }, api());
      if (res.data.success) {
        toast.success(`UID ${uid} whitelisted!`);
        setUid('');
        fetchProfile();
        fetchUIDs();
      } else { toast.error(res.data.message || 'Failed'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setWhitelisting(false); }
  };

  const handleBan = async (uidValue) => {
    try {
      const res = await axios.post(`${API_URL}/uid-management/uids/ban`, { uid: uidValue, reason: 'Banned by reseller' }, api());
      if (res.data.success) {
        toast.success('UID banned');
        fetchUIDs();
      } else {
        toast.error(res.data.message || 'Failed to ban');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to ban'); }
  };

  const handleUnban = async (uidValue) => {
    try {
      const res = await axios.post(`${API_URL}/uid-management/uids/unban`, { uid: uidValue }, api());
      if (res.data.success) {
        toast.success('UID unbanned');
        fetchUIDs();
      } else {
        toast.error(res.data.message || 'Failed to unban');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to unban'); }
  };

  const handleDelete = async (uidValue) => {
    try {
      const res = await axios.delete(`${API_URL}/uid-management/uids/${uidValue}`, api());
      if (res.data.success) {
        toast.success('UID deleted');
        fetchUIDs();
      } else {
        toast.error(res.data.message || 'Failed to delete');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const logout = () => { localStorage.removeItem('reseller_token'); setToken(null); setProfile(null); setUids([]); };

  useEffect(() => { if (token) { fetchBalance(); fetchUIDs(); } }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Toaster position="top-right" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
          <div className="glass-card rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
                <HiShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reseller Panel</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Login to manage UID whitelisting</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="input-field" required placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="input-field" required placeholder="Enter password" />
              </div>
              <button type="submit" disabled={loginLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-4">Contact admin to get your reseller account</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const remaining = profile?.uidLimit === -1 ? '∞' : (profile?.uidLimit || 0) - (profile?.uidUsed || 0);
  const activeUIDs = uids.filter(u => u.status === 'active');
  const bannedUIDs = uids.filter(u => u.status === 'banned');

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {profile?.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowShareModal(true)} className="flex items-center px-4 py-2 rounded-xl text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <HiShare className="w-4 h-4 mr-1.5" /> Share Link
            </button>
            <button onClick={logout} className="flex items-center px-4 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <HiLogout className="w-4 h-4 mr-1.5" /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Remaining', value: remaining, color: 'from-purple-500 to-purple-600', icon: HiOutlineChip },
            { label: 'Used', value: profile?.uidUsed || 0, color: 'from-blue-500 to-blue-600', icon: HiCheckCircle },
            { label: 'Active UIDs', value: activeUIDs.length, color: 'from-green-500 to-green-600', icon: HiKey },
            { label: 'Banned', value: bannedUIDs.length, color: 'from-red-500 to-red-600', icon: HiBan },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-2`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {[
            { id: 'whitelist', label: 'Whitelist UID', icon: HiPlus },
            { id: 'uids', label: `My UIDs (${uids.length})`, icon: HiKey },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'uids') fetchUIDs(); }}
              className={`flex-1 min-w-0 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              <tab.icon className="w-4 h-4 mr-1.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Whitelist Tab */}
        {activeTab === 'whitelist' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Whitelist a New UID</h2>
            <form onSubmit={handleWhitelist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Game UID</label>
                <div className="relative">
                  <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={uid} onChange={e => setUid(e.target.value)} className="input-field pl-12" placeholder="Enter game UID" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                <select value={duration} onChange={e => setDuration(e.target.value)} className="input-field">
                  <option value="daily">Daily (24h)</option>
                  <option value="weekly">Weekly (7 days)</option>
                  <option value="fifteen_day">15 Days</option>
                  <option value="monthly">Monthly (30 days)</option>
                </select>
              </div>
              <button type="submit" disabled={whitelisting || remaining === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {whitelisting ? 'Whitelisting...' : remaining === 0 ? 'UID Limit Reached' : 'Whitelist UID'}
              </button>
            </form>
          </motion.div>
        )}

        {/* My UIDs Tab */}
        {activeTab === 'uids' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Whitelisted UIDs</h2>
              <button onClick={fetchUIDs} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><HiRefresh className="w-4 h-4" /></button>
            </div>
            {uidsLoading ? (
              <div className="p-12 text-center text-gray-400">Loading...</div>
            ) : uids.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No UIDs yet. Whitelist your first UID!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-5 py-3 font-semibold text-gray-500">UID</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500">Duration</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500">Status</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500">License</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-500">Expires</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uids.map((u) => (
                      <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-5 py-3 font-mono text-xs text-gray-900 dark:text-white">{u.uid}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">{u.duration}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>{u.status}</span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{u.licenseKey || '-'}</td>
                        <td className="px-5 py-3 text-xs text-gray-400">{u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : '-'}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {u.status === 'active' ? (
                              <button onClick={() => handleBan(u.uid)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Ban"><HiBan className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={() => handleUnban(u.uid)} className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20" title="Unban"><HiCheckCircle className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => handleDelete(u.uid)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete"><HiTrash className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowShareModal(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share Whitelist Link</h3>
                  <button onClick={() => setShowShareModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><HiX className="w-5 h-5" /></button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Share this link with customers to let them whitelist their own UID without login.</p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                  {typeof window !== 'undefined' && `${window.location.origin}/whitelist?token=${token}`}
                </div>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/whitelist?token=${token}`); toast.success('Link copied!'); }} className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm">Copy Link</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
