import { useEffect } from 'react';
import { useDashboardSettings } from './useDashboardSettings';

export const useApplyButtonColors = () => {
  const { settings, isLoading } = useDashboardSettings();

  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;
    const colors = settings?.button_colors;

    if (colors?.background) {
      root.style.setProperty('--button-primary-bg', colors.background);
    }
    if (colors?.text) {
      root.style.setProperty('--button-primary-text', colors.text);
    }
  }, [settings?.button_colors, isLoading]);
};
