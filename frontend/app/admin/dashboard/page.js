'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  HiUsers,
  HiDownload,
  HiCube,
  HiShoppingBag,
  HiKey,
  HiTrendingUp,
  HiArrowUp,
  HiArrowRight,
  HiPlus,
  HiEye,
  HiShieldCheck,
  HiCalendar,
  HiClock,
} from 'react-icons/hi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDownloads: 0,
    freePanelCount: 0,
    paidPanelCount: 0,
    totalLicenses: 0,
    activeLicenses: 0,
    todayUsers: 0,
    todayDownloads: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard`);
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRecentUsers(res.data.data.recentUsers || []);
      }
    } catch (error) {
      console.log('Dashboard API not available');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      today: stats.todayUsers,
      icon: HiUsers,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
      link: '/admin/users',
    },
    {
      label: 'Total Downloads',
      value: stats.totalDownloads,
      today: stats.todayDownloads,
      icon: HiDownload,
      gradient: 'from-green-500 to-green-600',
      lightBg: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200/50 dark:border-green-800/50',
      link: '/admin/downloads',
    },
    {
      label: 'Free Panels',
      value: stats.freePanelCount,
      icon: HiCube,
      gradient: 'from-cyan-500 to-cyan-600',
      lightBg: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200/50 dark:border-cyan-800/50',
      link: '/admin/free-panels',
    },
    {
      label: 'Paid Panels',
      value: stats.paidPanelCount,
      icon: HiShoppingBag,
      gradient: 'from-amber-500 to-amber-600',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200/50 dark:border-amber-800/50',
      link: '/admin/paid-panels',
    },
    {
      label: 'Total Licenses',
      value: stats.totalLicenses,
      icon: HiKey,
      gradient: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200/50 dark:border-purple-800/50',
      link: '/admin/licenses',
    },
    {
      label: 'Active Licenses',
      value: stats.activeLicenses,
      icon: HiTrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
      link: '/admin/licenses',
    },
  ];

  const quickActions = [
    { label: 'Add Free Panel', icon: HiPlus, href: '/admin/free-panels', gradient: 'from-cyan-500 to-cyan-600' },
    { label: 'Add Paid Panel', icon: HiShoppingBag, href: '/admin/paid-panels', gradient: 'from-amber-500 to-amber-600' },
    { label: 'Generate License', icon: HiKey, href: '/admin/licenses', gradient: 'from-purple-500 to-purple-600' },
    { label: 'View Users', icon: HiEye, href: '/admin/users', gradient: 'from-blue-500 to-blue-600' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <HiClock className="w-4 h-4 mr-1.5" />
          Welcome back! Here&apos;s your store overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.link}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-2xl p-5 lg:p-6 ${card.lightBg} ${card.borderColor} border cursor-pointer transition-shadow hover:shadow-xl hover:shadow-black/5 relative overflow-hidden group`}
              >
                {/* Subtle hover glow */}
                <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`} />

                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  {card.today !== undefined && card.today > 0 && (
                    <span className="flex items-center space-x-1 text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                      <HiArrowUp className="w-3 h-3" />
                      <span>+{card.today} today</span>
                    </span>
                  )}
                </div>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="skeleton h-8 w-24 rounded-lg" />
                    <div className="skeleton h-4 w-16 rounded-lg" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {card.value.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Quick Actions + Recent Users Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-5 lg:p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Quick Actions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Common admin tasks</p>
            <div className="space-y-2.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{action.label}</span>
                      <HiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Users</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest registered users</p>
              </div>
              <Link
                href="/admin/users"
                className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center"
              >
                View All
                <HiArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            {recentUsers.length === 0 ? (
              <div className="text-center py-10">
                <HiUsers className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No users yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-bold">
                          {u.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.username}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {u.isBanned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          Banned
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center">
                        <HiCalendar className="w-3 h-3 mr-1" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
