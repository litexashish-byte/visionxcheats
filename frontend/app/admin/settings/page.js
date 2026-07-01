'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  HiCog, HiSave, HiKey, HiLink, HiShieldCheck, HiInformationCircle,
  HiCheck, HiX, HiRefresh, HiGlobe,
  HiEye, HiEyeOff, HiColorSwatch,
  HiGlobeAlt,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuth() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

const defaultSettings = {
  shortenerApiKey: '',
  shortenerApiUrl: 'https://indianshortner.com/api',
  siteName: 'VISION X CHEATS',
  siteDescription: 'Your trusted source for premium digital panels',
  maintenanceMode: false,
  allowRegistration: true,
  discordLink: '',
  youtubeLink: '',
  instagramLink: '',
  whatsappLink: '',
  telegramLink: '',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/settings`, getAuth());
      if (res.data.success) {
        setSettings(res.data.data);
        setOriginalSettings(res.data.data);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to load settings';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await axios.put(`${API_URL}/admin/settings`, settings, getAuth());
      if (res.data.success) {
        setSettings(res.data.data);
        setOriginalSettings(res.data.data);
        setSaveSuccess(true);
        toast.success('Settings saved successfully');
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save settings';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const ToggleSwitch = ({ name, checked, onChange, label, description }) => (
    <label className="flex items-center justify-between p-4 lg:p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer group">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 shadow-inner" />
        <span className={`absolute top-1/2 -translate-y-1/2 text-[9px] font-bold transition-all ${
          checked ? 'left-1.5 text-white' : 'right-1.5 text-gray-400'
        }`}>
          {checked ? 'ON' : 'OFF'}
        </span>
      </div>
    </label>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="skeleton h-9 w-48 rounded-lg mb-2" />
            <div className="skeleton h-5 w-64 rounded-lg" />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div>
                <div className="skeleton h-5 w-36 rounded-lg mb-1" />
                <div className="skeleton h-4 w-56 rounded-lg" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="skeleton h-12 rounded-xl" />
              <div className="skeleton h-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure and manage your store settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSettings}
            disabled={isSaving}
            className="btn-secondary text-sm py-2.5 px-4 flex items-center"
          >
            <HiRefresh className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`btn-primary text-sm py-2.5 px-5 flex items-center transition-all ${
              !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white mr-2" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <HiCheck className="w-4 h-4 mr-1.5" />
                Saved!
              </>
            ) : (
              <>
                <HiSave className="w-4 h-4 mr-1.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      <>
        {hasChanges && (
          <div
            className="flex items-center space-x-2 px-4 py-3 mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-700 dark:text-amber-300"
          >
            <HiInformationCircle className="w-4 h-4 flex-shrink-0" />
            <span>You have unsaved changes. Click "Save Changes" to apply them.</span>
          </div>
        )}
      </>

      <div className="space-y-6">
        {/* API Configuration */}
        <div
          className="glass-card rounded-2xl p-5 lg:p-6 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-purple-600/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <HiKey className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">API Configuration</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure third-party APIs for store functionality</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <HiKey className="w-4 h-4 mr-1.5 text-purple-500" />
                  Shortener API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    name="shortenerApiKey"
                    value={settings.shortenerApiKey}
                    onChange={handleChange}
                    placeholder="Enter your Indian Shortner API key"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showApiKey ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Required for the URL shortener download flow. Get your key from the India Shortener dashboard.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <HiLink className="w-4 h-4 mr-1.5 text-purple-500" />
                  Shortener API URL
                </label>
                <input
                  type="url"
                  name="shortenerApiUrl"
                  value={settings.shortenerApiUrl}
                  onChange={handleChange}
                  placeholder="https://indianshortner.com/api"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Site Settings */}
        <div
          className="glass-card rounded-2xl p-5 lg:p-6 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-blue-600/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <HiGlobe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Site Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">General site information and branding</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  placeholder="VISION X CHEATS"
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Site Description
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  placeholder="Describe your store..."
                  className="input-field h-20 resize-none"
                />
              </div>
            </div>

            {/* Live Preview */}
            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50">
              <p className="text-xs font-medium text-gray-400 mb-2 flex items-center">
                <HiColorSwatch className="w-3 h-3 mr-1" />
                Preview
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{settings.siteName || 'VISION X CHEATS'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{settings.siteDescription || 'Your trusted source...'}</p>
            </div>
          </div>
        </div>

        {/* System Controls */}
        <div
          className="glass-card rounded-2xl p-5 lg:p-6 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-amber-600/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <HiShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">System Controls</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Control site-wide behavior and access</p>
              </div>
            </div>

            <div className="space-y-3">
              <ToggleSwitch
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                label={settings.maintenanceMode ? 'Under Maintenance' : 'Maintenance Mode'}
                description={
                  settings.maintenanceMode
                    ? 'Site is currently in maintenance mode. Only admins can access.'
                    : 'Enable to put the site in maintenance mode. Only admins will have access.'
                }
              />
              <ToggleSwitch
                name="allowRegistration"
                checked={settings.allowRegistration}
                onChange={handleChange}
                label={settings.allowRegistration ? 'Registration Open' : 'Registration Closed'}
                description={
                  settings.allowRegistration
                    ? 'New users can create accounts freely.'
                    : 'New user registration is disabled. Only existing users can log in.'
                }
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div
          className="glass-card rounded-2xl p-5 lg:p-6 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-indigo-600/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <HiGlobeAlt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Social Links</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your social media links shown on the site</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
                  Discord Link
                </label>
                <input
                  type="url"
                  name="discordLink"
                  value={settings.discordLink || ''}
                  onChange={handleChange}
                  placeholder="https://discord.gg/yourserver"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube Link
                </label>
                <input
                  type="url"
                  name="youtubeLink"
                  value={settings.youtubeLink || ''}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@yourchannel"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram Link
                </label>
                <input
                  type="url"
                  name="instagramLink"
                  value={settings.instagramLink || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourprofile"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Link
                </label>
                <input
                  type="url"
                  name="whatsappLink"
                  value={settings.whatsappLink || ''}
                  onChange={handleChange}
                  placeholder="https://wa.me/919999999999"
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram Link
                </label>
                <input
                  type="url"
                  name="telegramLink"
                  value={settings.telegramLink || ''}
                  onChange={handleChange}
                  placeholder="https://t.me/yourchannel"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div
          className="p-4 lg:p-5 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-100 dark:border-primary-900/30"
        >
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <HiInformationCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Need Help?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Configure your <strong>Indian Shortner API key</strong> to enable the download shortener flow. 
                Your site name and description are used for SEO and branding across the store.
                System controls allow you to temporarily lock down the site or disable new registrations.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <>
          {hasChanges && (
            <div
              className="sticky bottom-6 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <HiCog className="w-4 h-4" />
                  <span>You have unsaved changes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSettings(originalSettings)}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    <HiX className="w-4 h-4 mr-1.5" />
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary text-sm py-2 px-5"
                  >
                    {isSaving ? (
                      <><div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white mr-1.5" /> Saving</>
                    ) : (
                      <><HiSave className="w-4 h-4 mr-1.5" /> Save</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
}
