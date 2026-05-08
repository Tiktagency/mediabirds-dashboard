import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LandingCompanySelector from '@/components/landing/LandingCompanySelector';
import type { LandingCompany } from '@/components/landing/LandingCompanySelector';
import AltTextAnimation from '@/components/wordpress-alt-text/AltTextAnimation';
import { ScheduleTrigger } from '@/components/seo/ScheduleTrigger';
import { useAltTextSchedule } from '@/hooks/useAltTextSchedule';
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
  const [isStarting, setIsStarting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { schedule, isLoading: scheduleLoading, isSaving, updateSchedule, getNextTriggerDisplay } = useAltTextSchedule();

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    setEditName(selectedCompany?.name || '');
    setEditDomain(selectedCompany?.domain || '');
    setEditPassword(selectedCompany?.app_password || '');
    setEditSheetId(selectedCompany?.spreadsheet_id || '');
    setEditGridId(selectedCompany?.grid_id || '');
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

  const handleFieldSave = async (field: 'name' | 'domain' | 'app_password' | 'spreadsheet_id' | 'grid_id', value: string) => {
    if (!selectedCompany) return;
    const currentValue = field === 'name' ? selectedCompany.name 
      : field === 'domain' ? (selectedCompany.domain || '') 
      : field === 'app_password' ? (selectedCompany.app_password || '')
      : field === 'spreadsheet_id' ? (selectedCompany.spreadsheet_id || '')
      : (selectedCompany.grid_id || '');
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
    if (!editName.trim() || !editDomain.trim() || !editPassword.trim() || !editSheetId.trim() || !editGridId.trim()) {
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
    if (editingField === fieldId) {
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => { setEditingField(null); onBlur(); }}
          placeholder={placeholder}
          className="bg-white/5 border-white/20 text-white placeholder:text-white/30 w-full overflow-hidden"
          autoFocus
        />
      );
    }
    if (expandedField === fieldId) {
      return (
        <div className="expanded-field-container relative px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/20 text-white min-h-[40px] overflow-hidden min-w-0">
          <span className={`break-all ${!value ? 'text-white/30' : ''}`}>{value || placeholder}</span>
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
        className="px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white h-[40px] flex items-center overflow-hidden cursor-pointer hover:bg-white/10 transition-colors min-w-0"
      >
        <span className={`truncate ${!value ? 'text-white/30' : ''}`}>{value || placeholder}</span>
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
    <div className="h-screen overflow-hidden relative">
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Dashboard
          </Button>
        </Link>
        <LandingCompanySelector onSelect={setSelectedCompany} selectedCompany={selectedCompany} />
      </div>

      <div className="hero-gradient h-full w-full flex flex-col items-center justify-start pt-32 px-6 overflow-y-auto">
        <h1 className="hero-title text-foreground mb-2 fade-in-up">Landingspagina</h1>
        <p className="text-muted-foreground text-center max-w-xl mb-6">
          Genereer automatisch landingspagina's voor al je websites! Koppel je Google Sheet, selecteer een bedrijf en laat de magie beginnen.
        </p>

        {/* Global Schedule Trigger */}
        <div className="w-full max-w-2xl mb-6">
          <ScheduleTrigger
            companyId="global"
            isAdmin={isAdmin}
            schedule={schedule as any}
            isLoading={scheduleLoading}
            isSaving={isSaving}
            updateSchedule={updateSchedule as any}
            getNextTriggerDisplay={getNextTriggerDisplay}
          />
        </div>

        {selectedCompany ? (
          <div className="flex flex-col lg:flex-row gap-6 max-w-2xl w-full items-stretch">
            {/* Left: Company fields + Google Sheets + Start button */}
            <div className="flex-1 w-full space-y-4">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
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
                        <TooltipContent side="top" className="max-w-xs bg-card border-border text-white p-4">
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
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => setEditingField('app_password')}
                        className="px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white h-[40px] flex items-center overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <span className={`truncate ${!editPassword ? 'text-white/30' : ''}`}>
                          {editPassword ? '•'.repeat(editPassword.length) : 'abcd efgh ijkl 1234'}
                        </span>
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
              </div>
              <Button
                onClick={handleStart}
                disabled={isStarting || schedule?.enabled === true || !editName.trim() || !editDomain.trim() || !editPassword.trim() || !editSheetId.trim() || !editGridId.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3"
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
            <div className="w-full lg:w-72 flex-shrink-0 flex flex-col">
              <AltTextAnimation isAnimating={isAnimating} onAnimationComplete={handleAnimationComplete} />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Selecteer een bedrijf om de gegevens te zien</p>
        )}
      </div>
    </div>
  );
};

export default Landingspagina;
