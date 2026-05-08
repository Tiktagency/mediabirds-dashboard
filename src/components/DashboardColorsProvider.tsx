import { ReactNode } from 'react';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { useApplyDashboardColors } from '@/hooks/useApplyDashboardColors';

interface DashboardColorsProviderProps {
  children: ReactNode;
}

export const DashboardColorsProvider = ({ children }: DashboardColorsProviderProps) => {
  const { settings } = useDashboardSettings();
  
  // Apply dashboard colors dynamically
  useApplyDashboardColors(settings?.dashboard_colors);
  
  return <>{children}</>;
};
