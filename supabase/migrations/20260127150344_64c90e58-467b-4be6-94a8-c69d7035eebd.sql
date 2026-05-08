-- Create email_signature_settings table
CREATE TABLE public.email_signature_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  job_title TEXT NOT NULL,
  website TEXT,
  socials JSONB DEFAULT '[]'::jsonb,
  background_type TEXT NOT NULL DEFAULT 'solid' CHECK (background_type IN ('gradient', 'solid')),
  background_color TEXT NOT NULL DEFAULT '#1a1a2e',
  gradient_end_color TEXT,
  text_color TEXT NOT NULL DEFAULT '#ffffff',
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_signature_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own settings"
ON public.email_signature_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.email_signature_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.email_signature_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
ON public.email_signature_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER update_email_signature_settings_updated_at
BEFORE UPDATE ON public.email_signature_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true);

-- Storage policies
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add automation settings record for the tile
INSERT INTO public.automation_settings (automation_name, display_name, description, impact_level, status, category)
VALUES ('email-handtekening', 'Email Handtekening', 'Genereer professionele email handtekeningen met profielfoto', 'low', 'active', 'branding');