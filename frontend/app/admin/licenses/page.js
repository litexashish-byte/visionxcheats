'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiKey, HiPlus, HiBan, HiCheck, HiClipboardCopy,
  HiExclamation, HiCalendar, HiTag, HiClock,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuth() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateForm, setGenerateForm] = useState({ panelId: '', panelName: '', quantity: 1, expiresInDays: '' });
  const [disableConfirm, setDisableConfirm] = useState(null);

  useEffect(() => { fetchLicenses(); }, []);

  const fetchLicenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/licenses`, getAuth());
      setLicenses(res.data.data || []);
    } catch (error) { console.log('Failed to fetch'); }
    finally { setIsLoading(false); }
  };

  const handleGenerate = async () => {
    try {
      const res = await axios.post(`${API_URL}/licenses/generate`, generateForm, getAuth());
      if (res.data.success) {
        toast.success(`${generateForm.quantity} license(s) generated`);
        setShowGenerate(false);
        setGenerateForm({ panelId: '', panelName: '', quantity: 1, expiresInDays: '' });
        fetchLicenses();
      }
    } catch (error) { toast.error('Failed to generate'); }
  };

  const handleDisable = async (id) => {
    try {
      await axios.put(`${API_URL}/licenses/${id}/disable`, {}, getAuth());
      toast.success('License disabled');
      fetchLicenses();
    } catch (error) { toast.error('Failed'); }
    setDisableConfirm(null);
  };

  const handleEnable = async (id) => {
    try {
      await axios.put(`${API_URL}/licenses/${id}/enable`, {}, getAuth());
      toast.success('License enabled');
      fetchLicenses();
    } catch (error) { toast.error('Failed'); }
    setDisableConfirm(null);
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('License key copied');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Licenses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage license keys</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="btn-primary text-sm py-2.5 px-5 flex items-center">
          <HiPlus className="w-4 h-4 mr-2" /> Generate Keys
        </button>
      </div>

      {/* Generate Form */}
      <>
        {showGenerate && (
          <div
            className="overflow-hidden mb-6"
          >
            <div className="glass-card rounded-2xl p-5 lg:p-6">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                  <HiKey className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Generate License Keys</h3>
                  <p className="text-xs text-gray-500">Create new license keys for panels</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Panel ID</label>
                  <input value={generateForm.panelId} onChange={e => setGenerateForm({...generateForm, panelId: e.target.value})} className="input-field text-sm" placeholder="Panel ID" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Panel Name</label>
                  <input value={generateForm.panelName} onChange={e => setGenerateForm({...generateForm, panelName: e.target.value})} className="input-field text-sm" placeholder="Panel Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                  <input type="number" value={generateForm.quantity} onChange={e => setGenerateForm({...generateForm, quantity: parseInt(e.target.value) || 1})} className="input-field text-sm" min="1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Expires in (days)</label>
                  <input type="number" value={generateForm.expiresInDays} onChange={e => setGenerateForm({...generateForm, expiresInDays: e.target.value})} className="input-field text-sm" placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowGenerate(false)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                <button onClick={handleGenerate} className="btn-primary text-sm py-2 px-5">Generate Keys</button>
              </div>
            </div>
          </div>
        )}
      </>

      {/* Licenses List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-3 border-gray-200 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading licenses...</p>
          </div>
        ) : licenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <HiKey className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No licenses generated yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Generate Keys" to create your first license</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {licenses.map((l) => {
              const isExpired = l.expiresAt && new Date(l.expiresAt) < new Date();
              return (
                <div
                  key={l._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <HiKey className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg text-gray-800 dark:text-gray-200 truncate max-w-[160px] lg:max-w-[220px]">
                          {l.licenseKey}
                        </code>
                        <button onClick={() => copyKey(l.licenseKey)} className="p-1 rounded text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all" title="Copy key">
                          <HiClipboardCopy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <HiTag className="w-3 h-3 mr-1" />
                          {l.panelName || '—'}
                        </span>
                        <span className="flex items-center">
                          <HiCalendar className="w-3 h-3 mr-1" />
                          Created {new Date(l.createdAt).toLocaleDateString()}
                        </span>
                        {l.expiresAt && (
                          <span className="flex items-center">
                            <HiClock className="w-3 h-3 mr-1" />
                            Expires {new Date(l.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {/* Status Badge */}
                    {l.isDisabled ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Disabled</span>
                    ) : isExpired ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500">Expired</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Active</span>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => l.isDisabled ? handleEnable(l._id) : setDisableConfirm(l)}
                      className={`p-2 rounded-lg transition-all ${
                        l.isDisabled
                          ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={l.isDisabled ? 'Enable' : 'Disable'}
                    >
                      {l.isDisabled ? <HiCheck className="w-4 h-4" /> : <HiBan className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Disable Confirmation Modal */}
      <>
        {disableConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDisableConfirm(null)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <HiExclamation className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Disable License</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to disable this license key? The user will lose access to the panel.
                </p>
                <code className="inline-block mt-3 text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300">
                  {disableConfirm.licenseKey}
                </code>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setDisableConfirm(null)} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
                <button onClick={() => handleDisable(disableConfirm._id)} className="flex-1 text-sm py-2.5 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">Disable</button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
