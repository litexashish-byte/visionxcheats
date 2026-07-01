'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  HiStar, HiTrash, HiUser, HiChartBar, HiSearch, HiRefresh, HiCube, HiShoppingBag,
} from 'react-icons/hi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuth() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export default function AdminRatings() {
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchRatings(); }, []);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/ratings`, getAuth());
      setRatings(res.data.data || []);
    } catch (error) {
      console.error('Ratings fetch error:', error);
      setRatings([]);
    }
    finally { setIsLoading(false); }
  };

  const deleteRating = async (id) => {
    if (!confirm('Delete this rating?')) return;
    try {
      await axios.delete(`${API_URL}/ratings/${id}`, getAuth());
      toast.success('Rating deleted');
      fetchRatings();
    } catch (error) {
      toast.error('Failed to delete rating');
    }
  };

  const resetRatings = async () => {
    if (!confirm('Delete ALL ratings? This cannot be undone.')) return;
    try {
      const deletePromises = ratings.map(r =>
        axios.delete(`${API_URL}/ratings/${r._id}`, getAuth())
      );
      await Promise.all(deletePromises);
      toast.success('All ratings deleted');
      fetchRatings();
    } catch (error) {
      toast.error('Failed to reset ratings');
    }
  };

  const filteredRatings = ratings.filter(r =>
    !searchQuery ||
    r.userId?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.panelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.panelId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <HiStar className="w-8 h-8 text-amber-500" />
              User Ratings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">See who rated which panel and manage them</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchRatings}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all font-medium">
              <HiRefresh className="w-5 h-5" />
              Refresh
            </button>
            <button onClick={resetRatings}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all font-medium">
              <HiTrash className="w-5 h-5" />
              Delete All
            </button>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <HiStar className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Ratings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ratings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center">
              <HiChartBar className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <HiUser className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(ratings.map(r => r.userId?._id || r.userId)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <HiCube className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Panels Rated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(ratings.map(r => r.panelId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mb-6">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by username, email, panel name..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                       rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       placeholder:text-gray-400 transition-all" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="loading-spinner w-10 h-10" /></div>
      ) : filteredRatings.length === 0 ? (
        <div
          className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <HiStar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No matching ratings' : 'No ratings yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Ratings will appear here once users rate panels'}
          </p>
        </div>
      ) : (
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Panel</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRatings.map((rating) => (
                  <tr key={rating._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {rating.userId?.avatar ? (
                          <img src={rating.userId.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {(rating.userId?.username || rating.userId?.email || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {rating.userId?.username || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{rating.userId?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {rating.panelType === 'paid' ? (
                          <HiShoppingBag className="w-4 h-4 text-amber-500" />
                        ) : (
                          <HiCube className="w-4 h-4 text-cyan-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{rating.panelName}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{rating.panelId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        rating.panelType === 'paid'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {rating.panelType === 'paid' ? 'Paid' : 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <HiStar key={star} className={`w-4 h-4 ${
                            star <= rating.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200 dark:text-gray-600'
                          }`} />
                        ))}
                        <span className="ml-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                          {rating.rating}.0
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(rating.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(rating.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => deleteRating(rating._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete rating">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
