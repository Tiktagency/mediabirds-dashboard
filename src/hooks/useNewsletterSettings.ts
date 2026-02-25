import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NewsletterSettings {
  id: string;
  bedrijfsnaam: string;
  bedrijfsinformatie: string;
  schrijfstijl: string;
  rss_feeds: string[];
  achtergrond_kleur: string;
  primaire_kleur: string;
  accent_kleur: string;
  generated_html: string | null;
}

const DEFAULT_SETTINGS: Omit<NewsletterSettings, 'id'> = {
  bedrijfsnaam: '',
  bedrijfsinformatie: '',
  schrijfstijl: '',
  rss_feeds: [],
  achtergrond_kleur: '#ffffff',
  primaire_kleur: '#000000',
  accent_kleur: '#4f46e5',
  generated_html: null,
};

export const useNewsletterSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NewsletterSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No record yet, use defaults
        setSettings({ id: '', ...DEFAULT_SETTINGS });
      } else if (data) {
        setSettings({
          id: data.id,
          bedrijfsnaam: data.bedrijfsnaam || '',
          bedrijfsinformatie: data.bedrijfsinformatie || '',
          schrijfstijl: data.schrijfstijl || '',
          rss_feeds: Array.isArray(data.rss_feeds) ? (data.rss_feeds as string[]) : [],
          achtergrond_kleur: data.achtergrond_kleur || '#ffffff',
          primaire_kleur: data.primaire_kleur || '#000000',
          accent_kleur: data.accent_kleur || '#4f46e5',
          generated_html: data.generated_html || null,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (updated: Partial<NewsletterSettings>) => {
    if (!user) return;

    const merged = { ...settings, ...updated } as NewsletterSettings;
    setSettings(merged);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const payload = {
          user_id: user.id,
          bedrijfsnaam: merged.bedrijfsnaam,
          bedrijfsinformatie: merged.bedrijfsinformatie,
          schrijfstijl: merged.schrijfstijl,
          rss_feeds: merged.rss_feeds,
          achtergrond_kleur: merged.achtergrond_kleur,
          primaire_kleur: merged.primaire_kleur,
          accent_kleur: merged.accent_kleur,
          generated_html: merged.generated_html,
        };

        if (merged.id) {
          await supabase
            .from('newsletter_settings')
            .update(payload)
            .eq('id', merged.id)
            .eq('user_id', user.id);
        } else {
          const { data } = await supabase
            .from('newsletter_settings')
            .insert(payload)
            .select('id')
            .single();
          if (data) setSettings(prev => prev ? { ...prev, id: data.id } : prev);
        }
      } finally {
        setIsSaving(false);
      }
    }, 800);
  }, [user, settings]);

  const setGeneratedHtml = useCallback(async (html: string) => {
    if (!user || !settings) return;
    const updated = { ...settings, generated_html: html };
    setSettings(updated);

    if (updated.id) {
      await supabase
        .from('newsletter_settings')
        .update({ generated_html: html })
        .eq('id', updated.id)
        .eq('user_id', user.id);
    }
  }, [user, settings]);

  return { settings, isLoading, isSaving, saveSettings, setGeneratedHtml, reload: loadSettings };
};
