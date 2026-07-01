'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HiCurrencyDollar, HiCollection, HiChip, HiShieldCheck } from 'react-icons/hi';
import ResellingTabs from '@/components/ResellingTabs';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ResellingPage() {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [uidBypass, setUidBypass] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, c, u] = await Promise.all([
          axios.get(`${API_URL}/resell/products`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/resell/combos`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/resell/uid-bypass`).catch(() => ({ data: { data: [] } })),
        ]);
        setProducts(p.data.data || []);
        setCombos(c.data.data || []);
        setUidBypass(u.data.data || []);
      } catch (error) {
        console.log('Failed to load resell data');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4 border border-amber-200 dark:border-amber-800/30">
            <HiCurrencyDollar className="w-4 h-4" />
            <span>Reselling Store</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            Resell & <span className="gradient-text">Earn Money</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto">
            Buy at wholesale, resell at your own price. Full admin control over pricing, products, and inventory.
          </p>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {[
            { icon: HiCurrencyDollar, title: 'Set Your Price', desc: 'Choose your resell price above the minimum', color: 'from-green-400 to-emerald-500' },
            { icon: HiCollection, title: 'Bundle & Save', desc: 'Create combo packs for higher margins', color: 'from-amber-400 to-orange-500' },
            { icon: HiShieldCheck, title: 'UID Bypass', desc: 'Resell UID bypass with GTC API integration', color: 'from-purple-400 to-violet-500' },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ResellingTabs products={products} combos={combos} uidBypass={uidBypass} />
        )}
      </div>
    </div>
  );
}
