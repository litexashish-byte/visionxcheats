'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiSearch, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar({ placeholder = 'Search panels...', type = 'free' }) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const path = type === 'free' ? '/free-panels' : '/paid-panels';
      router.push(`${path}?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
          <HiSearch className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 rounded-2xl glass-card
                     text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400
                     transition-all duration-300 text-base"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                         text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <HiX className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Focus Ring Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/0 via-primary-400/0 to-accent-500/0 
                       group-focus-within:from-primary-400/10 group-focus-within:via-primary-400/5 group-focus-within:to-accent-500/10 
                       -z-10 blur-xl transition-all duration-500" />
      </div>

      {/* Search Suggestions (optional) */}
      <AnimatePresence>
        {query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl glass-card shadow-xl z-50"
          >
            <button
              type="submit"
              className="w-full p-3 rounded-lg text-left text-sm text-gray-600 dark:text-gray-300
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-all"
            >
              <HiSearch className="w-4 h-4 inline mr-2" />
              Search for &quot;{query}&quot;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}