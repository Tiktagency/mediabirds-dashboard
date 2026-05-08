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
import { Plus, X, Upload, Loader2 } from 'lucide-react';
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
  website: z.string().url('Ongeldige URL').optional().or(z.literal('')),
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
  onSave: (settings: Omit<EmailSignatureSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUploadPhoto: (file: File) => Promise<string | null>;
}

export const EmailSignatureForm = ({
  selectedSignature,
  isSaving,
  onSave,
  onUploadPhoto,
}: EmailSignatureFormProps) => {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Mijn Handtekening',
      first_name: '',
      last_name: '',
      email: '',
      job_title: '',
      website: '',
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

  // Update form when selected signature changes
  useEffect(() => {
    if (selectedSignature) {
      reset({
        name: selectedSignature.name,
        first_name: selectedSignature.first_name,
        last_name: selectedSignature.last_name,
        email: selectedSignature.email,
        job_title: selectedSignature.job_title,
        website: selectedSignature.website || '',
        background_type: selectedSignature.background_type,
        background_color: selectedSignature.background_color,
        gradient_end_color: selectedSignature.gradient_end_color || '#16213e',
        text_color: selectedSignature.text_color,
      });
      setSocials(selectedSignature.socials || []);
      setProfilePhotoUrl(selectedSignature.profile_photo_url);
    } else {
      // Reset to defaults for new signature
      reset({
        name: 'Mijn Handtekening',
        first_name: '',
        last_name: '',
        email: '',
        job_title: '',
        website: '',
        background_type: 'solid',
        background_color: '#1a1a2e',
        gradient_end_color: '#16213e',
        text_color: '#ffffff',
      });
      setSocials([]);
      setProfilePhotoUrl(null);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await onUploadPhoto(file);
    if (url) {
      setProfilePhotoUrl(url);
    }
    setIsUploading(false);
  };

  const onSubmit = async (data: FormData) => {
    // Valideer foto URL indien aanwezig
    if (profilePhotoUrl) {
      setPhotoError(null);
      try {
        const img = new Image();
        img.src = profilePhotoUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(() => reject(new Error('timeout')), 5000);
        });
      } catch {
        setPhotoError('De profielfoto link is niet geldig of niet openbaar toegankelijk');
        return;
      }
    }

    const signatureData = {
      name: data.name,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      job_title: data.job_title,
      website: data.website || null,
      background_type: data.background_type,
      background_color: data.background_color,
      gradient_end_color: data.background_type === 'gradient' ? data.gradient_end_color || null : null,
      text_color: data.text_color,
      socials,
      profile_photo_url: profilePhotoUrl,
    };

    // Stuur naar webhook
    try {
      const webhookResponse = await fetch(
        'https://tikt.app.n8n.cloud/webhook-test/0d19dda2-8df2-4952-a93a-5c9c49b4edd8',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signatureData),
        }
      );
      
      if (!webhookResponse.ok) {
        throw new Error('Webhook request failed');
      }
      
      const webhookData = await webhookResponse.text();
      console.log('Webhook response:', webhookData);
    } catch (error) {
      console.error('Error calling webhook:', error);
    }

    // Sla ook op in database
    await onSave(signatureData);
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

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-white/10 border-white/20 text-white"
              placeholder="jan@bedrijf.nl"
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

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

      {/* Profile Photo */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6 space-y-4">
          <Label className="text-white">Profielfoto *</Label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-white/40 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                <p className="text-white/50 text-sm">Uploaden...</p>
              </div>
            ) : profilePhotoUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={profilePhotoUrl}
                  alt="Profielfoto"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <p className="text-white/50 text-xs">Klik om te wijzigen</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-6 h-6 text-white/50" />
                <p className="text-white/50 text-sm">Klik om te uploaden</p>
                <p className="text-white/30 text-xs">Max 5MB, JPG/PNG/WebP</p>
              </div>
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
        disabled={isSaving}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isSaving ? (
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
