'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  HiCurrencyDollar,
  HiCollection,
  HiChip,
  HiCheckCircle,
  HiArrowRight,
  HiTag,
  HiStar,
  HiSparkles,
  HiShieldCheck,
} from 'react-icons/hi';

const tabs = [
  { id: 'products', label: 'Individual Panels', icon: HiTag },
  { id: 'combos', label: 'Combo Packs', icon: HiCollection },
  { id: 'uid-bypass', label: 'UID Bypass', icon: HiChip },
];

function ResellProductCard({ product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header gradient */}
      <div className="h-2 bg-gradient-to-r from-primary-400 to-accent-500" />
      
      <div className="p-6">
        {/* Badge */}
        {product.category === 'paid' && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-3">
            PREMIUM
          </span>
        )}

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="space-y-2 mb-5">
            {product.features.slice(0, 4).map((feature, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-end justify-between mb-4">
          <div>
            {product.originalPrice > 0 && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
            )}
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              ${product.resellPrice}
              <span className="text-sm font-normal text-gray-400 ml-1">/license</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            Min: ${product.minResellPrice}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4">
          <span>{product.totalSales || 0} sales</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{product.licenseDuration || 30} days license</span>
        </div>

        {/* CTA */}
        <a
          href="https://discord.gg/visionxstore"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
        >
          Resell Now
          <HiArrowRight className="w-4 h-4 ml-1.5" />
        </a>
      </div>
    </motion.div>
  );
}

function ComboCard({ combo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
    >
      {/* Badge */}
      {combo.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg">
            <HiSparkles className="w-3 h-3 mr-1" />
            {combo.badge}
          </span>
        </div>
      )}

      {/* Header gradient */}
      <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {combo.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {combo.description}
        </p>

        {/* Products included */}
        <div className="space-y-2 mb-4">
          {combo.products && combo.products.map((p, i) => (
            <div key={i} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{p.productName}</span>
            </div>
          ))}
        </div>

        {/* Discount */}
        {combo.discount > 0 && (
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold mb-4">
            SAVE {combo.discount}%
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-end justify-between mb-4">
          <div>
            {combo.originalPrice > 0 && (
              <span className="text-sm text-gray-400 line-through">${combo.originalPrice}</span>
            )}
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              ${combo.comboPrice}
            </div>
          </div>
          <span className="text-xs text-gray-400">
            Min: ${combo.minResellPrice}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4">
          <span>{combo.totalSales || 0} sales</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{combo.products?.length || 0} products</span>
        </div>

        {/* CTA */}
        <Link
          href="/reselling"
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
        >
          Resell Combo
          <HiArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function UIDBypassCard({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header gradient */}
      <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <HiShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">UID Bypass</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {item.description}
        </p>

        {/* Duration Options */}
        {item.durationOptions && item.durationOptions.length > 0 && (
          <div className="space-y-2 mb-4">
            {item.durationOptions.map((opt, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">${opt.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        {item.features && item.features.length > 0 && (
          <div className="space-y-2 mb-5">
            {item.features.map((feature, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4">
          <span>{item.totalSales || 0} sales</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>{item.maxUids === -1 ? 'Unlimited' : item.maxUids} UIDs</span>
        </div>

        {/* CTA */}
        <Link
          href="/reselling"
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
        >
          Resell UID Bypass
          <HiArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ResellingTabs({ products = [], combos = [], uidBypass = [] }) {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ResellProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={HiTag}
                title="No Resell Products Yet"
                description="Admin can add resell products from the admin panel."
              />
            )}
          </motion.div>
        )}

        {activeTab === 'combos' && (
          <motion.div
            key="combos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {combos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {combos.map((combo) => (
                  <ComboCard key={combo._id} combo={combo} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={HiCollection}
                title="No Combo Packs Yet"
                description="Admin can create combo packs from the admin panel."
              />
            )}
          </motion.div>
        )}

        {activeTab === 'uid-bypass' && (
          <motion.div
            key="uid-bypass"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {uidBypass.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uidBypass.map((item) => (
                  <UIDBypassCard key={item._id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={HiChip}
                title="No UID Bypass Products Yet"
                description="Admin can add UID bypass products from the admin panel."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
