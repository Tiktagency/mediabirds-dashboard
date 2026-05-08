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
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  emails: string[];
  job_title: string;
  phone_number: string | null;
  phone_numbers: string[];
  website: string | null;
  location: string | null;
  locations: string[];
  socials: SocialLink[];
  background_type: 'gradient' | 'solid';
  background_color: string;
  gradient_end_color: string | null;
  text_color: string;
  profile_photo_url: string | null;
  company_logo_url: string | null;
  generated_html: string | null;
  created_at: string;
  updated_at: string;
}

export const useEmailSignatureSettings = () => {
  const [signatures, setSignatures] = useState<EmailSignatureSettings[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<EmailSignatureSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const parseSignature = (data: any): EmailSignatureSettings => {
    let parsedSocials: SocialLink[] = [];
    if (Array.isArray(data.socials)) {
      parsedSocials = data.socials as unknown as SocialLink[];
    }
    
    // Parse JSONB arrays
    const parseJsonArray = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
        } catch {
          return [];
        }
      }
      return [];
    };
    
    return {
      ...data,
      socials: parsedSocials,
      emails: parseJsonArray(data.emails),
      phone_numbers: parseJsonArray(data.phone_numbers),
      locations: parseJsonArray(data.locations),
      background_type: data.background_type as 'gradient' | 'solid',
    };
  };

  const fetchAllSignatures = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('email_signature_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map(parseSignature);
      setSignatures(parsed);
      
      // Auto-select first signature if none selected
      if (parsed.length > 0 && !selectedSignature) {
        setSelectedSignature(parsed[0]);
      }
    } catch (error) {
      console.error('Error fetching email signature settings:', error);
      toast({
        title: 'Fout',
        description: 'Kon handtekeningen niet laden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectSignature = (id: string | null) => {
    setIsCreatingNew(false);
    if (id === null) {
      setSelectedSignature(null);
    } else {
      const signature = signatures.find(s => s.id === id);
      setSelectedSignature(signature || null);
    }
  };

  const createNewSignature = () => {
    setSelectedSignature(null);
    setIsCreatingNew(true);
  };

  const saveSettings = async (
    newSettings: Omit<EmailSignatureSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    options?: { silent?: boolean }
  ) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const socialsJson = JSON.parse(JSON.stringify(newSettings.socials));
      
      if (selectedSignature?.id) {
        // Update existing
        const { error } = await supabase
          .from('email_signature_settings')
          .update({
            name: newSettings.name,
            first_name: newSettings.first_name,
            last_name: newSettings.last_name,
            email: newSettings.email,
            emails: JSON.stringify(newSettings.emails),
            job_title: newSettings.job_title,
            phone_number: newSettings.phone_number,
            phone_numbers: JSON.stringify(newSettings.phone_numbers),
            website: newSettings.website,
            location: newSettings.location,
            locations: JSON.stringify(newSettings.locations),
            socials: socialsJson,
            background_type: newSettings.background_type,
            background_color: newSettings.background_color,
            gradient_end_color: newSettings.gradient_end_color,
            text_color: newSettings.text_color,
            profile_photo_url: newSettings.profile_photo_url,
            company_logo_url: newSettings.company_logo_url,
            generated_html: newSettings.generated_html,
          })
          .eq('id', selectedSignature.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('email_signature_settings')
          .insert({
            user_id: user.id,
            name: newSettings.name,
            first_name: newSettings.first_name,
            last_name: newSettings.last_name,
            email: newSettings.email,
            emails: JSON.stringify(newSettings.emails),
            job_title: newSettings.job_title,
            phone_number: newSettings.phone_number,
            phone_numbers: JSON.stringify(newSettings.phone_numbers),
            website: newSettings.website,
            location: newSettings.location,
            locations: JSON.stringify(newSettings.locations),
            socials: socialsJson,
            background_type: newSettings.background_type,
            background_color: newSettings.background_color,
            gradient_end_color: newSettings.gradient_end_color,
            text_color: newSettings.text_color,
            profile_photo_url: newSettings.profile_photo_url,
            company_logo_url: newSettings.company_logo_url,
            generated_html: newSettings.generated_html,
          })
          .select()
          .single();

        if (error) throw error;
        
        // Select the newly created signature
        if (data) {
          setSelectedSignature(parseSignature(data));
        }
      }

      // Alleen toast tonen als niet silent
      if (!options?.silent) {
        toast({
          title: 'Opgeslagen',
          description: 'Je email handtekening is opgeslagen',
        });
      }

      await fetchAllSignatures();
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

  const deleteSignature = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('email_signature_settings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Verwijderd',
        description: 'Handtekening is verwijderd',
      });

      // Clear selection if deleted signature was selected
      if (selectedSignature?.id === id) {
        setSelectedSignature(null);
      }

      await fetchAllSignatures();
    } catch (error) {
      console.error('Error deleting signature:', error);
      toast({
        title: 'Fout',
        description: 'Kon handtekening niet verwijderen',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAllSignatures();
  }, [user]);

  return {
    signatures,
    selectedSignature,
    isLoading,
    isSaving,
    isCreatingNew,
    selectSignature,
    createNewSignature,
    saveSettings,
    deleteSignature,
    refetch: fetchAllSignatures,
  };
};
