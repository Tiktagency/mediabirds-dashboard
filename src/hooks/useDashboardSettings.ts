import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TileColors {
  background: string;
  text: string;
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
  tile_colors: TileColors;
  saved_hours_colors: TileColors;
  button_colors: TileColors;
  created_at: string;
  updated_at: string;
}

const DEFAULT_TILE_COLORS: TileColors = {
  background: '#cfddd0',
  text: '#002C1F',
};

const DEFAULT_SAVED_HOURS_COLORS: TileColors = {
  background: '#f2eadc',
  text: '#412700',
};

const DEFAULT_BUTTON_COLORS: TileColors = {
  background: '#cfddd0',
  text: '#002C1F',
};

const DEFAULT_SETTINGS: Omit<DashboardSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  tile_order: ['saved-hours', 'monday-planning', 'seo-blog', 'wordpress-alt-text', 'chatbot', 'copyright-branding', 'email-handtekening'],
  custom_labels: {},
  theme: 'dark',
  custom_tooltips: {},
  impact_colors: {
    high: '#ef4444',
    medium: '#eab308',
    low: '#6b7280',
  },
  tile_colors: DEFAULT_TILE_COLORS,
  saved_hours_colors: DEFAULT_SAVED_HOURS_COLORS,
  button_colors: DEFAULT_BUTTON_COLORS,
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
        const dashboardColors = data.dashboard_colors as Record<string, unknown> | null;
        setSettings({
          ...data,
          tile_order: Array.isArray(data.tile_order) ? data.tile_order : DEFAULT_SETTINGS.tile_order,
          custom_labels: data.custom_labels || DEFAULT_SETTINGS.custom_labels,
          custom_tooltips: data.custom_tooltips || DEFAULT_SETTINGS.custom_tooltips,
          impact_colors: data.impact_colors || DEFAULT_SETTINGS.impact_colors,
          tile_colors: (dashboardColors?.tile_colors as TileColors) || DEFAULT_TILE_COLORS,
          saved_hours_colors: (dashboardColors?.saved_hours_colors as TileColors) || DEFAULT_SAVED_HOURS_COLORS,
          button_colors: (dashboardColors?.button_colors as TileColors) || DEFAULT_BUTTON_COLORS,
        } as DashboardSettings);
      } else {
        // Create default settings for this user
        const { data: newSettings, error: insertError } = await supabase
          .from('user_dashboard_settings')
          .insert({
            user_id: user.id,
            ...DEFAULT_SETTINGS,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings as unknown as DashboardSettings);
      }
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<DashboardSettings>) => {
    if (!settings?.id) return;

    try {
      const { error } = await supabase
        .from('user_dashboard_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
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

  const updateTileColors = async (colors: { background?: string; text?: string }) => {
    const newColors = { ...settings?.tile_colors, ...colors };
    // Store in dashboard_colors.tile_colors for persistence
    const currentDashboardColors = (settings as any)?.dashboard_colors || {};
    await supabase
      .from('user_dashboard_settings')
      .update({ dashboard_colors: { ...currentDashboardColors, tile_colors: newColors } })
      .eq('id', settings?.id);
    setSettings(prev => prev ? { ...prev, tile_colors: newColors } : null);
    toast({
      title: 'Opgeslagen',
      description: 'Tile kleuren bijgewerkt',
    });
  };

  const updateSavedHoursColors = async (colors: { background?: string; text?: string }) => {
    const newColors = { ...settings?.saved_hours_colors, ...colors };
    // Store in dashboard_colors.saved_hours_colors for persistence
    const currentDashboardColors = (settings as any)?.dashboard_colors || {};
    await supabase
      .from('user_dashboard_settings')
      .update({ dashboard_colors: { ...currentDashboardColors, saved_hours_colors: newColors } })
      .eq('id', settings?.id);
    setSettings(prev => prev ? { ...prev, saved_hours_colors: newColors } : null);
    toast({
      title: 'Opgeslagen',
      description: 'Saved hours kleuren bijgewerkt',
    });
  };

  const updateButtonColors = async (colors: { background?: string; text?: string }) => {
    const newColors = { ...settings?.button_colors, ...colors };
    const currentDashboardColors = (settings as any)?.dashboard_colors || {};
    await supabase
      .from('user_dashboard_settings')
      .update({ dashboard_colors: { ...currentDashboardColors, button_colors: newColors } })
      .eq('id', settings?.id);
    setSettings(prev => prev ? { ...prev, button_colors: newColors } : null);
    toast({
      title: 'Opgeslagen',
      description: 'Knopkleuren bijgewerkt',
    });
  };

  const updateTheme = async (theme: 'dark' | 'light') => {
    await updateSettings({ theme });
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
    updateTileColors,
    updateSavedHoursColors,
    updateButtonColors,
    updateTheme,
    refetch: fetchSettings,
  };
};
