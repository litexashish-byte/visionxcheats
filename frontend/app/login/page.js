'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight, HiUserGroup } from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('user');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setIsLoading(true);

    if (activeTab === 'reseller') {
      try {
        const res = await fetch(`${API_URL}/uid-management/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('reseller_token', data.data.token);
          localStorage.setItem('reseller_data', JSON.stringify(data.data.reseller));
          toast.success('Reseller login successful!');
          router.push('/reseller');
        } else {
          toast.error(data.message || 'Login failed');
        }
      } catch (err) {
        toast.error('Connection error');
      }
    } else {
      const result = await login(formData.email, formData.password);
      if (result.success) router.push('/');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg shadow-primary-500/20 mb-4 animate-float">
                <Image src="/logo.png" alt="VISION X CHEATS" fill className="object-cover" sizes="80px" priority />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to {settings.siteName || 'VISION X CHEATS'}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('user')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'user'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                User Login
              </button>
              <button
                onClick={() => setActiveTab('reseller')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'reseller'
                    ? 'bg-white dark:bg-gray-700 text-amber-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <HiUserGroup className="w-4 h-4" />
                Reseller Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={activeTab === 'reseller' ? 'reseller@example.com' : 'you@example.com'}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input-field pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 text-base rounded-xl font-semibold transition-all ${
                  activeTab === 'reseller'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                    : 'btn-primary'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {activeTab === 'reseller' ? 'Sign In as Reseller' : 'Sign In'}
                    <HiArrowRight className="w-5 h-5 ml-2" />
                  </span>
                )}
              </button>
            </form>

            {activeTab === 'user' && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary-500 hover:text-primary-600 font-semibold">
                  Create one
                </Link>
              </p>
            )}

            {activeTab === 'reseller' && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                Reseller credentials are provided by admin after purchase.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
