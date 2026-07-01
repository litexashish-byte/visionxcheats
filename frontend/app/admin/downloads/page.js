'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  HiDownload, HiChartBar, HiArrowDown, HiArrowUp, HiSearch,
  HiClock, HiGlobe, HiUser, HiDocument, HiTrash,
} from 'react-icons/hi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuth() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export default function AdminDownloads() {
  const [downloads, setDownloads] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalDownloads: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchDownloads(); }, [activeFilter]);

  const fetchDownloads = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/downloads`, { params: { status: activeFilter }, ...getAuth() });
      setDownloads(res.data.data || []);
      setStats(res.data.stats || { total: 0, totalDownloads: 0, pending: 0 });
    } catch (error) { console.log('Failed to fetch'); }
    finally { setIsLoading(false); }
  };

  const resetDownloads = async () => {
    if (!confirm('Are you sure you want to reset ALL downloads? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/downloads`, getAuth());
      toast.success('All downloads reset');
      fetchDownloads();
    } catch (error) {
      toast.error('Failed to reset downloads');
    }
  };

  const filteredDownloads = downloads.filter(d =>
    !searchQuery ||
    d.panelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.userId?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.ipAddress?.includes(searchQuery)
  );

  const getStatusStyle = (d) => {
    if (d.downloadCompleted) return { label: 'Completed', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (d.shortenerCompleted) return { label: 'Processing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    return { label: 'Started', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Downloads</h1>
          <p className="text-sm text-gray-500 mt-1">Track and monitor all downloads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDownloads} className="btn-secondary text-sm py-2 px-4 flex items-center">
            <HiChartBar className="w-4 h-4 mr-2" /> Refresh
          </button>
          <button onClick={resetDownloads} className="text-sm py-2 px-4 flex items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all font-medium">
            <HiTrash className="w-4 h-4 mr-2" /> Reset All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => setActiveFilter('all')}
          className={`glass-card rounded-2xl p-5 text-center cursor-pointer transition-all ${activeFilter === 'all' ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
            <HiDownload className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{stats.total}</div>
          <p className="text-xs text-gray-500 mt-1">Total Attempts</p>
        </div>
        <div
          onClick={() => setActiveFilter('completed')}
          className={`glass-card rounded-2xl p-5 text-center cursor-pointer transition-all ${activeFilter === 'completed' ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}>
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
            <HiArrowDown className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-green-500 tabular-nums">{stats.totalDownloads}</div>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
        <div
          onClick={() => setActiveFilter('pending')}
          className={`glass-card rounded-2xl p-5 text-center cursor-pointer transition-all ${activeFilter === 'pending' ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}`}>
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
            <HiArrowUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-500 tabular-nums">{stats.pending}</div>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Search */}
      {downloads.length > 0 && (
        <div className="relative mb-6">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by panel name, user, or IP..." className="input-field pl-12"
          />
        </div>
      )}

      {/* Downloads List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-3 border-gray-200 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading downloads...</p>
          </div>
        ) : filteredDownloads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <HiDownload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {downloads.length === 0 ? 'No downloads yet' : 'No downloads match your search'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {downloads.length === 0 ? 'Downloads will appear here when users start downloading panels' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredDownloads.map((d) => {
              const status = getStatusStyle(d);
              return (
                <div
                  key={d._id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <HiDocument className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {d.panelName}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center">
                          <HiUser className="w-3 h-3 mr-1" />
                          {d.userId?.username || 'Guest'}
                        </span>
                        <span className="flex items-center">
                          <HiGlobe className="w-3 h-3 mr-1" />
                          {d.ipAddress || '—'}
                        </span>
                        <span className="flex items-center">
                          <HiClock className="w-3 h-3 mr-1" />
                          {new Date(d.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.bg} ${status.color} flex-shrink-0`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
