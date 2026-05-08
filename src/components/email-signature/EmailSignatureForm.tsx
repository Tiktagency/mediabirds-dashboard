import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { SocialLink, EmailSignatureSettings } from '@/hooks/useEmailSignatureSettings';
import { Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DynamicFieldGroup } from './DynamicFieldGroup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  first_name: z.string().min(1, 'Voornaam is verplicht'),
  last_name: z.string().min(1, 'Achternaam is verplicht'),
  email: z.string().email('Ongeldig email adres'),
  job_title: z.string().min(1, 'Functie is verplicht'),
  phone_number: z.string()
    .regex(/^[+]?[\d\s\-()]+$/, 'Ongeldig telefoonnummer formaat')
    .optional()
    .or(z.literal('')),
  website: z.string().url('Ongeldige URL').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  background_type: z.enum(['gradient', 'solid']),
  background_color: z.string().min(1, 'Achtergrondkleur is verplicht'),
  gradient_end_color: z.string().optional(),
  text_color: z.string().min(1, 'Tekstkleur is verplicht'),
});

type FormData = z.infer<typeof formSchema>;

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'other', label: 'Overig' },
] as const;

interface EmailSignatureFormProps {
  selectedSignature: EmailSignatureSettings | null;
  isSaving: boolean;
  onSave: (
    settings: Omit<EmailSignatureSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    options?: { silent?: boolean }
  ) => Promise<void>;
  onHtmlGenerated?: (html: string) => void;
  onGeneratingChange?: (generating: boolean) => void;
}

