import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useEmailSignatureSettings, SocialLink } from '@/hooks/useEmailSignatureSettings';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
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

export const EmailSignatureForm = () => {
  const { settings, isLoading, isSaving, saveSettings, uploadProfilePhoto } = useEmailSignatureSettings();
  const [socials, setSocials] = useState<SocialLink[]>(settings?.socials || []);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(settings?.profile_photo_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: settings?.first_name || '',
      last_name: settings?.last_name || '',
      email: settings?.email || '',
      job_title: settings?.job_title || '',
      website: settings?.website || '',
      background_type: settings?.background_type || 'solid',
      background_color: settings?.background_color || '#1a1a2e',
      gradient_end_color: settings?.gradient_end_color || '#16213e',
      text_color: settings?.text_color || '#ffffff',
    },
  });

  const backgroundType = watch('background_type');
  const backgroundColor = watch('background_color');
  const gradientEndColor = watch('gradient_end_color');
  const textColor = watch('text_color');

  // Update form when settings load
  useState(() => {
    if (settings) {
      setValue('first_name', settings.first_name);
      setValue('last_name', settings.last_name);
      setValue('email', settings.email);
      setValue('job_title', settings.job_title);
      setValue('website', settings.website || '');
      setValue('background_type', settings.background_type);
      setValue('background_color', settings.background_color);
      setValue('gradient_end_color', settings.gradient_end_color || '#16213e');
      setValue('text_color', settings.text_color);
      setSocials(settings.socials || []);
      setProfilePhotoUrl(settings.profile_photo_url);
    }
  });

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
    const url = await uploadProfilePhoto(file);
    if (url) {
      setProfilePhotoUrl(url);
    }
    setIsUploading(false);
  };

  const onSubmit = async (data: FormData) => {
    await saveSettings({
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
    });
  };

  const getBackgroundStyle = () => {
    if (backgroundType === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${backgroundColor}, ${gradientEndColor})`,
      };
    }
    return { backgroundColor };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl space-y-6">
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

            <div className="flex items-center gap-4">
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
              <div
                className="w-24 h-10 rounded-md border border-white/20"
                style={getBackgroundStyle()}
              />
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
            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                <p className="text-white/50">Uploaden...</p>
              </div>
            ) : profilePhotoUrl ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={profilePhotoUrl}
                  alt="Profielfoto"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <p className="text-white/50 text-sm">Klik om te wijzigen</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white/50" />
                <p className="text-white/50">Sleep of klik om te uploaden</p>
                <p className="text-white/30 text-xs">Max 5MB, JPG/PNG/WebP</p>
              </div>
            )}
          </div>
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
            Opslaan...
          </>
        ) : (
          'Handtekening Opslaan'
        )}
      </Button>
    </form>
  );
};
