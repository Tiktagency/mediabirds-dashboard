import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogSettings {
  id: string;
  company_id: string;
  bedrijfsnaam: string | null;
  bedrijfsomschrijving: string | null;
  schrijfstijl: string | null;
  aantal_woorden: string | null; // Now stored as range "min-max" e.g. "500-1000"
  taal: string | null;
  achtergrond_kleur: string | null;
  hoofdaccent_gradient: string | null;
  folder_id: string | null;
  used_folder_id: string | null;
  image_type: string | null;
  get_afbeelding_url: string | null;
  post_blog_url: string | null;
  status: string | null;
  google_sheet_id: string | null;
  google_slides_id: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export const useBlogSettings = (companyId: string | null) => {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
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
        .from('blog_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching blog settings:', fetchError);
        setError(fetchError.message);
      } else {
        setSettings(data as unknown as BlogSettings | null);
      }

      setIsLoading(false);
    };

    fetchSettings();
  }, [companyId]);

  const saveSettings = useCallback(async (newSettings: Partial<Omit<BlogSettings, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!companyId) return { success: false, error: 'No company selected' };

    setIsSaving(true);
    setError(null);

    try {
      if (settings?.id) {
        // Update existing
        const { data, error: updateError } = await supabase
          .from('blog_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setSettings(data as unknown as BlogSettings);
      } else {
        // Insert new
        const { data, error: insertError } = await supabase
          .from('blog_settings')
          .insert({
            company_id: companyId,
            ...newSettings,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(data as unknown as BlogSettings);
      }

      setIsSaving(false);
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error saving blog settings:', err);
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