export const EmailSignatureForm = ({
  selectedSignature,
  isSaving,
  onSave,
  onHtmlGenerated,
  onGeneratingChange,
}: EmailSignatureFormProps) => {
  const { toast } = useToast();
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Extra velden state (max 1 extra per type = 2 totaal)
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [extraPhoneNumbers, setExtraPhoneNumbers] = useState<string[]>([]);
  const [extraLocations, setExtraLocations] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: 'Mijn Handtekening',
      first_name: '',
      last_name: '',
      email: '',
      job_title: '',
      phone_number: '',
      website: '',
      location: '',
      background_type: 'solid',
      background_color: '#1a1a2e',
      gradient_end_color: '#16213e',
      text_color: '#ffffff',
    },
  });

  const backgroundType = watch('background_type');
  const backgroundColor = watch('background_color');
  const gradientEndColor = watch('gradient_end_color');
  const textColor = watch('text_color');
  const watchedFields = watch();

  // Auto-save functie
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const data = watchedFields;
      // Alleen opslaan als verplichte velden zijn ingevuld
      if (data.name && data.first_name && data.last_name && data.email && data.job_title) {
        // Combineer primaire velden met extra velden
        const allEmails = [data.email, ...extraEmails.filter(e => e.trim() !== '')];
        const allPhoneNumbers = [data.phone_number, ...extraPhoneNumbers.filter(p => p.trim() !== '')].filter(Boolean) as string[];
        const allLocations = [data.location, ...extraLocations.filter(l => l.trim() !== '')].filter(Boolean) as string[];
        
        await onSave({
          name: data.name,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          emails: allEmails,
          job_title: data.job_title,
          phone_number: data.phone_number || null,
          phone_numbers: allPhoneNumbers,
          website: data.website || null,
          location: data.location || null,
          locations: allLocations,
          background_type: data.background_type,
          background_color: data.background_color,
          gradient_end_color: data.background_type === 'gradient' ? data.gradient_end_color || null : null,
          text_color: data.text_color,
          socials,
          profile_photo_url: profilePhotoUrl,
          company_logo_url: companyLogoUrl,
          generated_html: selectedSignature?.generated_html || null,
        }, { silent: true });
      }
    }, 1000); // 1 seconde debounce
  };

  // Watch voor auto-save bij veldwijzigingen
  useEffect(() => {
    triggerAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [watchedFields.name, watchedFields.first_name, watchedFields.last_name, watchedFields.email, watchedFields.job_title, watchedFields.phone_number, watchedFields.website, watchedFields.location, watchedFields.background_type, watchedFields.background_color, watchedFields.gradient_end_color, watchedFields.text_color]);

  // Auto-save bij socials wijziging
  useEffect(() => {
    triggerAutoSave();
  }, [socials]);

  // Auto-save bij extra velden wijziging
  useEffect(() => {
    triggerAutoSave();
  }, [extraEmails, extraPhoneNumbers, extraLocations]);

  // Auto-save bij profielfoto of logo wijziging
  useEffect(() => {
    if (profilePhotoUrl !== selectedSignature?.profile_photo_url) {
      triggerAutoSave();
    }
  }, [profilePhotoUrl]);

  useEffect(() => {
    if (companyLogoUrl !== selectedSignature?.company_logo_url) {
      triggerAutoSave();
    }
  }, [companyLogoUrl]);

  // Update form when selected signature changes
  useEffect(() => {
    if (selectedSignature) {
      reset({
        name: selectedSignature.name,
        first_name: selectedSignature.first_name,
        last_name: selectedSignature.last_name,
        email: selectedSignature.email,
        job_title: selectedSignature.job_title,
        phone_number: selectedSignature.phone_number || '',
        website: selectedSignature.website || '',
        location: selectedSignature.location || '',
        background_type: selectedSignature.background_type,
        background_color: selectedSignature.background_color,
        gradient_end_color: selectedSignature.gradient_end_color || '#16213e',
        text_color: selectedSignature.text_color,
      });
      setSocials(selectedSignature.socials || []);
      setProfilePhotoUrl(selectedSignature.profile_photo_url);
      setCompanyLogoUrl(selectedSignature.company_logo_url);
      
      // Extra velden uit arrays (skip eerste omdat dat het primaire veld is)
      setExtraEmails(selectedSignature.emails.slice(1));
      setExtraPhoneNumbers(selectedSignature.phone_numbers.slice(1));
      setExtraLocations(selectedSignature.locations.slice(1));
    } else {
      // Reset to defaults for new signature
      reset({
        name: 'Mijn Handtekening',
        first_name: '',
        last_name: '',
        email: '',
        job_title: '',
        phone_number: '',
        website: '',
        location: '',
        background_type: 'solid',
        background_color: '#1a1a2e',
        gradient_end_color: '#16213e',
        text_color: '#ffffff',
      });
      setSocials([]);
      setProfilePhotoUrl(null);
      setCompanyLogoUrl(null);
      setExtraEmails([]);
      setExtraPhoneNumbers([]);
      setExtraLocations([]);
    }
  }, [selectedSignature, reset]);

  const addSocialLink = () => {
    setSocials([...socials, { platform: 'linkedin', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  const onSubmit = async (data: FormData) => {
    // Valideer foto URLs indien aanwezig
    setPhotoError(null);
    const urlsToValidate = [
      { url: profilePhotoUrl, name: 'profielfoto' },
      { url: companyLogoUrl, name: 'bedrijfslogo' },
    ].filter(item => item.url);

    for (const { url, name } of urlsToValidate) {
      try {
        const img = new Image();
        img.src = url!;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(() => reject(new Error('timeout')), 5000);
        });
      } catch {
        setPhotoError(`De ${name} link is niet geldig of niet openbaar toegankelijk`);
        return;
      }
    }

    // Combineer primaire velden met extra velden voor webhook
    const allEmails = [data.email, ...extraEmails.filter(e => e.trim() !== '')];
    const allPhoneNumbers = [data.phone_number, ...extraPhoneNumbers.filter(p => p.trim() !== '')].filter(Boolean) as string[];
    const allLocations = [data.location, ...extraLocations.filter(l => l.trim() !== '')].filter(Boolean) as string[];
    
    const signatureData = {
      name: data.name,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      emails: allEmails,
      job_title: data.job_title,
      phone_number: data.phone_number || null,
      phone_numbers: allPhoneNumbers,
      website: data.website || null,
      location: data.location || null,
      locations: allLocations,
      background_type: data.background_type,
      background_color: data.background_color,
      gradient_end_color: data.background_type === 'gradient' ? data.gradient_end_color || null : null,
      text_color: data.text_color,
      socials,
      profile_photo_url: profilePhotoUrl,
      company_logo_url: companyLogoUrl,
      generated_html: null as string | null,
    };

    // Alleen naar webhook sturen via edge function, niet opslaan
    setIsSending(true);
    onGeneratingChange?.(true);
    try {
      const response = await supabase.functions.invoke('trigger-email-signature', {
        body: signatureData,
      });

      if (response.error) {
        toast({
          title: 'Fout',
          description: response.error.message,
          variant: 'destructive',
        });
        return;
      }

      const responseData = response.data;
      console.log('Webhook response:', responseData);

      if (!responseData?.success) {
        toast({
          title: `Webhook fout (${responseData?.status || 'onbekend'})`,
          description: responseData?.rawText || 'Geen response ontvangen',
          variant: 'destructive',
        });
        return;
      }

      // Extract HTML from response
      if (responseData?.rawText) {
        let htmlCode = responseData.rawText;
        try {
          const parsed = JSON.parse(responseData.rawText);
          
          // Als het een array is, pak het eerste element
          const data = Array.isArray(parsed) ? parsed[0] : parsed;
          
          // Zoek de HTML in bekende keys (inclusief Emailhandtekening)
          htmlCode = data?.Emailhandtekening || 
                     data?.html || 
                     data?.output || 
                     data?.Output || 
                     data?.message || 
                     responseData.rawText;
        } catch {
          // Gebruik raw text als het geen JSON is (waarschijnlijk pure HTML)
        }
        // Verwijder omringende aanhalingstekens indien aanwezig
        if (typeof htmlCode === 'string') {
          htmlCode = htmlCode.replace(/^["']|["']$/g, '');
        }
        onHtmlGenerated?.(htmlCode);
      }

      toast({
        title: 'Handtekening gegenereerd',
        description: 'De HTML code is klaar',
      });
    } catch (error) {
      console.error('Error calling webhook:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Onbekende fout',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
      onGeneratingChange?.(false);
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${backgroundColor}, ${gradientEndColor})`,
      };
    }
    return { backgroundColor };
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Signature Name */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Handtekening naam *</Label>
            <Input
              id="name"
              {...register('name')}
              className="bg-white/10 border-white/20 text-white"
              placeholder="bijv. Werk, Marketing, Persoonlijk"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-white">Voornaam *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Jan"
              />
              {errors.first_name && (
                <p className="text-sm text-red-400">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-white">Achternaam *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Jansen"
              />
              {errors.last_name && (
                <p className="text-sm text-red-400">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Email met extra veld mogelijkheid */}
          <DynamicFieldGroup
            label="Email"
            required
            primaryValue={watchedFields.email || ''}
            primaryPlaceholder="jan@bedrijf.nl"
            extraValues={extraEmails}
            onPrimaryChange={(value) => setValue('email', value)}
            onExtraChange={setExtraEmails}
            inputType="email"
            error={errors.email?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="job_title" className="text-white">Functie *</Label>
            <Input
              id="job_title"
              {...register('job_title')}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Marketing Manager"
            />
            {errors.job_title && (
              <p className="text-sm text-red-400">{errors.job_title.message}</p>
            )}
          </div>

          {/* Telefoonnummer met extra veld mogelijkheid */}
          <DynamicFieldGroup
            label="Telefoonnummer (optioneel)"
            primaryValue={watchedFields.phone_number || ''}
            primaryPlaceholder="+31 6 12345678"
            extraValues={extraPhoneNumbers}
            onPrimaryChange={(value) => setValue('phone_number', value)}
            onExtraChange={setExtraPhoneNumbers}
            inputType="tel"
            error={errors.phone_number?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="website" className="text-white">Website (optioneel)</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              className="bg-white/10 border-white/20 text-white"
              placeholder="https://www.bedrijf.nl"
            />
            {errors.website && (
              <p className="text-sm text-red-400">{errors.website.message}</p>
            )}
          </div>

          {/* Plaatsnaam met extra veld mogelijkheid */}
          <DynamicFieldGroup
            label="Plaatsnaam (optioneel)"
            primaryValue={watchedFields.location || ''}
            primaryPlaceholder="Amsterdam"
            extraValues={extraLocations}
            onPrimaryChange={(value) => setValue('location', value)}
            onExtraChange={setExtraLocations}
          />
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Social Links</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSocialLink}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              Toevoegen
            </Button>
          </div>

          {socials.map((social, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={social.platform}
                onValueChange={(value) => updateSocialLink(index, 'platform', value)}
              >
                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={social.url}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-white/10 border-white/20 text-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSocialLink(index)}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {socials.length === 0 && (
            <p className="text-white/50 text-sm">Nog geen social links toegevoegd</p>
          )}
        </CardContent>
      </Card>

      {/* Colors */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <Label className="text-white">Achtergrond kleur *</Label>
            <RadioGroup
              value={backgroundType}
              onValueChange={(value) => setValue('background_type', value as 'gradient' | 'solid')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gradient" id="gradient" />
                <Label htmlFor="gradient" className="text-white cursor-pointer">Gradient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solid" id="solid" />
                <Label htmlFor="solid" className="text-white cursor-pointer">Standaard kleur</Label>
              </div>
            </RadioGroup>

            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">
                  {backgroundType === 'gradient' ? 'Start kleur' : 'Kleur'}
                </Label>
                <Input
                  type="color"
                  {...register('background_color')}
                  className="w-16 h-10 p-1 bg-transparent border-white/20 cursor-pointer"
                />
              </div>
              {backgroundType === 'gradient' && (
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Eind kleur</Label>
                  <Input
                    type="color"
                    {...register('gradient_end_color')}
                    className="w-16 h-10 p-1 bg-transparent border-white/20 cursor-pointer"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Voorbeeld</Label>
                <div
                  className="w-24 h-10 rounded-md border border-white/20"
                  style={getBackgroundStyle()}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Tekst kleur *</Label>
            <div className="flex items-center gap-4">
              <Input
                type="color"
                {...register('text_color')}
                className="w-16 h-10 p-1 bg-transparent border-white/20 cursor-pointer"
              />
              <span className="text-sm" style={{ color: textColor }}>
                Voorbeeld tekst
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Afbeeldingen */}
      <Card className="bg-white/5 border-white/10 min-h-[320px]">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_photo_url" className="text-white">
              Profielfoto (URL)
            </Label>
            <Input
              id="profile_photo_url"
              type="url"
              value={profilePhotoUrl || ''}
              onChange={(e) => setProfilePhotoUrl(e.target.value || null)}
              className="bg-white/10 border-white/20 text-white"
              placeholder="https://example.com/profielfoto.jpg"
            />
            {profilePhotoUrl && (
              <img 
                src={profilePhotoUrl} 
                alt="Preview" 
                className="w-12 h-12 rounded-full object-cover mt-2"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_logo_url" className="text-white">
              Bedrijfslogo (URL)
            </Label>
            <Input
              id="company_logo_url"
              type="url"
              value={companyLogoUrl || ''}
              onChange={(e) => setCompanyLogoUrl(e.target.value || null)}
              className="bg-white/10 border-white/20 text-white"
              placeholder="https://example.com/logo.png"
            />
            {companyLogoUrl && (
              <img 
                src={companyLogoUrl} 
                alt="Logo Preview" 
                className="h-10 object-contain mt-2"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          {photoError && (
            <p className="text-sm text-red-400">{photoError}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        variant="primaryCustom"
        disabled={isSending || !isValid}
        className="w-full"
      >
        {isSending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Genereren...
          </>
        ) : (
          'Handtekening genereren'
        )}
      </Button>
    </form>
  );
};
