'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight, HiUserGroup, HiShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('user');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithToken } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const googleBtnRef = useRef(null);

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

  const handleGoogleLogin = async (response) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        const success = await loginWithToken(data.token);
        if (success) {
          toast.success('Google login successful!');
          router.push('/');
        }
      } else {
        toast.error(data.message || 'Google login failed');
      }
    } catch (err) {
      toast.error('Google login failed');
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || activeTab !== 'user') return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        });
      }
    };

    if (document.getElementById('google-auth-script')) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-auth-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [activeTab, GOOGLE_CLIENT_ID]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/60 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 p-8 sm:p-10"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20">
              <Image src="/logo.png" alt="VISION X CHEATS" width={72} height={72} className="object-cover w-full h-full" priority />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
              Sign in to {settings.siteName || 'VISION X CHEATS'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'user'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => setActiveTab('reseller')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'reseller'
                  ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <HiUserGroup className="w-4 h-4" />
              Reseller Login
            </button>
          </div>

          {/* Google Button — always visible for User Login */}
          {activeTab === 'user' && (
            <div className="mb-5">
              <button
                type="button"
                onClick={() => {
                  if (!GOOGLE_CLIENT_ID) {
                    toast.error('Google Sign-In not configured. Contact admin.');
                    return;
                  }
                  window.google?.accounts?.id.prompt();
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white hover:bg-gray-50 dark:bg-white dark:hover:bg-gray-100 text-gray-800 dark:text-gray-900 text-[15px] font-medium transition-all duration-200 border border-gray-300 dark:border-gray-200 shadow-sm"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div ref={googleBtnRef} className="hidden" />

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-900 text-gray-400 text-xs">or sign in with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={activeTab === 'reseller' ? 'reseller@example.com' : 'you@example.com'}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                activeTab === 'reseller'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {activeTab === 'reseller' ? 'Sign In as Reseller' : 'Sign In'}
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          {activeTab === 'user' && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold">
                Create one
              </Link>
            </p>
          )}

          {activeTab === 'reseller' && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              Reseller credentials are provided by admin after purchase.
            </p>
          )}

          {/* Security badge */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              <HiShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
