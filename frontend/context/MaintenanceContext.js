'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MaintenanceContext = createContext({ isMaintenanceMode: false, loading: true });

export function useMaintenance() {
  return useContext(MaintenanceContext);
}

export function MaintenanceProvider({ children }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const checkMaintenance = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/settings`);
      if (res.data.success) {
        setIsMaintenanceMode(res.data.data.maintenanceMode === true);
      }
    } catch {
      // If settings can't be loaded, assume not in maintenance
      setIsMaintenanceMode(false);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    checkMaintenance();
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, [checkMaintenance]);

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, loading, refresh: checkMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  );
}
