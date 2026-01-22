import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface DashboardColors {
  primary: string;
  background: string;
  foreground: string;
  inputBackground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  [key: string]: string; // Index signature for Json compatibility
}

export interface DashboardSettings {
  id: string;
  user_id: string;
  tile_order: string[];
  custom_labels: Record<string, string>;
  theme: 'dark' | 'light';
  custom_tooltips: Record<string, string>;
  impact_colors: {
    high: string;
    medium: string;
    low: string;
  };
  dashboard_colors: DashboardColors;
  created_at: string;
  updated_at: string;
}

const DEFAULT_DASHBOARD_COLORS: DashboardColors = {
  primary: '#9333ea',
  background: '#121212',
  foreground: '#ffffff',
  inputBackground: '#404040',
  border: '#737373',
  muted: '#404040',
  mutedForeground: '#bfbfbf',
};

const DEFAULT_SETTINGS: Omit<DashboardSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  tile_order: ['saved-hours', 'monday-planning', 'seo-blog', 'wordpress-alt-text', 'chatbot', 'copyright-branding'],
  custom_labels: {},
  theme: 'dark',
  custom_tooltips: {},
  impact_colors: {
    high: '#ef4444',
    medium: '#eab308',
    low: '#6b7280',
  },
  dashboard_colors: DEFAULT_DASHBOARD_COLORS,
};

export const useDashboardSettings = () => {
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_dashboard_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          ...data,
          tile_order: Array.isArray(data.tile_order) ? data.tile_order : DEFAULT_SETTINGS.tile_order,
          custom_labels: data.custom_labels || DEFAULT_SETTINGS.custom_labels,
          custom_tooltips: data.custom_tooltips || DEFAULT_SETTINGS.custom_tooltips,
          impact_colors: data.impact_colors || DEFAULT_SETTINGS.impact_colors,
          dashboard_colors: data.dashboard_colors || DEFAULT_SETTINGS.dashboard_colors,
        } as DashboardSettings);
      } else {
        // Create default settings for this user
        const { data: newSettings, error: insertError } = await supabase
          .from('user_dashboard_settings')
          .insert([{
            user_id: user.id,
            tile_order: DEFAULT_SETTINGS.tile_order,
            custom_labels: DEFAULT_SETTINGS.custom_labels,
            custom_tooltips: DEFAULT_SETTINGS.custom_tooltips,
            impact_colors: DEFAULT_SETTINGS.impact_colors,
            dashboard_colors: DEFAULT_SETTINGS.dashboard_colors,
            theme: DEFAULT_SETTINGS.theme,
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        if (newSettings) {
          setSettings({
            ...newSettings,
            tile_order: Array.isArray(newSettings.tile_order) ? newSettings.tile_order : DEFAULT_SETTINGS.tile_order,
            custom_labels: (newSettings.custom_labels as Record<string, string>) || DEFAULT_SETTINGS.custom_labels,
            custom_tooltips: (newSettings.custom_tooltips as Record<string, string>) || DEFAULT_SETTINGS.custom_tooltips,
            impact_colors: (newSettings.impact_colors as DashboardSettings['impact_colors']) || DEFAULT_SETTINGS.impact_colors,
            dashboard_colors: (newSettings.dashboard_colors as DashboardColors) || DEFAULT_SETTINGS.dashboard_colors,
          } as DashboardSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Record<string, unknown>) => {
    if (!settings?.id) return;

    try {
      const { error } = await supabase
        .from('user_dashboard_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } as DashboardSettings : null);
      toast({
        title: 'Opgeslagen',
        description: 'Dashboard instellingen bijgewerkt',
      });
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      toast({
        title: 'Fout',
        description: 'Kon instellingen niet opslaan',
        variant: 'destructive',
      });
    }
  };

  const updateTileOrder = async (newOrder: string[]) => {
    await updateSettings({ tile_order: newOrder } as unknown as Partial<DashboardSettings>);
  };

  const updateCustomLabel = async (automationName: string, label: string) => {
    const newLabels = { ...settings?.custom_labels, [automationName]: label };
    await updateSettings({ custom_labels: newLabels } as unknown as Partial<DashboardSettings>);
  };

  const updateCustomTooltip = async (automationName: string, tooltip: string) => {
    const newTooltips = { ...settings?.custom_tooltips, [automationName]: tooltip };
    await updateSettings({ custom_tooltips: newTooltips } as unknown as Partial<DashboardSettings>);
  };

  const updateImpactColors = async (colors: { high?: string; medium?: string; low?: string }) => {
    const newColors = { ...settings?.impact_colors, ...colors };
    await updateSettings({ impact_colors: newColors } as unknown as Partial<DashboardSettings>);
  };

  const updateTheme = async (theme: 'dark' | 'light') => {
    await updateSettings({ theme });
  };

  const updateDashboardColors = async (colors: Partial<DashboardColors>) => {
    const newColors = { ...settings?.dashboard_colors, ...colors };
    await updateSettings({ dashboard_colors: newColors } as unknown as Partial<DashboardSettings>);
  };

  const resetDashboardColors = async () => {
    await updateSettings({ dashboard_colors: DEFAULT_DASHBOARD_COLORS } as unknown as Partial<DashboardSettings>);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings: settings || { ...DEFAULT_SETTINGS } as DashboardSettings,
    isLoading,
    updateTileOrder,
    updateCustomLabel,
    updateCustomTooltip,
    updateImpactColors,
    updateTheme,
    updateDashboardColors,
    resetDashboardColors,
    refetch: fetchSettings,
  };
};
