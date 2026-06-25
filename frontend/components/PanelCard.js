'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  HiDownload, HiClock, 
  HiShoppingCart, HiStar
} from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import DownloadModal from './DownloadModal';
import GetKeyModal from './GetKeyModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const categoryColors = {
  'EXTERNAL-ESP-MAX': { bg: 'from-red-500 to-rose-600', text: 'text-red-600', light: 'bg-red-100 dark:bg-red-900/30' },
  'EXTERNAL-ESP-BASIC': { bg: 'from-orange-400 to-red-500', text: 'text-orange-600', light: 'bg-orange-100 dark:bg-orange-900/30' },
  'STREAMER-PANEL': { bg: 'from-purple-500 to-violet-600', text: 'text-purple-600', light: 'bg-purple-100 dark:bg-purple-900/30' },
  'AIMBOT-VISIBLE': { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-600', light: 'bg-blue-100 dark:bg-blue-900/30' },
  'UID-BYPASS': { bg: 'from-green-500 to-emerald-600', text: 'text-green-600', light: 'bg-green-100 dark:bg-green-900/30' },
  'EMULATOR-BYPASS': { bg: 'from-amber-500 to-yellow-600', text: 'text-amber-600', light: 'bg-amber-100 dark:bg-amber-900/30' },
  'NORMAL-PANEL': { bg: 'from-teal-500 to-cyan-600', text: 'text-teal-600', light: 'bg-teal-100 dark:bg-teal-900/30' },
  'COVER-AIMKILL': { bg: 'from-pink-500 to-rose-600', text: 'text-pink-600', light: 'bg-pink-100 dark:bg-pink-900/30' },
  'AIMSILENT-COVER': { bg: 'from-indigo-500 to-purple-600', text: 'text-indigo-600', light: 'bg-indigo-100 dark:bg-indigo-900/30' },
  'SOURCE-CODE': { bg: 'from-gray-500 to-slate-600', text: 'text-gray-600', light: 'bg-gray-100 dark:bg-gray-700' },
};

function formatTimeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function PanelCard({ panel, type = 'free', index = 0 }) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showGetKeyModal, setShowGetKeyModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [avgRating, setAvgRating] = useState(panel.rating || 0);
  const [totalRatings, setTotalRatings] = useState(panel.totalRatings || 0);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const isFree = type === 'free';
  const catColor = categoryColors[panel.category] || { bg: 'from-gray-500 to-slate-600', text: 'text-gray-600', light: 'bg-gray-100 dark:bg-gray-700' };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const endpoint = isFree ? `${API_URL}/free-panels/${panel._id}/my-rating` : `${API_URL}/paid-panels/${panel._id}/my-rating`;
      axios.get(endpoint)
        .then(res => {
          if (res.data.success && res.data.data.userRating > 0) {
            setUserRating(res.data.data.userRating);
            setHasRated(true);
          }
        })
        .catch(() => {});
    }
  }, [panel._id, isFree]);

  const handleRate = async (rating) => {
    if (hasRated) {
      toast.error('You have already rated this panel');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Please login to rate');
      const endpoint = isFree ? `${API_URL}/free-panels/${panel._id}/rate` : `${API_URL}/paid-panels/${panel._id}/rate`;
      const res = await axios.post(endpoint, { rating });
      if (res.data.success) {
        setAvgRating(res.data.data.rating);
        setTotalRatings(res.data.data.totalRatings);
        setUserRating(res.data.data.userRating);
        setHasRated(true);
        toast.success('Thanks for rating!');
      }
    } catch (error) {
      if (error.response?.data?.message === 'You have already rated this panel') {
        toast.error('You have already rated this panel');
        setUserRating(error.response.data.userRating);
        setHasRated(true);
      } else {
        toast.error('Please login to rate');
      }
    }
  };

  const displayRating = hoveredStar || userRating;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
        className="group"
      >
        <div className="product-card">
          {/* Image Section */}
          <div className="product-image">
            {panel.image && !imgError ? (
              <Image
                src={panel.image}
                alt={panel.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImgError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center transition-transform duration-500 group-hover:scale-105">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${catColor.bg} 
                                flex items-center justify-center shadow-xl shadow-black/10 mb-2`}>
                    <span className="text-white text-3xl font-bold">
                      {panel.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Preview</p>
                </div>
              </div>
            )            }
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-5">
            {/* Title & Version */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 
                           group-hover:text-primary-500 dark:group-hover:text-primary-400 
                           transition-colors duration-300 flex-1 mr-2">
                {panel.name}
              </h3>
              {isFree && panel.version && (
                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-md 
                               bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 
                               text-xs font-mono">
                  v{panel.version}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 min-h-[2.5rem]">
              {panel.description}
            </p>

            {/* Meta Row - Rating & Updated time */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => !hasRated && setHoveredStar(star)}
                    onMouseLeave={() => !hasRated && setHoveredStar(0)}
                    onClick={() => handleRate(star)}
                    disabled={hasRated}
                    className={`transition-transform ${hasRated ? 'cursor-default' : 'hover:scale-125'}`}
                  >
                    <HiStar className={`w-4 h-4 ${displayRating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  </button>
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  {avgRating > 0 ? avgRating.toFixed(1) : '0.0'} ({totalRatings})
                </span>
                {hasRated && (
                  <span className="text-[10px] text-green-500 ml-1 font-medium">✓ Rated</span>
                )}
              </div>
              <span className="flex items-center space-x-1 text-xs text-gray-400">
                <HiClock className="w-3.5 h-3.5" />
                <span>{formatTimeAgo(panel.updatedAt)}</span>
              </span>
            </div>

            {/* Tags */}
            {panel.tags && panel.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {panel.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 
                                         text-gray-500 dark:text-gray-400 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
              {isFree ? (
                <>
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 
                             text-white font-semibold py-2.5 px-4 
                             shadow-lg shadow-primary-500/25 hover:shadow-xl
                             transition-all duration-300 hover:-translate-y-0.5 text-sm"
                  >
                    <HiDownload className="w-4 h-4 inline mr-1.5" />
                    Free Download
                  </button>
                  {panel.sellerApiLink && (
                    <button onClick={() => setShowGetKeyModal(true)}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2.5 px-4 shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-sm">
                      <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                      Get Key
                    </button>
                  )}
                  {panel.videoLink && (
                    <a
                      href={panel.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 rounded-xl 
                               bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 
                               font-medium py-2.5 px-4 hover:bg-gray-200 dark:hover:bg-gray-600 
                               transition-all duration-200 hover:-translate-y-0.5 text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>Product Watch Video</span>
                    </a>
                  )}
                </>
              ) : (
                <>
                  <a
                    href="https://discord.gg/tnFQFV7wqG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 
                             text-white font-semibold py-2.5 px-4 
                             shadow-lg shadow-amber-500/25 hover:shadow-xl
                             transition-all duration-300 hover:-translate-y-0.5 text-sm flex items-center justify-center space-x-1.5"
                  >
                    <HiShoppingCart className="w-4 h-4" />
                    <span>Buy Now</span>
                    {panel.price > 0 && <span> - ${panel.price}</span>}
                    {panel.originalPrice && panel.originalPrice > panel.price && (
                      <>
                        <span className="text-xs line-through opacity-60">${panel.originalPrice}</span>
                        <span className="text-xs bg-green-400 text-green-900 px-1.5 py-0.5 rounded font-bold">
                          {Math.round((1 - panel.price / panel.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Download Modal */}
      {showDownloadModal && (
        <DownloadModal
          panel={panel}
          onClose={() => setShowDownloadModal(false)}
        />
      )}

      {showGetKeyModal && (
        <GetKeyModal
          panel={panel}
          onClose={() => setShowGetKeyModal(false)}
        />
      )}
    </>
  );
}
