import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AltTextCompanySelector from '@/components/wordpress-alt-text/AltTextCompanySelector';
import type { AltTextCompany } from '@/components/wordpress-alt-text/AltTextCompanySelector';
import { Pencil, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WordpressAltText = () => {
  const { isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<AltTextCompany | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    setEditName(selectedCompany?.name || '');
    setEditDomain(selectedCompany?.domain || '');
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

  const handleFieldSave = async (field: 'name' | 'domain', value: string) => {
    if (!selectedCompany) return;
    const currentValue = field === 'name' ? selectedCompany.name : (selectedCompany.domain || '');
    if (value === currentValue) return;

    const { error } = await supabase
      .from('alt_text_companies')
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
    setIsStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-alt-text-webhook', {
        body: {
          bedrijfsnaam: selectedCompany.name,
          domain: selectedCompany.domain,
        },
      });

      if (error) throw error;

      toast({ title: 'Gestart', description: 'Alt-tekst verwerking is gestart' });
    } catch (error) {
      console.error('Error triggering alt text webhook:', error);
      toast({ title: 'Fout', description: 'Er ging iets mis bij het starten', variant: 'destructive' });
    } finally {
      setIsStarting(false);
    }
  };

  const renderEditableField = (
    fieldId: string,
    value: string,
    onChange: (val: string) => void,
    onBlur: () => void,
    placeholder: string
  ) => {
    if (editingField === fieldId) {
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            setEditingField(null);
            onBlur();
          }}
          placeholder={placeholder}
          className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
          autoFocus
        />
      );
    }

    if (expandedField === fieldId) {
      return (
        <div className="expanded-field-container relative px-3 py-2 pr-12 rounded-md bg-white/5 border border-white/20 text-white min-h-[40px]">
          <span className={!value ? 'text-white/30' : ''}>{value || placeholder}</span>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedField(null);
              setEditingField(fieldId);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div
        onClick={() => setExpandedField(fieldId)}
        className="px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white h-[40px] flex items-center overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
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
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Dashboard
          </Button>
        </Link>
        <AltTextCompanySelector onSelect={setSelectedCompany} selectedCompany={selectedCompany} />
      </div>
      
      <div className="hero-gradient h-full w-full flex flex-col items-center justify-start pt-32 px-6">
        <h1 className="hero-title text-white mb-12 fade-in-up">
          Alt-tekst wordpress
        </h1>

        {selectedCompany ? (
          <div className="space-y-6 max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Bedrijfsnaam:</Label>
                {renderEditableField(
                  'name',
                  editName,
                  setEditName,
                  () => handleFieldSave('name', editName),
                  'Voer bedrijfsnaam in...'
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Domeinnaam:</Label>
                {renderEditableField(
                  'domain',
                  editDomain,
                  setEditDomain,
                  () => handleFieldSave('domain', editDomain),
                  'Voer domeinnaam in...'
                )}
              </div>
            </div>

            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full bg-[#cfddd0] hover:bg-[#bccfbd] text-gray-900 font-semibold py-3"
            >
              {isStarting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Bezig met starten...</>
              ) : (
                'Start'
              )}
            </Button>
          </div>
        ) : (
          <p className="text-white/40 text-sm">Selecteer een bedrijf om de gegevens te zien</p>
        )}
      </div>
    </div>
  );
};

export default WordpressAltText;
