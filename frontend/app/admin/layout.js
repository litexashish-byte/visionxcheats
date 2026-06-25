'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiChartBar,
  HiUsers,
  HiCube,
  HiShoppingBag,
  HiKey,
  HiDownload,
  HiCog,
  HiChevronRight,
  HiLogout,
  HiUser,
  HiStar,
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const breadcrumbMap = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/free-panels': 'Free Panels',
  '/admin/paid-panels': 'Paid Panels',
  '/admin/licenses': 'Licenses',
  '/admin/downloads': 'Downloads',
  '/admin/resellers': 'Resellers',
  '/admin/ratings': 'Ratings',
  '/admin/settings': 'Settings',
};

const pageIcons = {
  '/admin/dashboard': HiChartBar,
  '/admin/users': HiUsers,
  '/admin/free-panels': HiCube,
  '/admin/paid-panels': HiShoppingBag,
  '/admin/licenses': HiKey,
  '/admin/downloads': HiDownload,
  '/admin/ratings': HiStar,
  '/admin/settings': HiCog,
};

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, isAdmin, router]);

  const currentPage = breadcrumbMap[pathname] || 'Admin';
  const PageIcon = pageIcons[pathname] || HiChartBar;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/30" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AdminSidebar />
      
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Admin</span>
                <HiChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <div className="flex items-center space-x-2">
                  <PageIcon className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span>
                </div>
              </div>
              <div className="lg:hidden flex items-center space-x-2 pl-10">
                <PageIcon className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">{currentPage}</span>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                    {user?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary-500/20 ring-2 ring-white dark:ring-gray-800 flex-shrink-0 bg-gradient-to-br from-primary-400 to-accent-500">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {(user?.username || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                        {user?.role || 'user'}
                      </span>
                    </div>
                    <div className="pt-1">
                      <Link href="/profile" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <HiUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <HiLogout className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-8 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} {settings?.siteName || 'VISION X CHEATS'}. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              v1.0.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
