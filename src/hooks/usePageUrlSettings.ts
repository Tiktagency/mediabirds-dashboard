import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PageUrlSettings {
  id?: string;
  company_id: string;
  google_sheet_id: string;
  google_file_id: string;
  page_urls: Record<string, string>;
}

export const usePageUrlSettings = (companyId: string | null) => {
  const [settings, setSettings] = useState<PageUrlSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!companyId) {
      setSettings(null);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_url_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          company_id: data.company_id,
          google_sheet_id: data.google_sheet_id || '',
          google_file_id: data.google_file_id || '',
          page_urls: (data.page_urls as Record<string, string>) || {},
        });
      } else {
        setSettings({
          company_id: companyId,
          google_sheet_id: '',
          google_file_id: '',
          page_urls: {},
        });
      }
    } catch (error) {
      console.error('Error loading page URL settings:', error);
      setSettings({
        company_id: companyId,
        google_sheet_id: '',
        google_file_id: '',
        page_urls: {},
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: Partial<PageUrlSettings>) => {
    if (!companyId) return { success: false, error: 'No company selected' };

    setIsSaving(true);
    try {
      const dataToSave = {
        company_id: companyId,
        google_sheet_id: newSettings.google_sheet_id ?? settings?.google_sheet_id ?? '',
        google_file_id: newSettings.google_file_id ?? settings?.google_file_id ?? '',
        page_urls: newSettings.page_urls ?? settings?.page_urls ?? {},
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('page_url_settings')
        .upsert(dataToSave, { onConflict: 'company_id' });

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...dataToSave } : null);
      return { success: true };
    } catch (error) {
      console.error('Error saving page URL settings:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    reloadSettings: loadSettings,
  };
};
