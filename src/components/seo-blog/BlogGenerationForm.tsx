import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Check, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/components/seo/CompanySelector';
import { useBlogSettings } from '@/hooks/useBlogSettings';
import { useBlogSchedule } from '@/hooks/useBlogSchedule';
import { useBlogCategories } from '@/hooks/useBlogCategories';
import { ScheduleTrigger } from '@/components/seo/ScheduleTrigger';
import { CategoryManager } from '@/components/seo-blog/CategoryManager';
import { cn } from '@/lib/utils';

interface BlogGenerationFormProps {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  isAdmin: boolean;
  user: { id: string } | null;
  saveNotification: (message: string, status: 'success' | 'error') => Promise<void>;
}

const FIXED_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/491808f1-aaa2-44fb-88bf-50e0c16f17ac';

export const BlogGenerationForm = ({
  selectedCompany,
  setSelectedCompany,
  isAdmin,
  user,
  saveNotification,
}: BlogGenerationFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Form state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    bedrijfsomschrijving: '',
    schrijfstijl: '',
    aantal_woorden: [500, 1500] as [number, number],
    taal: '',
    image_type: 'ai_image' as 'ai_image' | 'google_drive',
    achtergrond_kleur: '',
    hoofdaccent_gradient_1: '',
    hoofdaccent_gradient_2: '',
    folder_id: '',
    used_folder_id: '',
    get_afbeelding_url: '',
    post_blog_url: '',
    status: 'draft',
    google_sheet_id: '',
    google_slides_id: '',
  });

  // Click outside handler to collapse expanded field
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedField && !(e.target as Element).closest('.expanded-field-container')) {
        setExpandedField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedField]);

  const { settings, isLoading: settingsLoading, saveSettings } = useBlogSettings(selectedCompany?.id || null);
  const { categories: blogCategories, isLoading: categoriesLoading, refetch: refetchCategories } = useBlogCategories(selectedCompany?.id || null);
  const { 
    schedule: blogSchedule, 
    isLoading: scheduleLoading, 
    isSaving: scheduleSaving, 
    updateSchedule, 
    getNextTriggerDisplay 
  } = useBlogSchedule(selectedCompany?.id || null);
  const isScheduleEnabled = blogSchedule?.enabled || false;

  // Helper to parse range string to array
  const parseRangeString = (rangeStr: string | null): [number, number] => {
    if (!rangeStr) return [500, 1500];
    const parts = rangeStr.split('-');
    if (parts.length === 2) {
      return [parseInt(parts[0]) || 500, parseInt(parts[1]) || 1500];
    }
    return [500, 1500];
  };

  // Helper to parse gradient string to two colors
  const parseGradientString = (gradientStr: string | null): [string, string] => {
    if (!gradientStr) return ['', ''];
    const parts = gradientStr.split(',');
    if (parts.length === 2) {
      return [parts[0].trim(), parts[1].trim()];
    }
    return [gradientStr, ''];
  };

  // Load settings into form when they change
  useEffect(() => {
    if (settings) {
      const [gradient1, gradient2] = parseGradientString(settings.hoofdaccent_gradient);
      setFormData({
        bedrijfsnaam: settings.bedrijfsnaam || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        schrijfstijl: settings.schrijfstijl || '',
        aantal_woorden: parseRangeString(settings.aantal_woorden),
        taal: settings.taal || '',
        image_type: (settings.image_type as 'ai_image' | 'google_drive') || 'ai_image',
        achtergrond_kleur: settings.achtergrond_kleur || '',
        hoofdaccent_gradient_1: gradient1,
        hoofdaccent_gradient_2: gradient2,
        folder_id: settings.folder_id || '',
        used_folder_id: settings.used_folder_id || '',
        get_afbeelding_url: settings.get_afbeelding_url || '',
        post_blog_url: settings.post_blog_url || '',
        status: settings.status || 'draft',
        google_sheet_id: settings.google_sheet_id || '',
        google_slides_id: settings.google_slides_id || '',
      });
    } else {
      setFormData({
        bedrijfsnaam: '',
        bedrijfsomschrijving: '',
        schrijfstijl: '',
        aantal_woorden: [500, 1500],
        taal: '',
        image_type: 'ai_image',
        achtergrond_kleur: '',
        hoofdaccent_gradient_1: '',
        hoofdaccent_gradient_2: '',
        folder_id: '',
        used_folder_id: '',
        get_afbeelding_url: '',
        post_blog_url: '',
        status: 'draft',
        google_sheet_id: '',
        google_slides_id: '',
      });
    }
    setEditingField(null);
  }, [settings]);

  const isFormComplete = () => {
    const requiredStringFields = [
      'bedrijfsnaam', 
      'bedrijfsomschrijving', 
      'schrijfstijl', 
      'taal',
      'status',
      'google_sheet_id',
      'google_slides_id'
    ];
    
    for (const field of requiredStringFields) {
      if (!formData[field as keyof typeof formData]) return false;
    }
    
    if (!formData.aantal_woorden || formData.aantal_woorden.length !== 2) return false;
    
    // Afbeelding velden afhankelijk van gekozen type
    if (formData.image_type === 'ai_image') {
      if (!formData.achtergrond_kleur || !formData.hoofdaccent_gradient_1 || !formData.hoofdaccent_gradient_2) {
        return false;
      }
    } else if (formData.image_type === 'google_drive') {
      if (!formData.folder_id) {
        return false;
      }
    }
    
    return true;
  };

  const handleSaveField = async (field: string) => {
    const updateData: Record<string, string | null> = {};
    
    if (field === 'aantal_woorden') {
      updateData[field] = `${formData.aantal_woorden[0]}-${formData.aantal_woorden[1]}`;
    } else if (field === 'hoofdaccent_gradient_1' || field === 'hoofdaccent_gradient_2') {
      updateData['hoofdaccent_gradient'] = `${formData.hoofdaccent_gradient_1},${formData.hoofdaccent_gradient_2}`;
    } else {
      updateData[field] = (formData[field as keyof typeof formData] as string) || null;
    }

    const result = await saveSettings(updateData);
    
    if (result.success) {
      if (field === 'bedrijfsnaam' && selectedCompany) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({ name: formData.bedrijfsnaam })
          .eq('id', selectedCompany.id);
        
        if (!companyError) {
          setSelectedCompany({ ...selectedCompany, name: formData.bedrijfsnaam });
        }
      }
      
      toast({
        title: "Opgeslagen",
        description: "Veld succesvol opgeslagen",
        duration: 3000,
      });
      setEditingField(null);
    } else {
      toast({
        title: "Fout",
        description: result.error || "Kon niet opslaan",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleCancelEdit = () => {
    if (settings) {
      const [gradient1, gradient2] = parseGradientString(settings.hoofdaccent_gradient);
      setFormData({
        bedrijfsnaam: settings.bedrijfsnaam || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        schrijfstijl: settings.schrijfstijl || '',
        aantal_woorden: parseRangeString(settings.aantal_woorden),
        taal: settings.taal || '',
        image_type: (settings.image_type as 'ai_image' | 'google_drive') || 'ai_image',
        achtergrond_kleur: settings.achtergrond_kleur || '',
        hoofdaccent_gradient_1: gradient1,
        hoofdaccent_gradient_2: gradient2,
        folder_id: settings.folder_id || '',
        used_folder_id: settings.used_folder_id || '',
        get_afbeelding_url: settings.get_afbeelding_url || '',
        post_blog_url: settings.post_blog_url || '',
        status: settings.status || 'draft',
        google_sheet_id: settings.google_sheet_id || '',
        google_slides_id: settings.google_slides_id || '',
      });
    }
    setEditingField(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartClick = async () => {
    if (!isFormComplete()) {
      toast({
        title: "Fout",
        description: "Vul eerst alle velden in",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bedrijfsnaam: formData.bedrijfsnaam,
        bedrijfsomschrijving: formData.bedrijfsomschrijving,
        schrijfstijl: formData.schrijfstijl,
        aantal_woorden: `${formData.aantal_woorden[0]}-${formData.aantal_woorden[1]}`,
        taal: formData.taal,
        // AI afbeelding velden - alleen vullen als ai_image geselecteerd
        achtergrond_kleur: formData.image_type === 'ai_image' ? formData.achtergrond_kleur : '',
        hoofdaccent_gradient: formData.image_type === 'ai_image' 
          ? `${formData.hoofdaccent_gradient_1},${formData.hoofdaccent_gradient_2}` 
          : '',
        // Google Drive velden - alleen vullen als google_drive geselecteerd
        folder_id: formData.image_type === 'google_drive' ? formData.folder_id : '',
        used_folder_id: formData.image_type === 'google_drive' ? formData.used_folder_id : '',
        get_afbeelding_url: formData.get_afbeelding_url,
        post_blog_url: formData.post_blog_url,
        status: formData.status,
        google_sheet_id: formData.google_sheet_id,
        google_slides_id: formData.google_slides_id,
        Category: blogCategories.reduce((acc, cat) => {
          acc[cat.label] = cat.value;
          return acc;
        }, {} as Record<string, string>),
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase.functions.invoke('trigger-blog-generation', {
        body: { 
          webhookUrl: FIXED_WEBHOOK_URL,
          authTokenSecretName: 'BLOG_WEBHOOK_AUTH_TOKEN',
          blogData: payload,
        },
      });

      if (error) throw error;

      if (data.success) {
        const message = data.message || "Blog generatie succesvol gestart";
        toast({
          title: "Succes!",
          description: message,
          duration: 10000,
        });
        await saveNotification(message, 'success');
      } else {
        const message = data.error || "Er is iets misgegaan";
        toast({
          title: "Fout",
          description: message,
          duration: 10000,
          variant: "destructive",
        });
        await saveNotification(message, 'error');
      }
    } catch (error) {
      console.error("Error calling Edge Function:", error);
      const errorMessage = "Er is iets misgegaan. Probeer het opnieuw.";
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
      await saveNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    label: string,
    field: keyof typeof formData,
    type: 'text' | 'textarea' | 'select' = 'text',
    options?: string[],
    adminOnly: boolean = false
  ) => {
    const isEditing = editingField === field;
    const isExpanded = expandedField === field;
    const value = formData[field] as string;
    const canEdit = adminOnly ? isAdmin : true;
    const isTextField = type === 'text' || type === 'textarea';

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-white/70 text-sm">{label}</Label>
          {adminOnly && (
            <span className="text-xs text-[#cfddd0]">(Admin)</span>
          )}
        </div>
        
        {isEditing && canEdit ? (
          <div className="flex gap-2 items-start">
            {type === 'textarea' ? (
              <Textarea
                value={value}
                onChange={handleTextareaChange}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] resize-none"
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
              />
            ) : type === 'select' ? (
              <Select
                value={value}
                onValueChange={(val) => setFormData(prev => ({ ...prev, [field]: val }))}
              >
                <SelectTrigger className="flex-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options?.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={value}
                onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            )}
            <Button
              size="icon"
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              onClick={() => handleSaveField(field)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleCancelEdit}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : isExpanded && isTextField ? (
          <div className="expanded-field-container relative">
            <div className="px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/10 text-white/80 whitespace-pre-wrap min-h-[40px]">
              {value || <span className="text-white/40 italic">Niet ingesteld</span>}
            </div>
            {canEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedField(null);
                  setEditingField(field);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2">
            {isTextField ? (
              <div 
                className={`flex-1 px-3 py-2 rounded-md text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-white/10 transition-colors ${
                  field === 'bedrijfsnaam' 
                    ? 'bg-white/5 border-2 border-transparent [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]' 
                    : 'bg-white/5 border border-white/10'
                }`}
                onClick={() => setExpandedField(field)}
              >
                {value || <span className="text-white/40 italic">Niet ingesteld</span>}
              </div>
            ) : type === 'select' ? (
              <Select
                value={value}
                onValueChange={(val) => {
                  setFormData(prev => ({ ...prev, [field]: val }));
                  if (selectedCompany) {
                    saveSettings({ [field]: val });
                  }
                }}
                disabled={!canEdit}
              >
                <SelectTrigger className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <SelectValue placeholder="Selecteer..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {options?.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div 
                className="flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setExpandedField(field)}
              >
                {value || <span className="text-white/40 italic">Niet ingesteld</span>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRangeField = () => {
    const [min, max] = formData.aantal_woorden;
    const canEdit = isAdmin;
    const isExpanded = expandedField === 'aantal_woorden';

    const handleSliderChange = (value: number[]) => {
      setFormData(prev => ({ ...prev, aantal_woorden: value as [number, number] }));
    };

    const handleSliderCommit = (value: number[]) => {
      if (selectedCompany && canEdit) {
        saveSettings({ aantal_woorden: `${value[0]}-${value[1]}` });
      }
    };

    const handleExpand = () => {
      if (canEdit) {
        setExpandedField('aantal_woorden');
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-white/90">Aantal woorden</Label>
        </div>
        
        {isExpanded ? (
          <div className="space-y-4 p-4 rounded-md bg-white/5 border border-white/10">
            <div className="px-2">
              <Slider
                value={formData.aantal_woorden}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                min={0}
                max={3000}
                step={50}
                className="w-full"
                disabled={!canEdit}
              />
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>0</span>
              <span>3000</span>
            </div>
            <div className="text-center text-white/80 font-medium">
              {min} - {max} woorden
            </div>
          </div>
        ) : (
          <div 
            className={`flex-1 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis ${canEdit ? 'cursor-pointer hover:bg-white/10' : ''} transition-colors`}
            onClick={handleExpand}
          >
            {min}-{max} woorden
          </div>
        )}
      </div>
    );
  };

  if (!selectedCompany) {
    return (
      <div className="text-white/50 text-center py-8">
        <p>Selecteer een bedrijf rechtsboven om te beginnen...</p>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-20 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white">Blog generatie instellingen</h2>
        <p className="text-sm text-white/50 mt-1">Configureer automatische blog creatie</p>
      </div>
      {renderField('Bedrijfsnaam', 'bedrijfsnaam')}
      {renderField('Bedrijfsomschrijving', 'bedrijfsomschrijving', 'textarea')}
      {renderField('Schrijfstijl', 'schrijfstijl', 'textarea')}
      {renderRangeField()}
      {renderField('Taal', 'taal', 'select', ['Nederlands', 'Engels', 'Duits', 'Frans'])}
      
      {/* Afbeelding section - contained in visual card for clarity */}
      <div className="pt-6 border-t border-white/10">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-lg font-semibold text-white">Afbeelding</h3>
          
          {/* Toggle knoppen */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                handleInputChange('image_type', 'ai_image');
                await saveSettings({ image_type: 'ai_image' });
              }}
              className={cn(
                "flex-1 transition-all duration-200",
                formData.image_type === 'ai_image' 
                  ? "bg-accent text-[#002C1F] border-accent hover:bg-accent/90" 
                  : "bg-transparent border-white/20 text-white/70 hover:bg-white/5"
              )}
            >
              AI afbeelding
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                handleInputChange('image_type', 'google_drive');
                await saveSettings({ image_type: 'google_drive' });
              }}
              className={cn(
                "flex-1 transition-all duration-200",
                formData.image_type === 'google_drive' 
                  ? "bg-accent text-[#002C1F] border-accent hover:bg-accent/90" 
                  : "bg-transparent border-white/20 text-white/70 hover:bg-white/5"
              )}
            >
              Foto Google Drive
            </Button>
          </div>
          
          {/* AI Afbeelding velden */}
          {formData.image_type === 'ai_image' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  {renderField('Achtergrond kleur', 'achtergrond_kleur', 'text', undefined, false)}
                </div>
                <div 
                  className="w-10 h-10 rounded-md border border-white/20 shrink-0"
                  style={{ backgroundColor: formData.achtergrond_kleur || 'transparent' }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Hoofdaccent gradient</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      {renderField('Kleur 1', 'hoofdaccent_gradient_1', 'text', undefined, false)}
                    </div>
                    <div 
                      className="w-10 h-10 rounded-md border border-white/20 shrink-0"
                      style={{ backgroundColor: formData.hoofdaccent_gradient_1 || 'transparent' }}
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      {renderField('Kleur 2', 'hoofdaccent_gradient_2', 'text', undefined, false)}
                    </div>
                    <div 
                      className="w-10 h-10 rounded-md border border-white/20 shrink-0"
                      style={{ backgroundColor: formData.hoofdaccent_gradient_2 || 'transparent' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Google Drive velden */}
          {formData.image_type === 'google_drive' && (
            <div className="animate-in slide-in-from-top-2 duration-200 space-y-4">
              {renderField('Foto map : Folder ID', 'folder_id', 'text', undefined, false)}
              {renderField('Gebruikte foto map : Folder ID', 'used_folder_id', 'text', undefined, false)}
            </div>
          )}
        </div>
      </div>
      
      {/* Status sectie - met eigen header */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <h3 className="text-lg font-semibold text-white">Publicatie</h3>
        {renderField('Status', 'status', 'select', ['draft', 'publish'])}
      </div>
      
      {/* Google Document IDs - Verplicht voor alle gebruikers */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <h3 className="text-lg font-semibold text-white">Google Documenten</h3>
        {renderField('Spreadsheet ID', 'google_sheet_id', 'text', undefined, false)}
        {renderField('Grid ID', 'google_slides_id', 'text', undefined, false)}
      </div>
      
      {/* Admin-only fields - Collapsible */}
      {isAdmin && (
        <div className="pt-6 border-t border-white/10 space-y-6">
          <p className="text-sm text-yellow-400/80 font-medium">Admin instellingen</p>
            {renderField('POST afbeelding URL', 'get_afbeelding_url', 'text', undefined, true)}
            {renderField('POST blog URL', 'post_blog_url', 'text', undefined, true)}
            
            <CategoryManager 
              companyId={selectedCompany?.id || null}
              isAdmin={isAdmin}
              onCategoryChange={refetchCategories}
            />
        </div>
      )}

      <ScheduleTrigger
        companyId={selectedCompany?.id || null}
        isAdmin={isAdmin}
        schedule={blogSchedule}
        isLoading={scheduleLoading}
        isSaving={scheduleSaving}
        updateSchedule={updateSchedule}
        getNextTriggerDisplay={getNextTriggerDisplay}
      />

      <div className="pt-6">
        {isSubmitting && (
          <p className="text-center text-white/80 text-sm mb-4">
            Dit kan enkele minuten duren, even geduld...
          </p>
        )}
        
        <Button 
          size="lg" 
          variant="primaryCustom"
          className="w-full py-6 text-lg h-auto"
          onClick={handleStartClick}
          disabled={isSubmitting || !isFormComplete() || isScheduleEnabled}
        >
          {isScheduleEnabled ? (
            <>
              <Clock className="h-5 w-5 mr-2" />
              Automatische trigger actief
            </>
          ) : isSubmitting ? 'Bezig...' : (
            <>
              Start <span className="text-sm font-normal opacity-70 ml-2">- {selectedCompany.name}</span>
            </>
          )}
        </Button>
        
        {!isFormComplete() && !isScheduleEnabled && (
          <p className="text-center text-white/50 text-sm mt-2">
            Alle velden moeten ingevuld zijn om te starten
          </p>
        )}
      </div>
    </div>
  );
};
