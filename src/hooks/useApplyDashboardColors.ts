import { useEffect } from 'react';
import type { DashboardColors } from './useDashboardSettings';

// Convert hex color to HSL values string (without hsl() wrapper)
const hexToHslValues = (hex: string): string => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  // Return HSL values as "H S% L%" format for CSS variables
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const useApplyDashboardColors = (colors: DashboardColors | undefined) => {
  useEffect(() => {
    if (!colors) return;
    
    const root = document.documentElement;
    
    // Apply primary color
    if (colors.primary) {
      root.style.setProperty('--primary', hexToHslValues(colors.primary));
      root.style.setProperty('--secondary', hexToHslValues(colors.primary));
      root.style.setProperty('--accent', hexToHslValues(colors.primary));
      root.style.setProperty('--ring', hexToHslValues(colors.primary));
      root.style.setProperty('--tikt-secondary', hexToHslValues(colors.primary));
      root.style.setProperty('--tikt-accent', hexToHslValues(colors.primary));
      root.style.setProperty('--sidebar-primary', hexToHslValues(colors.primary));
      root.style.setProperty('--sidebar-accent', hexToHslValues(colors.primary));
      root.style.setProperty('--sidebar-ring', hexToHslValues(colors.primary));
      root.style.setProperty('--chart-1', hexToHslValues(colors.primary));
      root.style.setProperty('--chart-2', hexToHslValues(colors.primary));
    }
    
    // Apply background color
    if (colors.background) {
      root.style.setProperty('--background', hexToHslValues(colors.background));
      root.style.setProperty('--card', hexToHslValues(colors.background));
      root.style.setProperty('--popover', hexToHslValues(colors.background));
      root.style.setProperty('--tikt-primary', hexToHslValues(colors.background));
      root.style.setProperty('--sidebar-background', hexToHslValues(colors.background));
      root.style.setProperty('--banner-edge', hexToHslValues(colors.background));
    }
    
    // Apply foreground color
    if (colors.foreground) {
      root.style.setProperty('--foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--card-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--popover-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--primary-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--secondary-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--accent-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--tikt-text-light', hexToHslValues(colors.foreground));
      root.style.setProperty('--sidebar-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--sidebar-primary-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--sidebar-accent-foreground', hexToHslValues(colors.foreground));
      root.style.setProperty('--destructive-foreground', hexToHslValues(colors.foreground));
    }
    
    // Apply input background color
    if (colors.inputBackground) {
      root.style.setProperty('--input', hexToHslValues(colors.inputBackground));
    }
    
    // Apply border color
    if (colors.border) {
      root.style.setProperty('--border', hexToHslValues(colors.border));
      root.style.setProperty('--sidebar-border', hexToHslValues(colors.border));
    }
    
    // Apply muted colors
    if (colors.muted) {
      root.style.setProperty('--muted', hexToHslValues(colors.muted));
      root.style.setProperty('--chart-3', hexToHslValues(colors.muted));
      root.style.setProperty('--chart-4', hexToHslValues(colors.muted));
      root.style.setProperty('--chart-5', hexToHslValues(colors.muted));
    }
    
    if (colors.mutedForeground) {
      root.style.setProperty('--muted-foreground', hexToHslValues(colors.mutedForeground));
    }
    
    // Cleanup function to reset styles when component unmounts
    return () => {
      // We don't reset here because we want colors to persist
    };
  }, [colors]);
};
