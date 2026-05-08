import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LandingCompanySelector from '@/components/landing/LandingCompanySelector';
import type { LandingCompany } from '@/components/landing/LandingCompanySelector';
import AltTextAnimation from '@/components/wordpress-alt-text/AltTextAnimation';
import { ScheduleTrigger } from '@/components/seo/ScheduleTrigger';
import { useLandingSchedule } from '@/hooks/useLandingSchedule';
import { Pencil, Loader2, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Landingspagina = () => {
  const { isLoading, isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<LandingCompany | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSheetId, setEditSheetId] = useState('');
  const [editGridId, setEditGridId] = useState('');
  const [editPageUrl, setEditPageUrl] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { schedule, isLoading: scheduleLoading, isSaving, updateSchedule, getNextTriggerDisplay } = useLandingSchedule(selectedCompany?.id);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    setEditName(selectedCompany?.name || '');
    setEditDomain(selectedCompany?.domain || '');
    setEditPassword(selectedCompany?.app_password || '');
    setEditSheetId(selectedCompany?.spreadsheet_id || '');
    setEditGridId(selectedCompany?.grid_id || '');
    setEditPageUrl((selectedCompany as any)?.page_url || '');
  }, [selectedCompany]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedField && !(e.target as Element).closest('.expanded-field-container')) {
        setExpandedField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedField]);

  const handleFieldSave = async (field: 'name' | 'domain' | 'app_password' | 'spreadsheet_id' | 'grid_id' | 'page_url', value: string) => {
    if (!selectedCompany) return;
    const currentValue = field === 'name' ? selectedCompany.name 
      : field === 'domain' ? (selectedCompany.domain || '') 
      : field === 'app_password' ? (selectedCompany.app_password || '')
      : field === 'spreadsheet_id' ? (selectedCompany.spreadsheet_id || '')
      : field === 'grid_id' ? (selectedCompany.grid_id || '')
      : ((selectedCompany as any).page_url || '');
    if (value === currentValue) return;

    const { error } = await supabase
      .from('landing_companies')
      .update({ [field]: value || null })
      .eq('id', selectedCompany.id);

    if (!error) {
      setSelectedCompany(prev => prev ? { ...prev, [field]: value || null } : null);
      toast({ title: 'Opgeslagen', description: 'Wijzigingen zijn opgeslagen' });
    } else {
      toast({ title: 'Fout', description: 'Kon niet opslaan', variant: 'destructive' });
    }
  };

  const handleStart = async () => {
    if (!selectedCompany) return;
    if (!editName.trim() || !editDomain.trim() || !editPassword.trim() || !editSheetId.trim() || !editGridId.trim() || !editPageUrl.trim()) {
      toast({ title: 'Vul alle velden in', description: 'Alle velden zijn verplicht', variant: 'destructive' });
      return;
    }
    setIsStarting(true);
    setIsAnimating(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-landing-webhook', {
        body: {
          bedrijfsnaam: selectedCompany.name,
          domain: selectedCompany.domain,
          spreadsheet_id: editSheetId,
          grid_id: editGridId,
          page_url: editPageUrl || null,
        },
      });
      if (error) throw error;

      let message = 'Landingspagina verwerking is gestart';
      try {
        const parsed = JSON.parse(data?.data || '{}');
        message = parsed.message || parsed.Output || data?.data || message;
      } catch {
        message = data?.data || message;
      }

      toast({ title: 'Resultaat', description: message, duration: 5000 });
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast({ title: 'Fout', description: 'Er ging iets mis bij het starten', variant: 'destructive' });
    } finally {
      setIsStarting(false);
      setIsAnimating(false);
    }
  };

  const renderEditableField = (
    fieldId: string, value: string, onChange: (val: string) => void, onBlur: () => void, placeholder: string
  ) => {
    const isEditing = editingField === fieldId;
    const isExpanded = expandedField === fieldId;

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    };

    if (isEditing) {
      return (
        <Textarea
          value={value}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className="bg-white/10 border-white/10 text-white placeholder:text-white/50 min-h-[80px] resize-none"
          onBlur={() => { setEditingField(null); onBlur(); }}
          autoFocus
          ref={(el) => {
            if (el) {
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }
          }}
        />
      );
    }
    if (isExpanded) {
      return (
        <div className="expanded-field-container relative">
          <div className="px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/10 text-white/80 whitespace-pre-wrap min-h-[40px]">
            {value || <span className="text-white/40 italic">Niet ingesteld</span>}
          </div>
          <Button
            size="icon" variant="ghost"
            className="absolute top-1 right-1 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); setExpandedField(null); setEditingField(fieldId); }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    return (
      <div
        onClick={() => setExpandedField(fieldId)}
        className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 h-[40px] overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
      >
        <span className="truncate">{value || <span className="text-white/40 italic">Niet ingesteld</span>}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-white/10">
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Dashboard
          </Button>
        </Link>
        <div className="mr-2">
          <LandingCompanySelector onSelect={setSelectedCompany} selectedCompany={selectedCompany} />
        </div>
      </div>

      <div className="hero-gradient min-h-screen w-full flex flex-col items-center justify-start pt-24 px-4 sm:pt-28 sm:px-6 pb-8">
        <h1 className="hero-title text-2xl sm:text-4xl text-foreground mb-2 fade-in-up">Landingspagina</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-center max-w-xl mb-3">
          Genereer automatisch landingspagina's voor al je websites! Koppel je Google Sheet, selecteer een bedrijf en laat de magie beginnen.
        </p>

        {selectedCompany ? (
          <>
          {/* Per-company Schedule Trigger */}
          <div className="w-full max-w-2xl mb-3">
            <ScheduleTrigger
              companyId={selectedCompany.id}
              isAdmin={isAdmin}
              schedule={schedule as any}
              isLoading={scheduleLoading}
              isSaving={isSaving}
              updateSchedule={updateSchedule as any}
              getNextTriggerDisplay={getNextTriggerDisplay}
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 max-w-2xl w-full items-stretch">
            {/* Left: Company fields + Google Sheets + Start button */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <Label className="text-white/70">Bedrijfsnaam:</Label>
                  {renderEditableField('name', editName, setEditName, () => handleFieldSave('name', editName), 'Voer bedrijfsnaam in...')}
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Domeinnaam:</Label>
                  {renderEditableField('domain', editDomain, setEditDomain, () => handleFieldSave('domain', editDomain), 'Voer domeinnaam in...')}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-white/70">Applicatie wachtwoord:</Label>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-white/40 hover:text-white/70 cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[9999] max-w-xs bg-card border-border text-white p-4">
                          <p className="font-semibold mb-2 text-sm">Hoe kom je aan een applicatie wachtwoord?</p>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-white/80">
                            <li>Ga naar de achterkant van je <strong className="text-white">WordPress</strong> website</li>
                            <li>Navigeer naar <strong className="text-white">Gebruikers</strong> → <strong className="text-white">Mediabirds</strong></li>
                            <li>Scroll naar <strong className="text-white">Applicatie wachtwoorden</strong></li>
                            <li>Gebruik als naam: <strong className="text-white">n8n alt tekst</strong></li>
                            <li>Klik op <strong className="text-white">"Applicatie wachtwoord toevoegen"</strong></li>
                          </ol>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    {editingField === 'app_password' ? (
                      <Input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        onBlur={() => { setEditingField(null); handleFieldSave('app_password', editPassword); }}
                        placeholder="abcd efgh ijkl 1234"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                        autoFocus
                      />
                    ) : expandedField === 'app_password' ? (
                      <div className="expanded-field-container relative">
                        <div className="px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/10 text-white/80 whitespace-pre-wrap min-h-[40px]">
                          {editPassword ? '•'.repeat(editPassword.length) : <span className="text-white/40 italic">Niet ingesteld</span>}
                        </div>
                        <Button
                          size="icon" variant="ghost"
                          className="absolute top-1 right-1 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                          onClick={(e) => { e.stopPropagation(); setExpandedField(null); setEditingField('app_password'); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setExpandedField('app_password')}
                        className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 h-[40px] overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <span className="truncate">{editPassword ? '•'.repeat(editPassword.length) : <span className="text-white/40 italic">Niet ingesteld</span>}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Sheets section */}
                <div className="pt-2 border-t border-white/10">
                  <Label className="text-white/50 text-xs uppercase tracking-wider">Google Sheets</Label>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Spreadsheet ID:</Label>
                  {renderEditableField('sheet_id', editSheetId, setEditSheetId, () => handleFieldSave('spreadsheet_id', editSheetId), 'Voer spreadsheet ID in...')}
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Grid ID:</Label>
                  {renderEditableField('grid_id', editGridId, setEditGridId, () => handleFieldSave('grid_id', editGridId), 'Voer grid ID in...')}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-white/70">Pagina url:</Label>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-white/40 hover:text-white/70 cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[9999] max-w-xs bg-card border-border text-white p-3">
                          <p className="text-sm text-white/80">De pagina die je wilt gebruiken in de nieuwe context</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {renderEditableField('page_url', editPageUrl, setEditPageUrl, () => handleFieldSave('page_url', editPageUrl), 'Voer pagina url in...')}
                </div>
              </div>
              <Button
                onClick={handleStart}
                disabled={isStarting || schedule?.enabled === true || !editName.trim() || !editDomain.trim() || !editPassword.trim() || !editSheetId.trim() || !editGridId.trim() || !editPageUrl.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 sm:py-3"
              >
                {schedule?.enabled === true ? (
                  <><Clock className="w-4 h-4 mr-2" />Automatische trigger actief</>
                ) : isStarting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Bezig met starten...</>
                ) : (
                  'Start'
                )}
              </Button>
            </div>

            {/* Right: Animation panel */}
            <div className="hidden lg:flex flex-1 min-w-0 flex-col">
              <AltTextAnimation isAnimating={isAnimating} onAnimationComplete={handleAnimationComplete} />
            </div>
          </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Selecteer een bedrijf om de gegevens te zien</p>
        )}
      </div>
    </div>
  );
};

export default Landingspagina;
