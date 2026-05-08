import { useEffect } from 'react';
import { useDashboardSettings } from './useDashboardSettings';

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

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

  useEffect(() => {
    if (isLoading) return;

    const bgColor = settings?.background_color;
    if (bgColor && /^#[0-9a-fA-F]{6}$/.test(bgColor)) {
      document.documentElement.style.setProperty('--background', hexToHsl(bgColor));
    }
  }, [settings?.background_color, isLoading]);
};
