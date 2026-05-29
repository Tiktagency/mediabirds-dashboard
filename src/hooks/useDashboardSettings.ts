import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database, Json } from '@/integrations/supabase/types';

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
  background_color: string;
  created_at: string;
  updated_at: string;
}

type DashboardSettingsRow = Database['public']['Tables']['user_dashboard_settings']['Row'];
type DashboardSettingsInsert = Database['public']['Tables']['user_dashboard_settings']['Insert'];
type DashboardSettingsUpdate = Database['public']['Tables']['user_dashboard_settings']['Update'];
type DashboardColorsPayload = {
  tile_colors: TileColors;
  saved_hours_colors: TileColors;
  button_colors: TileColors;
  background_color: string;
};

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

const DEFAULT_BACKGROUND_COLOR = '#0d0d0d';

const DEFAULT_SETTINGS: Omit<DashboardSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  tile_order: ['saved-hours', 'monday-planning', 'seo-blog', 'wordpress-alt-text', 'chatbot', 'copyright-branding', 'email-handtekening', 'landingspagina'],
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
  background_color: DEFAULT_BACKGROUND_COLOR,
};

const isJsonObject = (value: Json | null | undefined): value is { [key: string]: Json | undefined } => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const getTileColors = (value: Json | undefined, fallback: TileColors): TileColors => {
  if (!isJsonObject(value)) return fallback;

  return {
    background: typeof value.background === 'string' ? value.background : fallback.background,
    text: typeof value.text === 'string' ? value.text : fallback.text,
  };
};

const getStringRecord = (value: Json | null | undefined): Record<string, string> => {
  if (!isJsonObject(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => typeof entryValue === 'string') as Array<[string, string]>
  );
};

const getImpactColors = (value: Json | null | undefined) => {
  if (!isJsonObject(value)) return DEFAULT_SETTINGS.impact_colors;

  return {
    high: typeof value.high === 'string' ? value.high : DEFAULT_SETTINGS.impact_colors.high,
    medium: typeof value.medium === 'string' ? value.medium : DEFAULT_SETTINGS.impact_colors.medium,
    low: typeof value.low === 'string' ? value.low : DEFAULT_SETTINGS.impact_colors.low,
  };
};

const getTileOrder = (value: Json | null | undefined): string[] => {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.tile_order;
  return value.filter((entry): entry is string => typeof entry === 'string');
};

const getDashboardColors = (value: Json | null | undefined): DashboardColorsPayload => {
  if (!isJsonObject(value)) {
    return {
      tile_colors: DEFAULT_TILE_COLORS,
      saved_hours_colors: DEFAULT_SAVED_HOURS_COLORS,
      button_colors: DEFAULT_BUTTON_COLORS,
      background_color: DEFAULT_BACKGROUND_COLOR,
    };
  }

  return {
    tile_colors: getTileColors(value.tile_colors, DEFAULT_TILE_COLORS),
    saved_hours_colors: getTileColors(value.saved_hours_colors, DEFAULT_SAVED_HOURS_COLORS),
    button_colors: getTileColors(value.button_colors, DEFAULT_BUTTON_COLORS),
    background_color: typeof value.background_color === 'string' ? value.background_color : DEFAULT_BACKGROUND_COLOR,
  };
};

const buildDashboardColorsPayload = (settings?: Partial<DashboardSettings> | null): DashboardColorsPayload => ({
  tile_colors: {
    background: settings?.tile_colors?.background || DEFAULT_TILE_COLORS.background,
    text: settings?.tile_colors?.text || DEFAULT_TILE_COLORS.text,
  },
  saved_hours_colors: {
    background: settings?.saved_hours_colors?.background || DEFAULT_SAVED_HOURS_COLORS.background,
    text: settings?.saved_hours_colors?.text || DEFAULT_SAVED_HOURS_COLORS.text,
  },
  button_colors: {
    background: settings?.button_colors?.background || DEFAULT_BUTTON_COLORS.background,
    text: settings?.button_colors?.text || DEFAULT_BUTTON_COLORS.text,
  },
  background_color: settings?.background_color || DEFAULT_BACKGROUND_COLOR,
});

const mapRowToDashboardSettings = (data: DashboardSettingsRow): DashboardSettings => {
  const dashboardColors = getDashboardColors(data.dashboard_colors);

  return {
    ...data,
    tile_order: getTileOrder(data.tile_order),
    custom_labels: getStringRecord(data.custom_labels),
    custom_tooltips: getStringRecord(data.custom_tooltips),
    impact_colors: getImpactColors(data.impact_colors),
    tile_colors: dashboardColors.tile_colors,
    saved_hours_colors: dashboardColors.saved_hours_colors,
    button_colors: dashboardColors.button_colors,
    background_color: dashboardColors.background_color,
  };
};

