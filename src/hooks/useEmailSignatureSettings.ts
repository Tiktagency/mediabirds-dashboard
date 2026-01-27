import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'other';
  url: string;
}

export interface EmailSignatureSettings {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  website: string | null;
  socials: SocialLink[];
  background_type: 'gradient' | 'solid';
  background_color: string;
  gradient_end_color: string | null;
  text_color: string;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useEmailSignatureSettings = () => {
  const [settings, setSettings] = useState<EmailSignatureSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSettings = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('email_signature_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Safely parse socials as SocialLink[]
        let parsedSocials: SocialLink[] = [];
        if (Array.isArray(data.socials)) {
          parsedSocials = data.socials as unknown as SocialLink[];
        }
        
        setSettings({
          ...data,
          socials: parsedSocials,
          background_type: data.background_type as 'gradient' | 'solid',
        });
      }
    } catch (error) {
      console.error('Error fetching email signature settings:', error);
      toast({
        title: 'Fout',
        description: 'Kon instellingen niet laden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Omit<EmailSignatureSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Convert socials to JSON-compatible format
      const socialsJson = JSON.parse(JSON.stringify(newSettings.socials));
      
      if (settings?.id) {
        // Update existing
        const { error } = await supabase
          .from('email_signature_settings')
          .update({
            first_name: newSettings.first_name,
            last_name: newSettings.last_name,
            email: newSettings.email,
            job_title: newSettings.job_title,
            website: newSettings.website,
            socials: socialsJson,
            background_type: newSettings.background_type,
            background_color: newSettings.background_color,
            gradient_end_color: newSettings.gradient_end_color,
            text_color: newSettings.text_color,
            profile_photo_url: newSettings.profile_photo_url,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('email_signature_settings')
          .insert({
            user_id: user.id,
            first_name: newSettings.first_name,
            last_name: newSettings.last_name,
            email: newSettings.email,
            job_title: newSettings.job_title,
            website: newSettings.website,
            socials: socialsJson,
            background_type: newSettings.background_type,
            background_color: newSettings.background_color,
            gradient_end_color: newSettings.gradient_end_color,
            text_color: newSettings.text_color,
            profile_photo_url: newSettings.profile_photo_url,
          });

        if (error) throw error;
      }

      toast({
        title: 'Opgeslagen',
        description: 'Je email handtekening instellingen zijn opgeslagen',
      });

      await fetchSettings();
    } catch (error) {
      console.error('Error saving email signature settings:', error);
      toast({
        title: 'Fout',
        description: 'Kon instellingen niet opslaan',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      toast({
        title: 'Bestand te groot',
        description: 'Maximale bestandsgrootte is 5MB',
        variant: 'destructive',
      });
      return null;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Ongeldig bestandstype',
        description: 'Alleen JPG, PNG en WebP zijn toegestaan',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: 'Upload mislukt',
        description: 'Kon profielfoto niet uploaden',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    uploadProfilePhoto,
    refetch: fetchSettings,
  };
};
