'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SiteSettingsContext = createContext({});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const defaults = {
  siteName: 'VISION X CHEATS',
  siteDescription: 'Your trusted source for premium digital panels',
  discordLink: '',
  youtubeLink: '',
  instagramLink: '',
  whatsappLink: '',
  telegramLink: '',
};

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSettings(prev => ({ ...prev, ...d.data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
