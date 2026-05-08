import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Sparkles, Clock, Copy, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/components/seo/CompanySelector';
import { useSeoSettings } from '@/hooks/useSeoSettings';
import { useSeoSchedule } from '@/hooks/useSeoSchedule';
import { syncGoogleDocIds } from '@/hooks/useGoogleDocSync';
import { ScheduleTrigger } from '@/components/seo/ScheduleTrigger';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    hoofd_google_sheet_id: '',
    hoofd_google_slides_id: '',
    nieuw_google_sheet_id: '',
    nieuw_google_slides_id: '',
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
        hoofd_google_sheet_id: settings.hoofd_google_sheet_id || '',
        hoofd_google_slides_id: settings.hoofd_google_slides_id || '',
        nieuw_google_sheet_id: settings.nieuw_google_sheet_id || '',
        nieuw_google_slides_id: settings.nieuw_google_slides_id || '',
      });
    } else {
      setFormData({
        bedrijfsnaam: selectedCompany?.name || '',
        blog_onderwerp: '',
        doelgroep_intentie: '',
        bedrijfsomschrijving: '',
        extra_instructies: '',
        hoofd_google_sheet_id: '',
        hoofd_google_slides_id: '',
        nieuw_google_sheet_id: '',
        nieuw_google_slides_id: '',
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
    // Check if value actually changed
    if (field === 'bedrijfsnaam') {
      const originalValue = selectedCompany?.name || '';
      if (formData.bedrijfsnaam === originalValue) {
        setEditingField(null);
        return;
      }
    } else {
      const originalValue = settings?.[field as keyof typeof settings] || '';
      const currentValue = formData[field as keyof typeof formData] || '';
      if (currentValue === originalValue) {
        setEditingField(null);
        return;
      }
    }

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
      // Sync Google Doc IDs to blog_settings
      if (selectedCompany && (field === 'hoofd_google_sheet_id' || field === 'nieuw_google_sheet_id')) {
        const val = formData[field as keyof typeof formData] || null;
        syncGoogleDocIds(selectedCompany.id, 'seo_settings', 'sheet_id', val);
      } else if (selectedCompany && field === 'hoofd_google_slides_id') {
        const val = formData[field as keyof typeof formData] || null;
        syncGoogleDocIds(selectedCompany.id, 'seo_settings', 'slides_id', val);
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
            hoofdGoogleSheetId: formData.hoofd_google_sheet_id,
            hoofdGoogleSlidesId: formData.hoofd_google_slides_id,
            nieuwGoogleSheetId: formData.nieuw_google_sheet_id,
            nieuwGoogleSlidesId: formData.nieuw_google_slides_id,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        const message = data.message || "SEO onderzoek succesvol gestart";
        toast({
          title: 'SEO Onderzoek voltooid',
          description: message,
          duration: 7000,
        });
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

  const handleCopyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Gekopieerd",
      description: "ID gekopieerd naar klembord",
      duration: 2000,
    });
  };

  const handleClearField = async (field: string) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    const result = await saveSettings({ [field]: null });
    if (result.success) {
      // Sync cleared Google Doc IDs
      if (selectedCompany && (field === 'hoofd_google_sheet_id' || field === 'nieuw_google_sheet_id')) {
        syncGoogleDocIds(selectedCompany.id, 'seo_settings', 'sheet_id', null);
      } else if (selectedCompany && field === 'hoofd_google_slides_id') {
        syncGoogleDocIds(selectedCompany.id, 'seo_settings', 'slides_id', null);
      }
      toast({
        title: "Verwijderd",
        description: "Veld is leeggemaakt",
        duration: 2000,
      });
    }
  };

  const renderInputField = (
    label: string,
    field: keyof typeof formData,
    hasGradientBorder: boolean = false
  ) => {
    const isEditing = editingField === field;
    const value = formData[field];
    const canEdit = isAdmin;
    const isGoogleIdField = field.includes('google');

    const borderStyles = hasGradientBorder 
      ? 'bg-white/5 border-2 border-transparent [background:linear-gradient(hsl(var(--background)),hsl(var(--background)))_padding-box,linear-gradient(135deg,#8b5cf6,#ec4899,#8b5cf6)_border-box]' 
      : 'bg-white/5 border border-white/10';

    return (
      <div className="space-y-2">
        <Label className="text-white/70 text-sm">{label}</Label>
        
        {isEditing && canEdit ? (
          <Input
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            onBlur={() => handleSaveField(field)}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            {/* Tekst container met tooltip voor Google ID velden */}
            {isGoogleIdField && value ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`flex-1 px-3 py-2 rounded-md text-white/80 h-[40px] overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer hover:bg-white/10 transition-colors ${borderStyles}`}
                    onClick={() => canEdit && setEditingField(field)}
                  >
                    {value}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[400px] break-all bg-background border-white/20">
                  <p className="font-mono text-xs">{value}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div 
                className={`flex-1 flex items-center justify-between px-3 py-2 rounded-md text-white/80 h-[40px] overflow-hidden cursor-pointer hover:bg-white/10 transition-colors ${borderStyles}`}
                onClick={() => canEdit && setEditingField(field)}
              >
                <span className="truncate">{value || <span className="text-white/40 italic">Niet ingesteld</span>}</span>
                {!isGoogleIdField && <Pencil className="h-3.5 w-3.5 text-white/40 shrink-0 ml-2" />}
              </div>
            )}
            
            {/* Iconen container - alleen voor Google ID velden met waarde */}
            {canEdit && isGoogleIdField && value && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                      onClick={() => handleCopyToClipboard(value)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Kopiëren</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                      onClick={() => setEditingField(field)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Bewerken</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleClearField(field)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Verwijderen</TooltipContent>
                </Tooltip>
              </div>
            )}
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
          <Textarea
            value={value}
            onChange={handleTextareaChange}
            placeholder={placeholder}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] resize-none"
            onBlur={() => handleSaveField(field)}
            autoFocus
            ref={(el) => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
          />
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
            className="flex items-center justify-between px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 h-[40px] overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setExpandedField(field)}
          >
            <span className="truncate">{value || <span className="text-white/40 italic">Niet ingesteld</span>}</span>
            <Pencil className="h-3.5 w-3.5 text-white/40 shrink-0 ml-2" />
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
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white">Zoekwoord onderzoek instellingen</h2>
        <p className="text-sm text-white/50 mt-1">Configureer je AI-gestuurd SEO onderzoek</p>
      </div>
      {renderInputField('Bedrijfsnaam', 'bedrijfsnaam', true)}
      
      {renderTextField(
        'Doel/kern',
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
          <p className="text-sm text-yellow-400/80 font-medium">Admin instellingen</p>
            {/* Hoofd zoekwoorden sectie */}
            <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <h4 className="text-sm font-semibold text-white/90">Hoofd zoekwoorden</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>{renderInputField('Spreadsheet ID', 'hoofd_google_sheet_id')}</div>
                <div>{renderInputField('Grid ID', 'hoofd_google_slides_id')}</div>
              </div>
            </div>
            
            {/* Nieuwe zoekwoorden sectie */}
            <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">🆕</span>
                <h4 className="text-sm font-semibold text-white/90">Nieuwe zoekwoorden</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>{renderInputField('Spreadsheet ID', 'nieuw_google_sheet_id')}</div>
                <div>{renderInputField('Grid ID', 'nieuw_google_slides_id')}</div>
              </div>
            </div>
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
          variant="primaryCustom"
          className="w-full gap-2"
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
