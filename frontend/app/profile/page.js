'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Image from 'next/image';
import {
  HiUser,
  HiDownload,
  HiKey,
  HiClock,
  HiCog,
  HiLogout,
  HiBadgeCheck,
  HiShieldCheck,
  HiCamera,
  HiX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const { user, loading, logout, isAdmin, setUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setIsLoadingData(true);
    try {
      const [historyRes, licensesRes] = await Promise.all([
        axios.get(`${API_URL}/users/download-history`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/users/licenses`).catch(() => ({ data: { data: [] } })),
      ]);
      setDownloadHistory(historyRes.data.data || []);
      setLicenses(licensesRes.data.data || []);
    } catch (error) {
      console.log('Failed to fetch user data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 32 * 1024 * 1024) {
      toast.error('Image must be under 32MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const uploadRes = await axios.post(`${API_URL}/upload/avatar`, { image: base64 }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 60000,
      });

      if (uploadRes.data.success) {
        const avatarUrl = uploadRes.data.data.url;
        const res = await axios.put(`${API_URL}/users/profile`, { avatar: avatarUrl });
        if (res.data.success) {
          setUser({ ...user, avatar: avatarUrl });
          toast.success('Profile picture updated!');
        }
      } else {
        toast.error(uploadRes.data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await axios.put(`${API_URL}/users/profile`, { avatar: '' });
      if (res.data.success) {
        setUser({ ...user, avatar: '' });
        toast.success('Profile picture removed');
      }
    } catch (err) {
      toast.error('Failed to remove avatar');
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'downloads' && downloadHistory.length === 0) {
      fetchUserData();
    } else if (tabId === 'licenses' && licenses.length === 0) {
      fetchUserData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="loading-spinner w-10 h-10" />
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiUser },
    { id: 'downloads', label: 'Downloads', icon: HiDownload },
    { id: 'licenses', label: 'Licenses', icon: HiKey },
    { id: 'settings', label: 'Settings', icon: HiCog },
  ];

  const TabButton = ({ tab, isActive: active }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => handleTabChange(tab.id)}
        className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{tab.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 via-transparent to-accent-500/5" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar with Upload */}
            <div className="relative group">
              {user.avatar ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white dark:ring-gray-800">
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800">
                  <span className="text-white text-3xl font-bold">
                    {user.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}

              {/* Upload overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading ? (
                  <div className="loading-spinner w-6 h-6 border-2 border-white/30 border-t-white" />
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                      title="Upload photo"
                    >
                      <HiCamera className="w-5 h-5" />
                    </button>
                    {user.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="p-2 rounded-lg bg-red-500/60 hover:bg-red-500/80 text-white transition-colors"
                        title="Remove photo"
                      >
                        <HiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarUpload(e.target.files[0])}
                disabled={avatarUploading}
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
                {isAdmin && (
                  <HiShieldCheck className="w-5 h-5 text-accent-500" title="Admin" />
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <HiBadgeCheck className="w-4 h-4 mr-1 text-green-500" />
                  {user.role === 'admin' ? 'Admin' : 'Member'}
                </span>
                <span className="flex items-center">
                  <HiClock className="w-4 h-4 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-secondary text-sm py-2.5 px-5"
            >
              <HiLogout className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} />
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-6 text-center">
                <HiDownload className="w-8 h-8 mx-auto text-primary-400 mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {downloadHistory.length}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Downloads</p>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <HiKey className="w-8 h-8 mx-auto text-amber-400 mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {licenses.length}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active Licenses</p>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <HiUser className="w-8 h-8 mx-auto text-green-400 mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Account Age (days)</p>
              </div>
            </div>
          )}

          {activeTab === 'downloads' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Download History</h2>
              {isLoadingData ? (
                <div className="flex justify-center py-8">
                  <div className="loading-spinner w-6 h-6" />
                </div>
              ) : downloadHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <HiDownload className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No downloads yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloadHistory.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                          <HiDownload className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.panelName}</p>
                          <p className="text-xs text-gray-500">{new Date(item.downloadedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'licenses' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Licenses</h2>
              {isLoadingData ? (
                <div className="flex justify-center py-8">
                  <div className="loading-spinner w-6 h-6" />
                </div>
              ) : licenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <HiKey className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No licenses yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {licenses.map((license, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                          <HiKey className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{license.panelName}</p>
                          <p className="text-xs font-mono text-gray-500">{license.licenseKey}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        license.expiresAt && new Date(license.expiresAt) < new Date()
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      }`}>
                        {license.expiresAt && new Date(license.expiresAt) < new Date() ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    className="input-field"
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="input-field"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={user.role === 'admin' ? 'Administrator' : 'Regular User'}
                    className="input-field"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    {user.avatar ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-sm">
                        <Image
                          src={user.avatar}
                          alt="Avatar"
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-sm">
                        <span className="text-white text-xl font-bold">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.avatar ? 'Avatar uploaded' : 'No avatar set'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Hover over your profile picture to upload
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
