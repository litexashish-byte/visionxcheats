'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { HiUserGroup, HiPlus, HiTrash, HiPencil, HiCheck, HiX, HiKey, HiOutlineChip, HiSearch, HiLink, HiLightningBolt } from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminResellers() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', gtcApiKey: '', uidLimit: 10 });
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const [whitelistForm, setWhitelistForm] = useState({ resellerId: '', uid: '', duration: 'daily' });
  const [whitelisting, setWhitelisting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareReseller, setShareReseller] = useState(null);

  useEffect(() => { fetchResellers(); }, []);

  const fetchResellers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/resellers`);
      if (res.data.success) setResellers(res.data.data);
    } catch (err) { toast.error('Failed to load resellers'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReseller) {
        const { password, ...rest } = form;
        const update = password ? form : rest;
        await axios.put(`${API_URL}/admin/resellers/${editingReseller._id}`, update);
        toast.success('Reseller updated');
      } else {
        await axios.post(`${API_URL}/admin/resellers`, form);
        toast.success('Reseller created');
      }
      setShowModal(false); setEditingReseller(null);
      setForm({ name: '', email: '', password: '', gtcApiKey: '', uidLimit: 10 });
      fetchResellers();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reseller?')) return;
    try {
      await axios.delete(`${API_URL}/admin/resellers/${id}`);
      toast.success('Reseller deleted');
      fetchResellers();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const toggleActive = async (r) => {
    try {
      await axios.put(`${API_URL}/admin/resellers/${r._id}`, { isActive: !r.isActive });
      toast.success(r.isActive ? 'Suspended' : 'Activated');
      fetchResellers();
    } catch (err) { toast.error('Failed to update'); }
  };

  const openEdit = (r) => {
    setEditingReseller(r);
    setForm({ name: r.name, email: r.email, password: '', gtcApiKey: r.gtcApiKey, uidLimit: r.uidLimit === -1 ? 0 : r.uidLimit });
    setShowModal(true);
  };

  const filtered = resellers.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()));

  const handleAdminWhitelist = async (e) => {
    e.preventDefault();
    setWhitelisting(true);
    try {
      const res = await axios.post(`${API_URL}/resellers/admin-whitelist`, whitelistForm);
      if (res.data.success) {
        toast.success(`UID ${whitelistForm.uid} whitelisted!`);
        setWhitelistForm({ resellerId: '', uid: '', duration: 'daily' });
        setShowWhitelistModal(false);
        fetchResellers();
      } else { toast.error(res.data.message); }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setWhitelisting(false); }
  };

  const openShareLink = (r) => {
    setShareReseller(r);
    setShowShareModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Resellers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage UID bypass resellers</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setShowWhitelistModal(true)}
            className="btn-secondary text-sm py-2.5 px-4 flex items-center">
            <HiLightningBolt className="w-4 h-4 mr-1.5" /> Whitelist UID
          </button>
          <button onClick={() => { setEditingReseller(null); setForm({ name: '', email: '', password: '', gtcApiKey: '', uidLimit: 10 }); setShowModal(true); }}
            className="btn-primary text-sm py-2.5 px-5 flex items-center">
            <HiPlus className="w-4 h-4 mr-1.5" /> Add Reseller
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resellers..."
          className="input-field pl-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Resellers', value: resellers.length, color: 'from-blue-500 to-blue-600' },
          { label: 'Active', value: resellers.filter(r => r.isActive).length, color: 'from-green-500 to-green-600' },
          { label: 'Total UIDs Used', value: resellers.reduce((s, r) => s + (r.uidUsed || 0), 0), color: 'from-purple-500 to-purple-600' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-3`}>
              <HiOutlineChip className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Reseller</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">UID Usage</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Created</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">{r.name?.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${r.uidLimit === -1 ? 5 : Math.min((r.uidUsed / r.uidLimit) * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{r.uidUsed}/{r.uidLimit === -1 ? '∞' : r.uidLimit}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(r)} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {r.isActive ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => openShareLink(r)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-500 transition-colors" title="Share Link"><HiLink className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No resellers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingReseller ? 'Edit Reseller' : 'Add Reseller'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><HiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required disabled={!!editingReseller} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password {editingReseller && '(leave blank to keep)'}</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" {...(!editingReseller && { required: true })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><HiKey className="w-4 h-4 mr-1 text-purple-500" /> GTC API Key</label>
                  <input type="text" value={form.gtcApiKey} onChange={e => setForm({...form, gtcApiKey: e.target.value})} className="input-field" placeholder="GTCAPI-..." required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UID Limit (-1 = Unlimited)</label>
                  <input type="number" value={form.uidLimit} onChange={e => setForm({...form, uidLimit: parseInt(e.target.value) || 0})} className="input-field" min="-1" />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    {editingReseller ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Whitelist Modal */}
        {showWhitelistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowWhitelistModal(false)}>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center"><HiLightningBolt className="w-5 h-5 mr-2 text-purple-500" /> Whitelist UID</h3>
                <button onClick={() => setShowWhitelistModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><HiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdminWhitelist} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reseller</label>
                  <select value={whitelistForm.resellerId} onChange={e => setWhitelistForm({...whitelistForm, resellerId: e.target.value})} className="input-field" required>
                    <option value="">Choose reseller...</option>
                    {resellers.filter(r => r.isActive).map(r => (
                      <option key={r._id} value={r._id}>{r.name} ({r.uidUsed}/{r.uidLimit === -1 ? '∞' : r.uidLimit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Game UID</label>
                  <input type="text" value={whitelistForm.uid} onChange={e => setWhitelistForm({...whitelistForm, uid: e.target.value})} className="input-field" placeholder="Enter game UID" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <select value={whitelistForm.duration} onChange={e => setWhitelistForm({...whitelistForm, duration: e.target.value})} className="input-field">
                    <option value="daily">Daily (24h)</option>
                    <option value="weekly">Weekly (7 days)</option>
                    <option value="fifteen_day">15 Days</option>
                    <option value="monthly">Monthly (30 days)</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowWhitelistModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium">Cancel</button>
                  <button type="submit" disabled={whitelisting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg disabled:opacity-50">
                    {whitelisting ? 'Whitelisting...' : 'Whitelist'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share Link Modal */}
        {showShareModal && shareReseller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center"><HiLink className="w-5 h-5 mr-2 text-green-500" /> Share Whitelist Link</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><HiX className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Share this link with <strong>{shareReseller.name}</strong>&apos;s customers. They can whitelist their UID without login.
                </p>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-400 mb-1">Whitelist Link</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/whitelist?token=RESELLER_TOKEN` : 'Loading...'}
                  </p>
                </div>
                <p className="text-xs text-amber-500 dark:text-amber-400">
                  Note: Reseller needs to login first at /reseller to get their token, then share this link format with the customer replacing RESELLER_TOKEN with their actual token.
                </p>
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Quick Method: Ask the customer to</p>
                  <ol className="text-xs text-green-600 dark:text-green-400 mt-1 ml-4 list-decimal space-y-1">
                    <li>Go to <strong>/reseller</strong></li>
                    <li>Login with their reseller credentials</li>
                    <li>Use the Whitelist UID tab</li>
                  </ol>
                </div>
              </div>
              <button onClick={() => setShowShareModal(false)} className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">Close</button>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
