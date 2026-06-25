'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShoppingBag, HiPlus, HiPencil, HiTrash, HiStar,
  HiExclamation, HiSearch, HiTag, HiCash, HiPhotograph,
  HiChat,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import ImgbbUploader from '@/components/ImgbbUploader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const emptyPanel = {
  name: '', description: '', image: '', price: 0, originalPrice: null,
  features: [''], category: 'EXTERNAL-ESP-MAX', contactDiscord: '', contactTelegram: '', isFeatured: false, isActive: true,
};

const categories = [
  'EXTERNAL-ESP-MAX', 'EXTERNAL-ESP-BASIC', 'STREAMER-PANEL', 'AIMBOT-VISIBLE',
  'UID-BYPASS', 'EMULATOR-BYPASS', 'NORMAL-PANEL', 'COVER-AIMKILL',
  'AIMSILENT-COVER', 'SOURCE-CODE',
];

export default function AdminPaidPanels() {
  const [panels, setPanels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [form, setForm] = useState(emptyPanel);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchPanels(); }, []);

  const fetchPanels = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/panels/paid`);
      setPanels(res.data.data || []);
    } catch (error) { console.log('Failed to fetch panels'); }
    finally { setIsLoading(false); }
  };

  const handleEdit = (p) => {
    setEditingPanel(p);
    setForm({
      name: p.name || '', description: p.description || '', image: p.image || '',
      price: p.price || 0, originalPrice: p.originalPrice || null,
      features: p.features?.length ? p.features : [''],
      category: p.category || 'EXTERNAL-ESP-MAX', contactDiscord: p.contactDiscord || '',
      contactTelegram: p.contactTelegram || '', isFeatured: p.isFeatured || false,
    });
    setShowForm(true);
  };

  const handleNew = () => { setEditingPanel(null); setForm(emptyPanel); setShowForm(true); };

  const handleSave = async () => {
    const payload = { ...form, features: form.features.filter(f => f.trim()) };
    try {
      if (editingPanel) {
        await axios.put(`${API_URL}/paid-panels/${editingPanel._id}`, payload);
        toast.success('Panel updated successfully');
      } else {
        await axios.post(`${API_URL}/paid-panels`, payload);
        toast.success('Panel created successfully');
      }
      setShowForm(false); setEditingPanel(null); fetchPanels();
    } catch (error) { toast.error('Failed to save panel'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API_URL}/paid-panels/${id}`); toast.success('Panel deleted'); fetchPanels(); }
    catch (e) { toast.error('Failed to delete'); }
    setDeleteConfirm(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const removeFeature = (i) => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });
  const updateFeature = (i, val) => {
    const f = [...form.features];
    f[i] = val;
    setForm({ ...form, features: f });
  };

  const filteredPanels = panels.filter(p =>
    !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Inline Form
  if (showForm) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {editingPanel ? 'Edit Paid Panel' : 'Add New Paid Panel'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {editingPanel ? 'Update premium panel details' : 'Create a new premium panel listing'}
            </p>
          </div>
          <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-2">
                <HiTag className="w-3.5 h-3.5 text-amber-500" />
              </span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Panel Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Enter panel name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                  {categories.map(c => (
                    <option key={c} value={c}>{c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <HiCash className="w-4 h-4 mr-1 text-green-500" /> Price ($)
                </label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className="input-field" min="0" step="0.01" placeholder="29.99" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Original Price ($)</label>
                <input name="originalPrice" type="number" value={form.originalPrice || ''} onChange={handleChange} className="input-field" min="0" step="0.01" placeholder="49.99 (optional)" />
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500" />
                </label>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <HiStar className="w-4 h-4 text-amber-500 mr-1.5" />
                  Featured Panel
                </span>
              </div>
            </div>
          </div>

          {/* Media & Description */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center mr-2">
                <HiPhotograph className="w-3.5 h-3.5 text-cyan-500" />
              </span>
              Media & Description
            </h3>
            <div className="space-y-4">
              <ImgbbUploader value={form.image} onChange={(val) => setForm({ ...form, image: val })} label="Panel Image" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="input-field h-20 resize-none" placeholder="Describe what this premium panel offers..." />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-2">
                <HiStar className="w-3.5 h-3.5 text-purple-500" />
              </span>
              Features
            </h3>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input value={f} onChange={(e) => updateFeature(i, e.target.value)} className="input-field flex-1" placeholder={`Feature ${i + 1}`} />
                  <button onClick={() => removeFeature(i)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">✕</button>
                </div>
              ))}
              <button onClick={addFeature} className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center">
                <HiPlus className="w-3.5 h-3.5 mr-1" /> Add Feature
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-2">
                <HiChat className="w-3.5 h-3.5 text-green-500" />
              </span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Discord</label>
                <input name="contactDiscord" value={form.contactDiscord} onChange={handleChange} className="input-field" placeholder="discord.gg/invite" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Telegram</label>
                <input name="contactTelegram" value={form.contactTelegram} onChange={handleChange} className="input-field" placeholder="t.me/username" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex justify-end space-x-3">
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Discard</button>
            <button onClick={handleSave} className="btn-primary text-sm">
              {editingPanel ? 'Update Panel' : 'Create Panel'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Paid Panels</h1>
          <p className="text-sm text-gray-500 mt-1">Manage premium panel listings</p>
        </div>
        <button onClick={handleNew} className="btn-primary text-sm py-2.5 px-5 flex items-center">
          <HiPlus className="w-4 h-4 mr-2" /> Add Panel
        </button>
      </div>

      {/* Search */}
      {panels.length > 0 && (
        <div className="relative mb-6">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search panels..." className="input-field pl-12" />
        </div>
      )}

      {/* List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-3 border-gray-200 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading panels...</p>
          </div>
        ) : filteredPanels.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <HiShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">{panels.length === 0 ? 'No paid panels yet' : 'No panels match your search'}</p>
            <p className="text-sm text-gray-400 mt-1">
              {panels.length === 0 ? 'Click "Add Panel" to create your first premium listing' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredPanels.map((p) => (
              <motion.div
                key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  {p.image ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                      <HiShoppingBag className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</span>
                      {p.isFeatured && <HiStar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                      <span className="font-semibold text-amber-500">${p.price}</span>
                      {p.originalPrice && <span className="line-through text-gray-400">${p.originalPrice}</span>}
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium">{p.category}</span>
                      <span>{p.salesCount || 0} sales</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button onClick={() => handleEdit(p)} className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all" title="Edit">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(p)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <HiExclamation className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Panel</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to delete <strong>&quot;{deleteConfirm.name}&quot;</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 text-sm py-2.5 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
