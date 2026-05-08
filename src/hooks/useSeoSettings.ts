import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SeoSettings {
  id: string;
  company_id: string;
  blog_onderwerp: string | null;
  doelgroep_intentie: string | null;
  bedrijfsomschrijving: string | null;
  extra_instructies: string | null;
  google_sheet_id: string | null;
  google_slides_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useSeoSettings = (companyId: string | null) => {
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setSettings(null);
      return;
    }

    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching SEO settings:', fetchError);
        setError(fetchError.message);
      } else {
        setSettings(data as SeoSettings | null);
      }

      setIsLoading(false);
    };

    fetchSettings();
  }, [companyId]);

  const saveSettings = useCallback(async (newSettings: Partial<Omit<SeoSettings, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!companyId) return { success: false, error: 'No company selected' };

    setIsSaving(true);
    setError(null);

    try {
      if (settings?.id) {
        // Update existing
        const { data, error: updateError } = await supabase
          .from('seo_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setSettings(data as SeoSettings);
      } else {
        // Insert new
        const { data, error: insertError } = await supabase
          .from('seo_settings')
          .insert({
            company_id: companyId,
            ...newSettings,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(data as SeoSettings);
      }

      setIsSaving(false);
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error saving SEO settings:', err);
      setError(err.message);
      setIsSaving(false);
      return { success: false, error: err.message };
    }
  }, [companyId, settings?.id]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    saveSettings,
  };
};
