'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCube, HiPlus, HiPencil, HiTrash, HiEye, HiSearch,
  HiStar, HiExclamation, HiPhotograph, HiLink,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import ImgbbUploader from '@/components/ImgbbUploader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const emptyPanel = {
  name: '', description: '', image: '', version: '1.0.0',
  category: 'EXTERNAL-ESP-MAX', downloadLink: '', shortenerLink: '',
  keyLink: '', videoLink: '', sellerApiLink: '', sellerAppName: '',
  sellerOwner: '', sellerKey: '', licenseDuration: 1, sellerVersion: '1.0',
  isFeatured: false, isActive: true,
};

const categories = [
  'EXTERNAL-ESP-MAX', 'EXTERNAL-ESP-BASIC', 'STREAMER-PANEL', 'AIMBOT-VISIBLE',
  'UID-BYPASS', 'EMULATOR-BYPASS', 'NORMAL-PANEL', 'COVER-AIMKILL',
  'AIMSILENT-COVER', 'SOURCE-CODE',
];

export default function AdminFreePanels() {
  const [panels, setPanels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [form, setForm] = useState(emptyPanel);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShortening, setIsShortening] = useState(false);

  useEffect(() => { fetchPanels(); }, []);

  const fetchPanels = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/panels/free`);
      setPanels(res.data.data || []);
    } catch (error) { console.log('Failed to fetch panels'); }
    finally { setIsLoading(false); }
  };

  const handleEdit = (panel) => {
    setEditingPanel(panel);
    setForm({
      name: panel.name || '', description: panel.description || '', image: panel.image || '',
      version: panel.version || '1.0.0', category: panel.category || 'EXTERNAL-ESP-MAX',
      downloadLink: panel.downloadLink || '', shortenerLink: panel.shortenerLink || '',
      keyLink: panel.keyLink || '', videoLink: panel.videoLink || '',
      sellerApiLink: panel.sellerApiLink || '',
      sellerAppName: panel.sellerAppName || '',
      sellerOwner: panel.sellerOwner || '',
      sellerKey: panel.sellerKey || '',
      licenseDuration: panel.licenseDuration || 1,
      sellerVersion: panel.sellerVersion || '1.0',
      isFeatured: panel.isFeatured || false,
    });
    setShowForm(true);
  };

  const handleNew = () => { setEditingPanel(null); setForm(emptyPanel); setShowForm(true); };

  const handleSave = async () => {
    try {
      if (editingPanel) {
        await axios.put(`${API_URL}/free-panels/${editingPanel._id}`, form);
        toast.success('Panel updated successfully');
      } else {
        await axios.post(`${API_URL}/free-panels`, form);
        toast.success('Panel created successfully');
      }
      setShowForm(false); setEditingPanel(null); fetchPanels();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to save panel'); }
  };

  const handleGenerateShortLink = async () => {
    if (!form.downloadLink) {
      toast.error('Enter a download link first');
      return;
    }

    setIsShortening(true);
    try {
      const res = await axios.post(`${API_URL}/admin/shorten`, {
        url: form.downloadLink,
        alias: form.name,
      });
      setForm(prev => ({ ...prev, shortenerLink: res.data.data.shortenedUrl }));
      toast.success('Indian Shortner link generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate short link');
    } finally {
      setIsShortening(false);
    }
  };

  const handleDelete = async (panelId) => {
    try {
      await axios.delete(`${API_URL}/free-panels/${panelId}`);
      toast.success('Panel deleted');
      fetchPanels();
    } catch (error) { toast.error('Failed to delete panel'); }
    setDeleteConfirm(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
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
              {editingPanel ? 'Edit Free Panel' : 'Add New Free Panel'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {editingPanel ? 'Update panel details' : 'Create a new free panel listing'}
            </p>
          </div>
          <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2 px-4">
            Cancel
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          {/* Basic Info Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mr-2">
                <HiCube className="w-3.5 h-3.5 text-primary-500" />
              </span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Panel Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Enter panel name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Version</label>
                <input name="version" value={form.version} onChange={handleChange} className="input-field" placeholder="1.0.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                  {categories.map(c => (
                    <option key={c} value={c}>{c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-6">
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

          {/* Media Section */}
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
                <textarea name="description" value={form.description} onChange={handleChange} className="input-field h-20 resize-none" placeholder="Describe what this panel does..." />
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mr-2">
                <HiEye className="w-3.5 h-3.5 text-emerald-500" />
              </span>
              Links & URLs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Download Link</label>
                <input name="downloadLink" value={form.downloadLink} onChange={handleChange} className="input-field" placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Shortener Link</label>
                <div className="flex gap-2">
                  <input name="shortenerLink" value={form.shortenerLink} onChange={handleChange} className="input-field flex-1" placeholder="Auto-generated from download link" />
                  <button
                    type="button"
                    onClick={handleGenerateShortLink}
                    disabled={isShortening || !form.downloadLink}
                    className="btn-secondary text-sm px-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate Indian Shortner link"
                  >
                    <HiLink className="w-4 h-4 mr-1" />
                    {isShortening ? '...' : 'Generate'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Leave blank to auto-generate when you save.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Get Key URL</label>
                <input name="keyLink" value={form.keyLink} onChange={handleChange} className="input-field" placeholder="https://discord.gg/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Video URL</label>
                <input name="videoLink" value={form.videoLink} onChange={handleChange} className="input-field" placeholder="https://youtube.com/..." />
              </div>
            </div>
          </div>

          {/* Seller / KeyAuth Configuration */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center mr-2">
                <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </span>
              Seller Configuration (License Key)
            </h3>
            <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30 space-y-4">
              <p className="text-xs text-violet-600 dark:text-violet-400">Set your KeyAuth App credentials. Users will get a license key.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Seller API Link</label>
                  <input name="sellerApiLink" value={form.sellerApiLink} onChange={handleChange} className="input-field" placeholder="https://keyauth.win/api/1.2/" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">KeyAuth App Name</label>
                  <input name="sellerAppName" value={form.sellerAppName} onChange={handleChange} className="input-field" placeholder="e.g. AIM SILENT" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">KeyAuth Owner ID</label>
                  <input name="sellerOwner" value={form.sellerOwner} onChange={handleChange} className="input-field font-mono text-xs" placeholder="e.g. DD3EccXCXj" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Seller Secret Key</label>
                  <input name="sellerKey" value={form.sellerKey} onChange={handleChange} className="input-field font-mono text-xs" placeholder="Enter your seller/secret key" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">License Duration</label>
                  <select name="licenseDuration" value={form.licenseDuration} onChange={handleChange} className="input-field">
                    <option value={1}>1 Day</option>
                    <option value={2}>2 Days</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>365 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">App Version (KeyAuth)</label>
                  <input name="sellerVersion" value={form.sellerVersion} onChange={handleChange} className="input-field" placeholder="1.0" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex justify-end">
            <div className="flex space-x-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Discard</button>
              <button onClick={handleSave} className="btn-primary text-sm">
                {editingPanel ? 'Update Panel' : 'Create Panel'}
              </button>
            </div>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Free Panels</h1>
          <p className="text-sm text-gray-500 mt-1">Manage free panel listings</p>
        </div>
        <button onClick={handleNew} className="btn-primary text-sm py-2.5 px-5 flex items-center">
          <HiPlus className="w-4 h-4 mr-2" /> Add Panel
        </button>
      </div>

      {/* Search */}
      {panels.length > 0 && (
        <div className="relative mb-6">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search panels by name or category..." className="input-field pl-12"
          />
        </div>
      )}

      {/* Panels List */}
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
              <HiCube className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">{panels.length === 0 ? 'No free panels yet' : 'No panels match your search'}</p>
            <p className="text-sm text-gray-400 mt-1">
              {panels.length === 0 ? 'Click "Add Panel" to create your first listing' : 'Try a different search term'}
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <HiCube className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</span>
                      {p.isFeatured && <HiStar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium">
                        {p.category}
                      </span>
                      <span>v{p.version}</span>
                      {p.author && <span>by {p.author}</span>}
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
