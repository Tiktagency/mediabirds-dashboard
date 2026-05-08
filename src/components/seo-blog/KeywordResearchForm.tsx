import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Check, XCircle, Sparkles, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/components/seo/CompanySelector';
import { useSeoSettings } from '@/hooks/useSeoSettings';
import { useSeoSchedule } from '@/hooks/useSeoSchedule';
import { ScheduleTrigger } from '@/components/seo/ScheduleTrigger';

interface KeywordResearchFormProps {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  isAdmin: boolean;
  user: { id: string } | null;
  saveNotification: (message: string, status: 'success' | 'error') => Promise<void>;
}

const FIXED_SEO_WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/b932bfda-0727-4ff4-b311-b234be0ff953';

export const KeywordResearchForm = ({
  selectedCompany,
  setSelectedCompany,
  isAdmin,
  user,
  saveNotification,
}: KeywordResearchFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    blog_onderwerp: '',
    doelgroep_intentie: '',
    bedrijfsomschrijving: '',
    extra_instructies: '',
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

  const { settings, isLoading: settingsLoading, saveSettings } = useSeoSettings(selectedCompany?.id || null);
  const { 
    schedule: seoSchedule, 
    isLoading: scheduleLoading, 
    isSaving: scheduleSaving, 
    updateSchedule, 
    getNextTriggerDisplay 
  } = useSeoSchedule(selectedCompany?.id || null);
  const isScheduleEnabled = seoSchedule?.enabled || false;

  // Load settings into form when they change
  useEffect(() => {
    if (settings) {
      setFormData({
        bedrijfsnaam: selectedCompany?.name || '',
        blog_onderwerp: settings.blog_onderwerp || '',
        doelgroep_intentie: settings.doelgroep_intentie || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        extra_instructies: settings.extra_instructies || '',
        google_sheet_id: settings.google_sheet_id || '',
        google_slides_id: settings.google_slides_id || '',
      });
    } else {
      setFormData({
        bedrijfsnaam: selectedCompany?.name || '',
        blog_onderwerp: '',
        doelgroep_intentie: '',
        bedrijfsomschrijving: '',
        extra_instructies: '',
        google_sheet_id: '',
        google_slides_id: '',
      });
    }
    setEditingField(null);
  }, [settings, selectedCompany]);

  const isFormComplete = () => {
    return (
      formData.blog_onderwerp.trim() !== '' &&
      formData.doelgroep_intentie.trim() !== '' &&
      formData.bedrijfsomschrijving.trim() !== ''
    );
  };

  const handleSaveField = async (field: string) => {
    if (field === 'bedrijfsnaam' && selectedCompany) {
      const { error: companyError } = await supabase
        .from('companies')
        .update({ name: formData.bedrijfsnaam })
        .eq('id', selectedCompany.id);
      
      if (!companyError) {
        setSelectedCompany({ ...selectedCompany, name: formData.bedrijfsnaam });
        toast({
          title: "Opgeslagen",
          description: "Bedrijfsnaam succesvol opgeslagen",
          duration: 3000,
        });
        setEditingField(null);
      } else {
        toast({
          title: "Fout",
          description: "Kon bedrijfsnaam niet opslaan",
          variant: "destructive",
          duration: 5000,
        });
      }
      return;
    }

    const updateData: Record<string, string | null> = {
      [field]: formData[field as keyof typeof formData] || null,
    };

    const result = await saveSettings(updateData);
    
    if (result.success) {
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
      setFormData({
        bedrijfsnaam: selectedCompany?.name || '',
        blog_onderwerp: settings.blog_onderwerp || '',
        doelgroep_intentie: settings.doelgroep_intentie || '',
        bedrijfsomschrijving: settings.bedrijfsomschrijving || '',
        extra_instructies: settings.extra_instructies || '',
        google_sheet_id: settings.google_sheet_id || '',
        google_slides_id: settings.google_slides_id || '',
      });
    }
    setEditingField(null);
  };

  const handleStartResearch = async () => {
    if (!isFormComplete() || !selectedCompany) {
      toast({
        title: "Fout",
        description: "Vul eerst alle verplichte velden in",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('trigger-seo-webhook', {
        body: {
          webhookUrl: FIXED_SEO_WEBHOOK_URL,
          authTokenSecretName: 'SEO_WEBHOOK_AUTH_TOKEN',
          action: 'research',
          formData: {
            bedrijfsnaam: formData.bedrijfsnaam,
            blogTopic: formData.blog_onderwerp,
            audienceIntent: formData.doelgroep_intentie,
            businessDescription: formData.bedrijfsomschrijving,
            extraInstructions: formData.extra_instructies,
            googleSheetId: formData.google_sheet_id,
            googleSlidesId: formData.google_slides_id,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        if (data.hasMessage && data.message) {
          toast({
            title: 'SEO Onderzoek voltooid',
            description: data.message,
            duration: 7000,
          });
        }
      } else {
        throw new Error(data.error || 'Webhook request failed');
      }
    } catch (error) {
      console.error('Error submitting SEO research:', error);
      toast({
        title: 'Er is iets misgegaan',
        description: 'Het SEO onderzoek kon niet worden gestart. Probeer het opnieuw.',
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (
    label: string,
    field: keyof typeof formData,
    hasGradientBorder: boolean = false
  ) => {
    const isEditing = editingField === field;
    const isExpanded = expandedField === field;
    const value = formData[field];
    const canEdit = isAdmin;

    return (
      <div className="space-y-2">
        <Label className="text-white/70 text-sm">{label}</Label>
        
        {isEditing && canEdit ? (
          <div className="flex gap-2 items-center">
            <Input
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
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
        ) : isExpanded ? (
          <div className="expanded-field-container relative">
            <div className={`px-3 py-2 pr-12 rounded-md text-white/80 min-h-[40px] ${
              hasGradientBorder 
                ? 'bg-white/5 border-2 border-transparent [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]' 
                : 'bg-white/5 border border-white/10'
            }`}>
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
          <div 
            className={`px-3 py-2 rounded-md text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-white/10 transition-colors ${
              hasGradientBorder 
                ? 'bg-white/5 border-2 border-transparent [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]' 
                : 'bg-white/5 border border-white/10'
            }`}
            onClick={() => setExpandedField(field)}
          >
            {value || <span className="text-white/40 italic">Niet ingesteld</span>}
          </div>
        )}
      </div>
    );
  };

  const renderTextField = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    optional: boolean = false
  ) => {
    const isEditing = editingField === field;
    const isExpanded = expandedField === field;
    const value = formData[field];
    const canEdit = isAdmin;

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-white/70 text-sm">{label}</Label>
          {optional && (
            <span className="text-xs text-white/40">(Optioneel)</span>
          )}
        </div>
        
        {isEditing && canEdit ? (
          <div className="flex gap-2 items-start">
            <Textarea
              value={value}
              onChange={handleTextareaChange}
              placeholder={placeholder}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] resize-none"
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }
              }}
            />
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
        ) : isExpanded ? (
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
          <div 
            className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setExpandedField(field)}
          >
            {value || <span className="text-white/40 italic">Niet ingesteld</span>}
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
          <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
          <div className="h-10 bg-white/10 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderInputField('Bedrijf', 'bedrijfsnaam', true)}
      
      {renderTextField(
        'Blog Onderwerp',
        'blog_onderwerp',
        'Bijv. duurzame energie, digitale marketing, gezonde voeding...'
      )}
      
      {renderTextField(
        'Doelgroep & Intentie',
        'doelgroep_intentie',
        'Bijv. MKB-ondernemers die hun online zichtbaarheid willen vergroten...'
      )}
      
      {renderTextField(
        'Bedrijfsomschrijving',
        'bedrijfsomschrijving',
        'Bijv. Wij zijn een full-service marketing bureau gespecialiseerd in...'
      )}
      
      {renderTextField(
        'Extra Instructies',
        'extra_instructies',
        'Bijv. Focus op Nederlandse markt, vermijd technisch jargon...',
        true
      )}

      {/* Admin instellingen */}
      {isAdmin && (
        <div className="pt-6 border-t border-white/10 space-y-6">
          <p className="text-sm text-yellow-400/80">Admin instellingen</p>
          {renderInputField('Google Sheet Document ID', 'google_sheet_id')}
          {renderInputField('Google Slides ID', 'google_slides_id')}
        </div>
      )}

      <ScheduleTrigger
        companyId={selectedCompany?.id || null}
        isAdmin={isAdmin}
        schedule={seoSchedule}
        isLoading={scheduleLoading}
        isSaving={scheduleSaving}
        updateSchedule={updateSchedule}
        getNextTriggerDisplay={getNextTriggerDisplay}
      />

      <div className="pt-6 border-t border-white/10">
        <Button
          onClick={handleStartResearch}
          disabled={isSubmitting || !isFormComplete() || isScheduleEnabled}
          className="w-full seo-button-primary gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Bezig...
            </>
          ) : isScheduleEnabled ? (
            <>
              <Clock className="w-4 h-4" />
              Automatische trigger actief
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Start SEO onderzoek - {selectedCompany.name}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
