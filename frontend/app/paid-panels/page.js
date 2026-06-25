'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HiStar, HiShoppingBag } from 'react-icons/hi';
import PanelCard from '@/components/PanelCard';

const formatCategoryName = (cat) => {
  if (cat === 'all') return 'All';
  return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const categories = ['all', 'EXTERNAL-ESP-MAX', 'EXTERNAL-ESP-BASIC', 'STREAMER-PANEL', 'AIMBOT-VISIBLE', 'UID-BYPASS', 'EMULATOR-BYPASS', 'NORMAL-PANEL', 'COVER-AIMKILL', 'AIMSILENT-COVER', 'SOURCE-CODE'];
const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-yellow-400/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.8s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-amber-400/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.2s' }} />
    </div>
  );
}

function PaidPanelsContent() {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const headerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchPanels();
  }, [selectedCategory, sortBy, page]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchPanels = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (selectedCategory !== 'all') params.category = selectedCategory;

      let sortParam = '-createdAt';
      if (sortBy === 'popular') sortParam = '-salesCount';
      else if (sortBy === 'price-low') sortParam = 'price';
      else if (sortBy === 'price-high') sortParam = '-price';
      params.sort = sortParam;

      const res = await axios.get(`${API_URL}/paid-panels`, { params });
      setPanels(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (error) {
      console.log('API not available');
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPanels = async () => {
    try {
      const res = await axios.get(`${API_URL}/paid-panels`, { params: { limit: 1000 } });
      const allPanels = res.data.data || [];
      const cats = [...new Set(allPanels.map(p => p.category).filter(Boolean))];
      setAvailableCategories(['all', ...cats]);
    } catch (error) {
      setAvailableCategories(categories);
    }
  };

  useEffect(() => { fetchAllPanels(); }, []);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Premium Header */}
      <div ref={headerRef} className="relative py-24 md:py-32 mb-8 overflow-hidden min-h-[350px]" style={{ perspective: '1000px' }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:opacity-20" style={{ backgroundImage: 'url(/bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10" />
        <FloatingOrbs />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
            style={{
              transform: `rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.1s ease-out',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-sm font-medium mb-4"
            >
              <HiStar className="w-4 h-4" />
              <span>Premium Collection</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4" style={{ transform: 'translateZ(40px)' }}>
              Premium <span className="gradient-text-amber">Panels</span>
            </h1>
            <p className="text-lg font-medium text-gray-900 dark:text-white max-w-2xl mx-auto" style={{ transform: 'translateZ(20px)' }}>
              Unlock the full potential with our premium panel collection. 
              Get access to exclusive features and priority support.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
          style={{ perspective: '800px' }}
        >
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat, i) => (
              <motion.button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
                initial={{ opacity: 0, rotateY: -30 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05, z: 10 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {formatCategoryName(cat)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading...' : `${panels.length} premium panels`}
          </span>
        </motion.div>

        {/* Panels Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="skeleton h-40 mb-4 rounded-xl" />
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-3 w-1/2 mb-4" />
                <div className="skeleton h-10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : panels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <HiShoppingBag className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No premium panels yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back soon for new premium panels</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          >
            {panels.map((panel, i) => (
              <PanelCard key={panel._id} panel={panel} type="paid" index={i} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mt-12"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                  page === i + 1
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.15, z: 20 }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {i + 1}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PaidPanelsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-10 h-10" />
      </div>
    }>
      <PaidPanelsContent />
    </Suspense>
  );
}
