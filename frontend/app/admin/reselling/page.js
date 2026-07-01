'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  HiTag, HiCollection, HiChip, HiPlus, HiPencil, HiTrash,
  HiCheckCircle, HiXCircle, HiCurrencyDollar, HiChartBar,
  HiEye, HiEyeOff, HiRefresh, HiSearch,
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuth() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

const emptyProduct = { name: '', description: '', category: 'paid', originalPrice: 0, resellPrice: 0, minResellPrice: 0, keyauthAppName: '', keyauthOwner: '', keyauthSecret: '', licenseDuration: 30, features: '', isActive: true };
const emptyCombo = { name: '', description: '', comboPrice: 0, minResellPrice: 0, discount: 0, badge: '', features: '', isActive: true, products: [] };
const emptyUid = { name: '', description: '', resellPrice: 0, minResellPrice: 0, gtcApiKey: '', gtcApiLink: 'https://gtccheats.xyz/Api/uidbypassapi/api_user.php', durationOptions: [{ days: 1, price: 5, label: '1 Day' }], features: '', isActive: true, maxUids: -1 };

export default function AdminResellingPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [uidBypass, setUidBypass] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const auth = getAuth();
    try {
      if (tab === 'products') {
        const r = await axios.get(`${API_URL}/admin/resell/products`, auth);
        setProducts(r.data.data || []);
      } else if (tab === 'combos') {
        const r = await axios.get(`${API_URL}/admin/resell/combos`, auth);
        setCombos(r.data.data || []);
      } else if (tab === 'uid') {
        const r = await axios.get(`${API_URL}/admin/resell/uid-bypass`, auth);
        setUidBypass(r.data.data || []);
      } else if (tab === 'stats') {
        const r = await axios.get(`${API_URL}/admin/resell/stats`, auth);
        setStats(r.data.data || {});
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 401) toast.error('Please login again');
      else if (err.response?.status === 403) toast.error('Admin access required');
      else toast.error('Failed to load: ' + msg);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    if (tab === 'products') setForm({ ...emptyProduct });
    else if (tab === 'combos') setForm({ ...emptyCombo });
    else setForm({ ...emptyUid });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      features: Array.isArray(item.features) ? item.features.join(', ') : (item.features || ''),
      durationOptions: item.durationOptions || [{ days: 1, price: 5, label: '1 Day' }],
      products: item.products || [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const auth = getAuth();
    const data = {
      ...form,
      features: typeof form.features === 'string' ? form.features.split(',').map(f => f.trim()).filter(Boolean) : form.features,
    };
    try {
      const endpoint = tab === 'products' ? 'products' : tab === 'combos' ? 'combos' : 'uid-bypass';
      if (editItem) {
        await axios.put(`${API_URL}/admin/resell/${endpoint}/${editItem._id}`, data, auth);
        toast.success('Updated!');
      } else {
        await axios.post(`${API_URL}/admin/resell/${endpoint}`, data, auth);
        toast.success('Created!');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    const auth = getAuth();
    try {
      const endpoint = tab === 'products' ? 'products' : tab === 'combos' ? 'combos' : 'uid-bypass';
      await axios.delete(`${API_URL}/admin/resell/${endpoint}/${id}`, auth);
      toast.success('Deleted!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    const auth = getAuth();
    try {
      const endpoint = tab === 'products' ? 'products' : tab === 'combos' ? 'combos' : 'uid-bypass';
      await axios.put(`${API_URL}/admin/resell/${endpoint}/${id}/toggle`, {}, auth);
      toast.success('Toggled!');
      fetchData();
    } catch (err) {
      toast.error('Failed to toggle');
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="loading-spinner" /></div>;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reselling Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage products, combos, and UID bypass resale</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="inline-flex items-center px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            <HiRefresh className="w-4 h-4 mr-1" /> Refresh
          </button>
          {tab !== 'stats' && (
            <button onClick={openCreate} className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm shadow-md shadow-primary-500/20 hover:shadow-lg transition-all">
              <HiPlus className="w-4 h-4 mr-1" />
              Add New
            </button>
          )}
        </div>
      </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {[
            { id: 'products', label: 'Products', icon: HiTag },
            { id: 'combos', label: 'Combos', icon: HiCollection },
            { id: 'uid', label: 'UID Bypass', icon: HiChip },
            { id: 'stats', label: 'Stats', icon: HiChartBar },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.id ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* FORM MODAL */}
        {showForm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
              <div
                className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editItem ? 'Edit' : 'Create'} {tab === 'products' ? 'Product' : tab === 'combos' ? 'Combo' : 'UID Bypass'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <Field label="Name" required>
                      <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required />
                    </Field>

                    {/* Description */}
                    <Field label="Description">
                      <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} className="input-field" />
                    </Field>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-3">
                      {tab !== 'uid' && (
                        <Field label="Original Price ($)">
                          <input type="number" step="0.01" value={form.originalPrice || 0} onChange={(e) => setForm({...form, originalPrice: parseFloat(e.target.value) || 0})} className="input-field" />
                        </Field>
                      )}
                      <Field label={tab === 'combos' ? 'Combo Price ($)' : 'Resell Price ($)'} required>
                        <input type="number" step="0.01" value={tab === 'combos' ? form.comboPrice : form.resellPrice} onChange={(e) => {
                          const v = parseFloat(e.target.value) || 0;
                          setForm(tab === 'combos' ? {...form, comboPrice: v} : {...form, resellPrice: v});
                        }} className="input-field" required />
                      </Field>
                    </div>
                    <Field label="Min Resell Price ($)">
                      <input type="number" step="0.01" value={form.minResellPrice || 0} onChange={(e) => setForm({...form, minResellPrice: parseFloat(e.target.value) || 0})} className="input-field" />
                    </Field>

                    {/* Product-specific */}
                    {tab === 'products' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="KeyAuth App Name">
                            <input type="text" value={form.keyauthAppName || ''} onChange={(e) => setForm({...form, keyauthAppName: e.target.value})} className="input-field" />
                          </Field>
                          <Field label="License Days">
                            <input type="number" value={form.licenseDuration || 30} onChange={(e) => setForm({...form, licenseDuration: parseInt(e.target.value) || 30})} className="input-field" />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="KeyAuth Owner">
                            <input type="text" value={form.keyauthOwner || ''} onChange={(e) => setForm({...form, keyauthOwner: e.target.value})} className="input-field" />
                          </Field>
                          <Field label="KeyAuth Secret">
                            <input type="text" value={form.keyauthSecret || ''} onChange={(e) => setForm({...form, keyauthSecret: e.target.value})} className="input-field" />
                          </Field>
                        </div>
                      </>
                    )}

                    {/* Combo-specific */}
                    {tab === 'combos' && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Discount (%)">
                          <input type="number" value={form.discount || 0} onChange={(e) => setForm({...form, discount: parseInt(e.target.value) || 0})} className="input-field" />
                        </Field>
                        <Field label="Badge (e.g. BEST VALUE)">
                          <input type="text" value={form.badge || ''} onChange={(e) => setForm({...form, badge: e.target.value})} className="input-field" />
                        </Field>
                      </div>
                    )}

                    {/* UID-specific */}
                    {tab === 'uid' && (
                      <>
                        <Field label="GTC API Key">
                          <input type="text" value={form.gtcApiKey || ''} onChange={(e) => setForm({...form, gtcApiKey: e.target.value})} className="input-field" />
                        </Field>
                        <Field label="Max UIDs (-1 = unlimited)">
                          <input type="number" value={form.maxUids ?? -1} onChange={(e) => setForm({...form, maxUids: parseInt(e.target.value) || -1})} className="input-field" />
                        </Field>
                      </>
                    )}

                    {/* Features */}
                    <Field label="Features (comma separated)">
                      <input type="text" value={form.features || ''} onChange={(e) => setForm({...form, features: e.target.value})} placeholder="Feature 1, Feature 2, Feature 3" className="input-field" />
                    </Field>

                    {/* Active */}
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-3">
                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
                      <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm shadow-md disabled:opacity-50 transition-all">
                        {saving ? 'Saving...' : (editItem ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="loading-spinner" /></div>
        ) : (
          <>
            {/* Stats */}
            {tab === 'stats' && stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Resell Products" value={stats.totalProducts || 0} sub={`${stats.activeProducts || 0} active`} color="bg-gradient-to-br from-purple-400 to-purple-600" />
                <StatCard title="Combo Packs" value={stats.totalCombos || 0} sub={`${stats.activeCombos || 0} active`} color="bg-gradient-to-br from-amber-400 to-orange-500" />
                <StatCard title="UID Bypass" value={stats.totalUidProducts || 0} sub={`${stats.activeUidProducts || 0} active`} color="bg-gradient-to-br from-emerald-400 to-teal-500" />
                <StatCard title="Total Revenue" value={`$${(stats.totalRevenue || 0).toFixed(2)}`} sub={`${stats.totalSales || 0} sales`} color="bg-gradient-to-br from-green-400 to-emerald-500" />
              </div>
            )}

            {/* Products List */}
            {tab === 'products' && (
              <div className="space-y-3">
                {products.length === 0 ? <Empty icon={HiTag} text="No products yet. Click Add New." /> :
                  products.map((item) => (
                    <Card key={item._id} item={item} badges={[{ t: item.category, c: 'purple' }, { t: `$${item.resellPrice}`, c: 'green' }]}
                      onEdit={() => openEdit(item)} onDelete={() => handleDelete(item._id)} onToggle={() => handleToggle(item._id)} />
                  ))}
              </div>
            )}

            {/* Combos List */}
            {tab === 'combos' && (
              <div className="space-y-3">
                {combos.length === 0 ? <Empty icon={HiCollection} text="No combos yet. Click Add New." /> :
                  combos.map((item) => (
                    <Card key={item._id} item={item} badges={[{ t: item.badge || 'Combo', c: 'amber' }, { t: `$${item.comboPrice}`, c: 'green' }, { t: `${item.discount || 0}% off`, c: 'red' }]}
                      onEdit={() => openEdit(item)} onDelete={() => handleDelete(item._id)} onToggle={() => handleToggle(item._id)} />
                  ))}
              </div>
            )}

            {/* UID Bypass List */}
            {tab === 'uid' && (
              <div className="space-y-3">
                {uidBypass.length === 0 ? <Empty icon={HiChip} text="No UID bypass products yet. Click Add New." /> :
                  uidBypass.map((item) => (
                    <Card key={item._id} item={item} badges={[{ t: 'UID Bypass', c: 'emerald' }, { t: `$${item.resellPrice}`, c: 'green' }]}
                      onEdit={() => openEdit(item)} onDelete={() => handleDelete(item._id)} onToggle={() => handleToggle(item._id)} />
                  ))}
              </div>
            )}
          </>
        )}
    </>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({ title, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <HiCurrencyDollar className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function Card({ item, badges, onEdit, onDelete, onToggle }) {
  const badgeColors = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:shadow-md transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</h3>
          {item.isActive ? <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <HiXCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-400 truncate mb-2">{item.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b, i) => (
            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badgeColors[b.c] || badgeColors.purple}`}>{b.t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-1 sm:flex-shrink-0">
        <button onClick={onToggle} className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="Toggle">
          {item.isActive ? <HiEye className="w-4 h-4" /> : <HiEyeOff className="w-4 h-4" />}
        </button>
        <button onClick={onEdit} className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all" title="Edit">
          <HiPencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete">
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, text }) {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50">
      <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
}
