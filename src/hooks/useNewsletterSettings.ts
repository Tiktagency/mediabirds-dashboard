import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NewsletterSettings {
  id: string;
  bedrijfsnaam: string;
  tagline: string;
  bedrijfsomschrijving: string;
  bedrijfsinformatie: string; // legacy alias
  doelgroep: string;
  toon: string;
  cta_tekst: string;
  cta_url: string;
  website: string;
  schrijfstijl: string; // kept for backwards compat
  rss_feeds: string[];
  primaire_kleur: string;
  secundaire_kleur: string;
  achtergrond_kleur: string;
  kaart_achtergrond: string;
  tekst_kleur: string;
  subtekst_kleur: string;
  accent_kleur: string;
  cta_tekst_kleur: string;
  footer_achtergrond: string;
  footer_tekst_kleur: string;
  generated_html: string | null;
}

const DEFAULT_SETTINGS: Omit<NewsletterSettings, 'id'> = {
  bedrijfsnaam: '',
  tagline: '',
  bedrijfsomschrijving: '',
  bedrijfsinformatie: '',
  doelgroep: '',
  toon: '',
  cta_tekst: '',
  cta_url: '',
  website: '',
  schrijfstijl: '',
  rss_feeds: [],
  primaire_kleur: '#FF6B2C',
  secundaire_kleur: '#1A2B5E',
  achtergrond_kleur: '#F5F3EF',
  kaart_achtergrond: '#FFFFFF',
  tekst_kleur: '#1A1A2E',
  subtekst_kleur: '#6B7280',
  accent_kleur: '#FFF0E8',
  cta_tekst_kleur: '#FFFFFF',
  footer_achtergrond: '#1A2B5E',
  footer_tekst_kleur: '#E8EDF7',
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
        setSettings({ id: '', ...DEFAULT_SETTINGS });
      } else if (data) {
        setSettings({
          id: data.id,
          bedrijfsnaam: data.bedrijfsnaam || '',
          tagline: (data as any).tagline || '',
          bedrijfsomschrijving: (data as any).bedrijfsomschrijving || '',
          bedrijfsinformatie: data.bedrijfsinformatie || '',
          doelgroep: (data as any).doelgroep || '',
          toon: (data as any).toon || '',
          cta_tekst: (data as any).cta_tekst || '',
          cta_url: (data as any).cta_url || '',
          website: (data as any).website || '',
          schrijfstijl: data.schrijfstijl || '',
          rss_feeds: Array.isArray(data.rss_feeds) ? (data.rss_feeds as string[]) : [],
          primaire_kleur: data.primaire_kleur || '#FF6B2C',
          secundaire_kleur: (data as any).secundaire_kleur || '#1A2B5E',
          achtergrond_kleur: data.achtergrond_kleur || '#F5F3EF',
          kaart_achtergrond: (data as any).kaart_achtergrond || '#FFFFFF',
          tekst_kleur: (data as any).tekst_kleur || '#1A1A2E',
          subtekst_kleur: (data as any).subtekst_kleur || '#6B7280',
          accent_kleur: data.accent_kleur || '#FFF0E8',
          cta_tekst_kleur: (data as any).cta_tekst_kleur || '#FFFFFF',
          footer_achtergrond: (data as any).footer_achtergrond || '#1A2B5E',
          footer_tekst_kleur: (data as any).footer_tekst_kleur || '#E8EDF7',
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
        const payload: any = {
          user_id: user.id,
          bedrijfsnaam: merged.bedrijfsnaam,
          tagline: merged.tagline,
          bedrijfsomschrijving: merged.bedrijfsomschrijving,
          bedrijfsinformatie: merged.bedrijfsinformatie,
          doelgroep: merged.doelgroep,
          toon: merged.toon,
          cta_tekst: merged.cta_tekst,
          cta_url: merged.cta_url,
          website: merged.website,
          schrijfstijl: merged.schrijfstijl,
          rss_feeds: merged.rss_feeds,
          primaire_kleur: merged.primaire_kleur,
          secundaire_kleur: merged.secundaire_kleur,
          achtergrond_kleur: merged.achtergrond_kleur,
          kaart_achtergrond: merged.kaart_achtergrond,
          tekst_kleur: merged.tekst_kleur,
          subtekst_kleur: merged.subtekst_kleur,
          accent_kleur: merged.accent_kleur,
          cta_tekst_kleur: merged.cta_tekst_kleur,
          footer_achtergrond: merged.footer_achtergrond,
          footer_tekst_kleur: merged.footer_tekst_kleur,
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
