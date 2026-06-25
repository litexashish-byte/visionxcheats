'use client';

import { motion } from 'framer-motion';
import { HiCog, HiExclamation, HiMail, HiShieldCheck } from 'react-icons/hi';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25 mb-8"
        >
          <HiCog className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Under Maintenance
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          We&apos;re currently performing scheduled maintenance to improve your experience. We&apos;ll be back soon!
        </p>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HiExclamation className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-gray-900 dark:text-white">What&apos;s happening?</span>
          </div>
          <ul className="space-y-2 text-left text-gray-600 dark:text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <HiCog className="w-4 h-4 text-purple-500 shrink-0" />
              System upgrades and performance improvements
            </li>
            <li className="flex items-center gap-2">
              <HiShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
              Security patches and updates
            </li>
            <li className="flex items-center gap-2">
              <HiCog className="w-4 h-4 text-purple-500 shrink-0" />
              New features in development
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://discord.gg/visionxsec"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
          >
            <HiMail className="w-5 h-5" />
            Contact Support
          </a>
        </div>

        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          VISION X CHEATS — We&apos;ll be back online shortly.
        </p>
      </motion.div>
    </div>
  );
}