// Sync updates to all other users via edge function
const syncToAllUsers = async (updates: Record<string, unknown>, excludeUserId?: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.functions.invoke('sync-dashboard-settings', {
      body: { updates, exclude_user_id: excludeUserId },
    });
  } catch (err) {
    console.error('Failed to sync to all users:', err);
  }
};

export const useDashboardSettings = (userId?: string) => {
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }
      const user = uid ? { id: uid } : null;
      if (!user) return;

      const { data, error } = await supabase
        .from('user_dashboard_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(mapRowToDashboardSettings(data as unknown as DashboardSettingsRow));
      } else {
        const insertPayload: DashboardSettingsInsert = {
          user_id: user.id,
          tile_order: DEFAULT_SETTINGS.tile_order,
          custom_labels: DEFAULT_SETTINGS.custom_labels,
          theme: DEFAULT_SETTINGS.theme,
          custom_tooltips: DEFAULT_SETTINGS.custom_tooltips,
          impact_colors: DEFAULT_SETTINGS.impact_colors,
          dashboard_colors: buildDashboardColorsPayload(DEFAULT_SETTINGS) as Json,
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('user_dashboard_settings')
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(mapRowToDashboardSettings(newSettings as unknown as DashboardSettingsRow));
      }
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<DashboardSettings>, syncGlobal = true) => {
    if (!settings?.id) return;

    try {
      const dbUpdates: DashboardSettingsUpdate = updates as unknown as DashboardSettingsUpdate;
      const { error } = await supabase
        .from('user_dashboard_settings')
        .update(dbUpdates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);

      // Sync to all other users
      if (syncGlobal) {
        await syncToAllUsers(updates, settings.user_id);
      }

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
    const currentDashboardColors = buildDashboardColorsPayload(settings);
    const newDashboardColors = { ...currentDashboardColors, tile_colors: newColors };
    await supabase
      .from('user_dashboard_settings')
      .update({ dashboard_colors: newDashboardColors })
      .eq('id', settings?.id);
    setSettings(prev => prev ? { ...prev, tile_colors: newColors } : null);
    await syncToAllUsers({ dashboard_colors: newDashboardColors }, settings?.user_id);
    toast({ title: 'Opgeslagen', description: 'Tile kleuren bijgewerkt' });
  };

  const updateSavedHoursColors = async (colors: { background?: string; text?: string }) => {
    const newColors = { ...settings?.saved_hours_colors, ...colors };
    const currentDashboardColors = buildDashboardColorsPayload(settings);
    const newDashboardColors = { ...currentDashboardColors, saved_hours_colors: newColors };
    await supabase
      .from('user_dashboard_settings')
      .update({ dashboard_colors: newDashboardColors })
      .eq('id', settings?.id);
    setSettings(prev => prev ? { ...prev, saved_hours_colors: newColors } : null);
    await syncToAllUsers({ dashboard_colors: newDashboardColors }, settings?.user_id);
    toast({ title: 'Opgeslagen', description: 'Saved hours kleuren bijgewerkt' });
  };

  const updateButtonColors = async (colors: { background?: string; text?: string }) => {
    const newColors = { ...settings?.button_colors, ...colors };
    const currentDashboardColors = buildDashboardColorsPayload(settings);
    const newDashboardColors = { ...currentDashboardColors, button_colors: newColors };
    await supabase
      .from('user_dashboard_settings')
      .update({ dashboard_colors: newDashboardColors })
      .eq('id', settings?.id);
    setSettings(prev => prev ? { ...prev, button_colors: newColors } : null);
    if (newColors.background) {
      document.documentElement.style.setProperty('--button-primary-bg', newColors.background);
    }
    if (newColors.text) {
      document.documentElement.style.setProperty('--button-primary-text', newColors.text);
    }
    await syncToAllUsers({ dashboard_colors: newDashboardColors }, settings?.user_id);
    toast({ title: 'Opgeslagen', description: 'Knopkleuren bijgewerkt' });
  };

  const updateBackgroundColor = async (color: string) => {
    const currentDashboardColors = buildDashboardColorsPayload(settings);
    const newDashboardColors = { ...currentDashboardColors, background_color: color };
    await supabase
      .from('user_dashboard_settings')
      .update({ dashboard_colors: newDashboardColors })
      .eq('id', settings?.id);
    setSettings(prev => prev ? { ...prev, background_color: color } : null);
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
      document.documentElement.style.setProperty('--background', hexToHsl(color));
    }
    await syncToAllUsers({ dashboard_colors: newDashboardColors }, settings?.user_id);
    toast({ title: 'Opgeslagen', description: 'Achtergrondkleur bijgewerkt' });
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
    updateBackgroundColor,
    updateTheme,
    refetch: fetchSettings,
  };
};
