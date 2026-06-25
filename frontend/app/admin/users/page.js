'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUsers, HiSearch, HiBan, HiTrash, HiCheck,
  HiExclamation, HiMail, HiCalendar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchUsers(), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 50 };
      if (searchQuery) params.search = searchQuery;
      const res = await axios.get(`${API_URL}/admin/users`, { params });
      setUsers(res.data.data || []);
    } catch (error) {
      console.log('Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}/ban`);
      if (res.data.success) {
        toast.success(res.data.message || 'User banned successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Ban error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
    setConfirmModal(null);
  };

  const handleUnbanUser = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}/unban`);
      if (res.data.success) {
        toast.success(res.data.message || 'User unbanned successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Unban error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to unban user');
    }
    setConfirmModal(null);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await axios.delete(`${API_URL}/admin/users/${userId}`);
      if (res.data.success) {
        toast.success('User deleted');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
    setConfirmModal(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage registered users</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <HiUsers className="w-5 h-5" />
          <span>{users.length} users</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by username or email..."
          className="input-field pl-12 pr-4"
        />
      </div>

      {/* Users List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-3 border-gray-200 dark:border-gray-700" />
              <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <HiUsers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((u) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                      u.role === 'admin' ? 'from-amber-400 to-amber-600' : 'from-primary-400 to-accent-500'
                    } flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-sm font-bold">
                        {u.username?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    {u.isBanned && (
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                        <HiBan className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {u.username}
                      </span>
                      {u.role === 'admin' && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center">
                        <HiMail className="w-3 h-3 mr-1" />
                        {u.email}
                      </span>
                      <span className="flex items-center">
                        <HiCalendar className="w-3 h-3 mr-1" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {u.isBanned ? (
                    <button
                      onClick={() => setConfirmModal({ type: 'unban', user: u })}
                      className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                      title="Unban user"
                    >
                      <HiCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmModal({ type: 'ban', user: u })}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title="Ban user"
                    >
                      <HiBan className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmModal({ type: 'delete', user: u })}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Delete user"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                  confirmModal.type === 'delete'
                    ? 'bg-red-100 dark:bg-red-900/20'
                    : confirmModal.type === 'ban'
                    ? 'bg-red-100 dark:bg-red-900/20'
                    : 'bg-emerald-100 dark:bg-emerald-900/20'
                }`}>
                  <HiExclamation className={`w-7 h-7 ${
                    confirmModal.type === 'unban' ? 'text-emerald-500' : 'text-red-500'
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {confirmModal.type === 'unban' ? 'Unban' : confirmModal.type} User
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {confirmModal.type === 'delete'
                    ? `Are you sure you want to delete "${confirmModal.user.username}"? This action cannot be undone.`
                    : confirmModal.type === 'ban'
                    ? `Are you sure you want to ban "${confirmModal.user.username}"? They will lose access to the store.`
                    : `Are you sure you want to unban "${confirmModal.user.username}"? They will regain access.`}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 btn-secondary text-sm py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const id = confirmModal.user._id;
                    if (confirmModal.type === 'ban') handleBanUser(id);
                    else if (confirmModal.type === 'unban') handleUnbanUser(id);
                    else if (confirmModal.type === 'delete') handleDeleteUser(id);
                  }}
                  className={`flex-1 text-sm py-2.5 rounded-xl font-medium text-white ${
                    confirmModal.type === 'unban'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } transition-colors`}
                >
                  {confirmModal.type === 'unban' ? 'Unban' : confirmModal.type === 'delete' ? 'Delete' : 'Ban'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
