'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { HiOutlineChip, HiBan, HiCheckCircle, HiTrash, HiRefresh, HiPlus, HiX, HiSearch } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminUIDsPage() {
  const [uids, setUids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ uid: '', duration: 'daily', resellerId: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [resellers, setResellers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchUIDs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/uid-management/admin/all-uids`, { headers });
      if (res.data.success) setUids(res.data.data || []);
    } catch (err) { toast.error('Failed to load UIDs'); }
    finally { setLoading(false); }
  };

  const fetchResellers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/resellers`, { headers });
      if (res.data.success) setResellers(res.data.data || []);
    } catch {}
  };

  useEffect(() => { fetchUIDs(); fetchResellers(); }, []);

  const handleBan = async (uid) => {
    try {
      const res = await axios.post(`${API_URL}/uid-management/admin/ban-uid`, { uid, reason: 'Banned by admin' }, { headers });
      if (res.data.success) {
        toast.success('UID banned');
        fetchUIDs();
      } else { toast.error(res.data.message || 'Failed'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to ban'); }
  };

  const handleUnban = async (uid) => {
    try {
      const res = await axios.post(`${API_URL}/uid-management/admin/unban-uid`, { uid }, { headers });
      if (res.data.success) {
        toast.success('UID unbanned');
        fetchUIDs();
      } else { toast.error(res.data.message || 'Failed'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to unban'); }
  };

  const handleDelete = async (uid) => {
    try {
      const res = await axios.delete(`${API_URL}/uid-management/admin/uid/${uid}`, { headers });
      if (res.data.success) {
        toast.success('UID deleted');
        fetchUIDs();
      } else { toast.error(res.data.message || 'Failed'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.uid.trim()) return toast.error('Enter UID');
    setAddLoading(true);
    try {
      const res = await axios.post(`${API_URL}/uid-management/admin/add-uid`, addForm, { headers });
      if (res.data.success) {
        toast.success('UID added!');
        setShowAddModal(false);
        setAddForm({ uid: '', duration: 'daily', resellerId: '' });
        fetchUIDs();
      } else { toast.error(res.data.message || 'Failed'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setAddLoading(false); }
  };

  const filteredUIDs = uids.filter(u => {
    if (filter === 'active' && u.status !== 'active') return false;
    if (filter === 'banned' && u.status !== 'banned') return false;
    if (search && !u.uid.includes(search) && !u.resellerName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeUIDs = uids.filter(u => u.status === 'active');
  const bannedUIDs = uids.filter(u => u.status === 'banned');

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineChip className="w-7 h-7 text-teal-500" /> UID Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage all whitelisted UIDs across resellers</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl">
          <HiPlus className="w-4 h-4 mr-1.5" /> Add UID
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total UIDs', value: uids.length, color: 'from-teal-500 to-teal-600', icon: HiOutlineChip },
          { label: 'Active', value: activeUIDs.length, color: 'from-green-500 to-green-600', icon: HiCheckCircle },
          { label: 'Banned', value: bannedUIDs.length, color: 'from-red-500 to-red-600', icon: HiBan },
          { label: 'Resellers', value: resellers.length, color: 'from-purple-500 to-purple-600', icon: HiOutlineChip },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {['all', 'active', 'banned'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search UID or reseller..." className="input-field pl-10 py-2 text-sm" />
        </div>
      </div>

      {/* UIDs Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Whitelisted UIDs</h2>
          <button onClick={fetchUIDs} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><HiRefresh className="w-4 h-4" /></button>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filteredUIDs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No UIDs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">UID</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Reseller</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Duration</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">License</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500">Expires</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUIDs.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-900 dark:text-white">{u.uid}</td>
                    <td className="px-5 py-3 text-xs text-gray-600 dark:text-gray-400">{u.resellerName || '-'}</td>
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
      </div>

      {/* Add UID Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add UID Directly</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><HiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UID</label>
                  <input type="text" value={addForm.uid} onChange={e => setAddForm({...addForm, uid: e.target.value})} className="input-field" placeholder="Enter game UID" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <select value={addForm.duration} onChange={e => setAddForm({...addForm, duration: e.target.value})} className="input-field">
                    <option value="daily">Daily (24h)</option>
                    <option value="weekly">Weekly (7 days)</option>
                    <option value="fifteen_day">15 Days</option>
                    <option value="monthly">Monthly (30 days)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Reseller (optional)</label>
                  <select value={addForm.resellerId} onChange={e => setAddForm({...addForm, resellerId: e.target.value})} className="input-field">
                    <option value="">Admin (No reseller)</option>
                    {resellers.map(r => (
                      <option key={r._id} value={r._id}>{r.name} ({r.email})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={addLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                  {addLoading ? 'Adding...' : 'Add UID'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
