'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HiCube, HiShieldCheck, HiCode, HiUserGroup, HiKey, HiDeviceMobile, HiTemplate, HiPhotograph, HiEye, HiCollection } from 'react-icons/hi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const categoryIcons = {
  'EXTERNAL-ESP-MAX': HiShieldCheck,
  'EXTERNAL-ESP-BASIC': HiShieldCheck,
  'STREAMER-PANEL': HiUserGroup,
  'AIMBOT-VISIBLE': HiEye,
  'UID-BYPASS': HiKey,
  'EMULATOR-BYPASS': HiDeviceMobile,
  'NORMAL-PANEL': HiTemplate,
  'COVER-AIMKILL': HiPhotograph,
  'AIMSILENT-COVER': HiPhotograph,
  'SOURCE-CODE': HiCode,
};

const categoryGradients = {
  'EXTERNAL-ESP-MAX': 'from-red-500 to-rose-600',
  'EXTERNAL-ESP-BASIC': 'from-orange-400 to-red-500',
  'STREAMER-PANEL': 'from-purple-500 to-violet-600',
  'AIMBOT-VISIBLE': 'from-blue-500 to-cyan-600',
  'UID-BYPASS': 'from-green-500 to-emerald-600',
  'EMULATOR-BYPASS': 'from-amber-500 to-yellow-600',
  'NORMAL-PANEL': 'from-teal-500 to-cyan-600',
  'COVER-AIMKILL': 'from-pink-500 to-rose-600',
  'AIMSILENT-COVER': 'from-indigo-500 to-purple-600',
  'SOURCE-CODE': 'from-gray-500 to-slate-600',
};

const categoryNames = {
  'EXTERNAL-ESP-MAX': 'External ESP Max',
  'EXTERNAL-ESP-BASIC': 'External ESP Basic',
  'STREAMER-PANEL': 'Streamer Panel',
  'AIMBOT-VISIBLE': 'Aimbot Visible',
  'UID-BYPASS': 'UID Bypass',
  'EMULATOR-BYPASS': 'Emulator Bypass',
  'NORMAL-PANEL': 'Normal Panel',
  'COVER-AIMKILL': 'Cover Aimkill',
  'AIMSILENT-COVER': 'Aimsilent Cover',
  'SOURCE-CODE': 'Source Code',
};

export default function CategoryCard({ category, type = 'free', index = 0 }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const endpoint = type === 'free' ? 'free-panels' : 'paid-panels';
        const res = await axios.get(`${API_URL}/${endpoint}`, {
          params: { category, limit: 1, page: 1 },
        });
        setCount(res.data.pagination?.total || res.data.data?.length || 0);
      } catch (err) {
        setCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [category, type]);

  const Icon = categoryIcons[category] || HiCollection;
  const gradient = categoryGradients[category] || 'from-primary-400 to-accent-500';
  const name = categoryNames[category] || category;
  const href = type === 'free' 
    ? `/free-panels?category=${category}`
    : `/paid-panels?category=${category}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link
        href={href}
        className="block group relative overflow-hidden rounded-2xl p-6 glass-card hover-lift"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        <div className="relative z-10">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize mb-1">
            {name}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {count} {type === 'free' ? 'Free' : 'Paid'} Panels
          </p>
        </div>

        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}