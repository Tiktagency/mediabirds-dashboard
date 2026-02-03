import { useEffect } from 'react';
import { useDashboardSettings } from './useDashboardSettings';

export const useApplyButtonColors = () => {
  const { settings, isLoading } = useDashboardSettings();

  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;
    const colors = settings?.button_colors;

    // Altijd fallback kleuren toepassen voor consistente branding
    const DEFAULT_BG = '#cfddd0';
    const DEFAULT_TEXT = '#002C1F';

    root.style.setProperty('--button-primary-bg', colors?.background || DEFAULT_BG);
    root.style.setProperty('--button-primary-text', colors?.text || DEFAULT_TEXT);
  }, [settings?.button_colors, isLoading]);
};
