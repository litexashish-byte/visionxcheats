'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  HiDownload,
  HiStar,
  HiArrowRight,
  HiShieldCheck,
  HiLightningBolt,
  HiDeviceMobile,
  HiCube,
  HiShoppingBag,
  HiCheckCircle,
  HiEye,
  HiSparkles,
  HiUser,
} from 'react-icons/hi';
import { useSiteSettings } from '@/context/SiteSettingsContext';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const features = [
  {
    icon: HiDownload,
    title: 'Fast Downloads',
    description: 'High-speed download servers with 24/7 availability',
    gradient: 'from-blue-400 to-cyan-500',
    stats: '10K+ Downloads',
  },
  {
    icon: HiShieldCheck,
    title: 'Secure & Verified',
    description: 'All files scanned and verified for your safety',
    gradient: 'from-green-400 to-emerald-500',
    stats: '100% Safe',
  },
  {
    icon: HiLightningBolt,
    title: 'Instant Access',
    description: 'Get immediate access after quick verification',
    gradient: 'from-purple-400 to-violet-500',
    stats: 'Under 30s',
  },
  {
    icon: HiDeviceMobile,
    title: 'Cross Platform',
    description: 'Works seamlessly across all major platforms',
    gradient: 'from-orange-400 to-red-500',
    stats: 'All Devices',
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({ freePanels: 0, paidPanels: 0, totalUsers: 0, avgRating: '0.0' });
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await axios.get(`${API_URL}/auth/stats`).catch(() => ({ data: { data: { freePanels: 0, paidPanels: 0, totalUsers: 0, avgRating: '0.0' } } }));
        setStats(statsRes.data.data || { freePanels: 0, paidPanels: 0, totalUsers: 0, avgRating: '0.0' });
      } catch (error) {
        console.log('API not available yet');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Shopping App Style */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        {/* Premium Background Effects */}          <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-400/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full 
                         bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 
                         text-sm font-medium mb-6 border border-primary-200 dark:border-primary-800/30"
              >
                <HiSparkles className="w-4 h-4" />
                <span>Trusted by thousands worldwide</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                Premium Digital
                <br />
                <span className="gradient-text">Panels & Tools</span>
              </h1>

              <p className="text-lg text-gray-500 dark:text-gray-400 mb-6 max-w-lg">
                Your one-stop destination for the latest digital panels, tools, and utilities. 
                Download free panels or unlock premium features.
              </p>

              {/* Stats Row */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <HiUser className="w-5 h-5 text-primary-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white">{stats.totalUsers}</span> Active Users
                  </span>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center space-x-1">
                  <HiStar className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white">{stats.avgRating}</span> Rating
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/free-panels"
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl 
                           bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold
                           shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40
                           transition-all duration-300 hover:-translate-y-0.5 text-lg"
                >
                  <HiDownload className="w-5 h-5" />
                  <span>Browse Free Panels</span>
                </Link>
                <Link
                  href="/paid-panels"
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl 
                           bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold
                           border border-gray-200 dark:border-gray-700
                           shadow-lg hover:shadow-xl hover:-translate-y-0.5
                           transition-all duration-300 text-lg"
                >
                  <HiShoppingBag className="w-5 h-5" />
                  <span>View Premium</span>
                  <HiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right - Hero Cards Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
  

                {/* Main Card */}
                <div className="w-72 h-72 mx-auto rounded-3xl bg-gradient-to-br from-primary-400/20 
                              via-sky-400/10 to-accent-500/20 border border-gray-200/30 
                              dark:border-gray-700/30 backdrop-blur-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 
                                flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-4">
                      <HiCube className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Browse Collection
                    </p>
                    <p className="text-2xl font-bold gradient-text">
                      {stats.freePanels + stats.paidPanels}+ Panels
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Features Strip */}
      <section className="py-12 bg-white/30 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-4 rounded-2xl bg-white dark:bg-gray-800/50 
                           border border-gray-100 dark:border-gray-700/50 
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} 
                                  flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-xs text-gray-400">{feature.stats}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Secure Payment Methods */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-primary-500 dark:text-primary-400 tracking-widest uppercase mb-3">Secure Payments</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Secure Payment Methods
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto mb-12">
              We accept payments from around the world with top-tier security
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12"
          >
            {[
              { name: 'Crypto', sub: 'BTC, ETH, USDT', color: 'from-primary-500 to-primary-600', shadow: 'shadow-primary-500/20' },
              { name: 'UPI', sub: 'India', color: 'from-accent-500 to-accent-600', shadow: 'shadow-accent-500/20' },
              { name: 'Bkash', sub: 'Bangladesh', color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20' },
              { name: 'Cards', sub: 'Visa, Mastercard', color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
              { name: 'PayPal', sub: 'Global', color: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/20' },
            ].map((method, i) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                className={`group bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 
                           rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 
                           hover:shadow-xl ${method.shadow} dark:hover:shadow-2xl`}
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${method.color} 
                                flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  {method.name === 'Crypto' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                  {method.name === 'UPI' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  )}
                  {method.name === 'Bkash' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  )}
                  {method.name === 'Cards' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  )}
                  {method.name === 'PayPal' && (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-base">{method.name}</h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{method.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 dark:text-gray-500 text-sm"
          >
            Secure payments accepted globally with 256-bit encryption
          </motion.p>
        </div>
      </section>



      {/* Premium CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
                     p-8 sm:p-12 text-center border border-gray-700/50 shadow-2xl"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 
                         flex items-center justify-center shadow-2xl shadow-primary-500/20 mb-6">
                <HiShoppingBag className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Ready to Get Started?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                Join thousands of users who trust {settings.siteName || 'VISION X CHEATS'} for their digital panel needs.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl 
                           bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold
                           shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40
                           transition-all duration-300 hover:-translate-y-0.5"
                >
                  <HiCheckCircle className="w-5 h-5" />
                  <span>Create Free Account</span>
                </Link>
                <Link
                  href="/free-panels"
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl 
                           bg-white/10 text-white font-bold border border-white/20
                           hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <HiEye className="w-5 h-5" />
                  <span>Browse Panels</span>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <HiCheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free to join</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HiCheckCircle className="w-4 h-4 text-green-400" />
                  <span>No credit card</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HiCheckCircle className="w-4 h-4 text-green-400" />
                  <span>Instant access</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
