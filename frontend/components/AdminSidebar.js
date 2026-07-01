'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  HiChartBar,
  HiUsers,
  HiCube,
  HiShoppingBag,
  HiCog,
  HiKey,
  HiDownload,
  HiArrowLeft,
  HiX,
  HiMenu,
  HiShieldCheck,
  HiStar,
  HiUserGroup,
  HiOutlineChip,
  HiCurrencyDollar,
} from 'react-icons/hi';

const sidebarLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: HiChartBar, gradient: 'from-blue-400 to-blue-600' },
  { href: '/admin/users', label: 'Users', icon: HiUsers, gradient: 'from-green-400 to-green-600' },
  { href: '/admin/free-panels', label: 'Free Panels', icon: HiCube, gradient: 'from-cyan-400 to-cyan-600' },
  { href: '/admin/paid-panels', label: 'Paid Panels', icon: HiShoppingBag, gradient: 'from-amber-400 to-amber-600' },
  { href: '/admin/reselling', label: 'Reselling', icon: HiCurrencyDollar, gradient: 'from-purple-400 to-pink-600' },
  { href: '/admin/resellers', label: 'Resellers', icon: HiUserGroup, gradient: 'from-purple-400 to-pink-600' },
  { href: '/admin/uids', label: 'UIDs', icon: HiOutlineChip, gradient: 'from-teal-400 to-teal-600' },
  { href: '/admin/licenses', label: 'Licenses', icon: HiKey, gradient: 'from-purple-400 to-purple-600' },
  { href: '/admin/downloads', label: 'Downloads', icon: HiDownload, gradient: 'from-emerald-400 to-emerald-600' },
  { href: '/admin/ratings', label: 'Ratings', icon: HiStar, gradient: 'from-amber-400 to-amber-600' },
  { href: '/admin/settings', label: 'Settings', icon: HiCog, gradient: 'from-gray-400 to-gray-600' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Logo & Brand */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary-500/20 ring-2 ring-primary-500/20 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="VISION X CHEATS"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">VISION X CHEATS</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center">
              <HiShieldCheck className="w-3 h-3 mr-1 text-green-500" />
              Admin Panel
            </p>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {/* Active background gradient */}
              {isActive && (
                <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-90`} />
              )}

              {/* Icon */}
              <span className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-lg ${
                isActive
                  ? 'bg-white/20'
                  : 'bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
              </span>

              {/* Label */}
              <span className="relative z-10">{link.label}</span>

              {/* Active indicator dot */}
              {isActive && (
                <span className="relative z-10 ml-auto w-2 h-2 rounded-full bg-white/80 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to Store */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <Link
          href="/"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all group"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition-transform">
            <HiArrowLeft className="w-5 h-5" />
          </span>
          <span>Back to Store</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2.5 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        aria-label="Open admin menu"
      >
        <HiMenu className="w-5 h-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <div className="fixed top-20 left-0 w-64 h-[calc(100vh-5rem)] border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-800">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
