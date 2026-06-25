'use client';

import { useAuth } from '@/context/AuthContext';
import { useMaintenance } from '@/context/MaintenanceContext';
import MaintenancePage from '@/components/MaintenancePage';

export default function MaintenanceWrapper({ children }) {
  const { user, isAdmin } = useAuth();
  const { isMaintenanceMode, loading } = useMaintenance();

  if (loading) return null;

  if (isMaintenanceMode && (!user || !isAdmin)) {
    return <MaintenancePage />;
  }

  return children;
}
