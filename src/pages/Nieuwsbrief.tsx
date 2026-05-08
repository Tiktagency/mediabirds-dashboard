import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Loader2, Newspaper, Palette, Download, Pencil, Wand2, Settings2, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import NewsletterCompanySelector, { NewsletterCompany } from '@/components/nieuwsbrief/NewsletterCompanySelector';

const MAX_RSS_FEEDS = 5;

type TextFieldKey = 'bedrijfsnaam' | 'tagline' | 'bedrijfsomschrijving' | 'doelgroep' | 'toon' | 'cta_tekst' | 'cta_url' | 'website';
type LocalData = Record<TextFieldKey, string>;

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <span className="text-xs font-medium text-white/50">{label}</span>
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded cursor-pointer border border-white/10 shrink-0 relative overflow-hidden"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-white/5 border-white/10 text-white font-mono text-sm placeholder:text-white/30"
        placeholder="#000000"
      />
    </div>
  </div>
);

const TEXT_FIELDS: { key: TextFieldKey; label: string; type: 'input' | 'textarea'; placeholder: string }[] = [
  { key: 'bedrijfsnaam', label: 'Bedrijfsnaam', type: 'input', placeholder: 'bijv. Tikt' },
  { key: 'tagline', label: 'Tagline', type: 'input', placeholder: 'bijv. Minder druk, meer tijd' },
  { key: 'bedrijfsomschrijving', label: 'Bedrijfsomschrijving', type: 'textarea', placeholder: 'Beschrijf je bedrijf, producten of diensten…' },
  { key: 'doelgroep', label: 'Doelgroep', type: 'textarea', placeholder: 'bijv. MKB-ondernemers die werkdruk willen verlagen' },
  { key: 'toon', label: 'Toon', type: 'input', placeholder: 'bijv. Direct, eerlijk en mensgericht' },
  { key: 'cta_tekst', label: 'CTA tekst', type: 'input', placeholder: 'bijv. Plan een vrijblijvende sessie' },
  { key: 'cta_url', label: 'CTA URL', type: 'input', placeholder: 'https://...' },
  { key: 'website', label: 'Website', type: 'input', placeholder: 'https://...' },
];

const COLOR_FIELDS: { key: string; label: string }[] = [
  { key: 'primaire_kleur', label: 'Primaire kleur' },
  { key: 'secundaire_kleur', label: 'Secundaire kleur' },
  { key: 'achtergrond_kleur', label: 'Achtergrond' },
  { key: 'kaart_achtergrond', label: 'Kaart achtergrond' },
  { key: 'tekst_kleur', label: 'Tekstkleur' },
  { key: 'subtekst_kleur', label: 'Subtekstkleur' },
  { key: 'accent_kleur', label: 'Accentkleur' },
  { key: 'cta_tekst_kleur', label: 'CTA tekstkleur' },
  { key: 'footer_achtergrond', label: 'Footer achtergrond' },
  { key: 'footer_tekst_kleur', label: 'Footer tekstkleur' },
];

const Nieuwsbrief = () => {
  const { toast } = useToast();
  const colorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<NewsletterCompany | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [localData, setLocalData] = useState<LocalData>({
    bedrijfsnaam: '', tagline: '', bedrijfsomschrijving: '', doelgroep: '',
    toon: '', cta_tekst: '', cta_url: '', website: '',
  });
  const [localColors, setLocalColors] = useState<Record<string, string>>({
    primaire_kleur: '#FF6B2C', secundaire_kleur: '#1A2B5E', achtergrond_kleur: '#F5F3EF',
    kaart_achtergrond: '#FFFFFF', tekst_kleur: '#1A1A2E', subtekst_kleur: '#6B7280',
    accent_kleur: '#FFF0E8', cta_tekst_kleur: '#FFFFFF', footer_achtergrond: '#1A2B5E',
    footer_tekst_kleur: '#E8EDF7',
  });
  const [localFeeds, setLocalFeeds] = useState<string[]>([]);
  const [generatedHtml, setGeneratedHtmlLocal] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<'custom' | 'auto'>('custom');
  const [isFetchingColors, setIsFetchingColors] = useState(false);

  // Load data from selected company
  useEffect(() => {
    if (selectedCompany) {
      setLocalData({
        bedrijfsnaam: selectedCompany.bedrijfsnaam || '',
        tagline: selectedCompany.tagline || '',
        bedrijfsomschrijving: selectedCompany.bedrijfsomschrijving || '',
        doelgroep: selectedCompany.doelgroep || '',
        toon: selectedCompany.toon || '',
        cta_tekst: selectedCompany.cta_tekst || '',
        cta_url: selectedCompany.cta_url || '',
        website: selectedCompany.website || '',
      });
      setLocalColors({
        primaire_kleur: selectedCompany.primaire_kleur,
        secundaire_kleur: selectedCompany.secundaire_kleur,
        achtergrond_kleur: selectedCompany.achtergrond_kleur,
        kaart_achtergrond: selectedCompany.kaart_achtergrond,
        tekst_kleur: selectedCompany.tekst_kleur,
        subtekst_kleur: selectedCompany.subtekst_kleur,
        accent_kleur: selectedCompany.accent_kleur,
        cta_tekst_kleur: selectedCompany.cta_tekst_kleur,
        footer_achtergrond: selectedCompany.footer_achtergrond,
        footer_tekst_kleur: selectedCompany.footer_tekst_kleur,
      });
      setLocalFeeds(selectedCompany.rss_feeds || []);
      setGeneratedHtmlLocal(selectedCompany.generated_html || null);
    }
  }, [selectedCompany]);

  const saveToCompany = useCallback(async (patch: Record<string, any>) => {
    if (!selectedCompany) return;
    await supabase
      .from('newsletter_companies' as any)
      .update(patch)
      .eq('id', selectedCompany.id);
  }, [selectedCompany]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (expandedField && !(e.target as Element).closest('.expanded-field-container')) {
        setExpandedField(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expandedField]);

  const handleSaveField = (field: TextFieldKey) => {
    setEditingField(null);
    const current = localData[field];
    if (selectedCompany) {
      saveToCompany({ [field]: current });
    }
    toast({ title: 'Opgeslagen' });
  };

  const handleSaveFeed = (index: number, value: string) => {
    setEditingField(null);
    const newFeeds = [...localFeeds];
    if (value.trim()) {
      newFeeds[index] = value.trim();
    } else {
      newFeeds.splice(index, 1);
    }
    setLocalFeeds(newFeeds);
    if (selectedCompany) {
      saveToCompany({ rss_feeds: newFeeds });
    }
    toast({ title: 'Opgeslagen' });
  };

  const handleAddFeed = () => {
    if (localFeeds.length >= MAX_RSS_FEEDS) return;
    const newFeeds = [...localFeeds, ''];
    setLocalFeeds(newFeeds);
    setEditingField(`rss_feed_${newFeeds.length - 1}`);
    setExpandedField(null);
  };

  const handleRemoveFeed = (index: number) => {
    const newFeeds = localFeeds.filter((_, i) => i !== index);
    setLocalFeeds(newFeeds);
    if (selectedCompany) {
      saveToCompany({ rss_feeds: newFeeds });
    }
  };

  const handleFetchColors = async () => {
    if (!localData.website) {
      toast({
        title: 'Website ontbreekt',
        description: 'Vul eerst een website URL in.',
        variant: 'destructive',
      });
      return;
    }
    setIsFetchingColors(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-brand-colors', {
        body: { website: localData.website },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Kleuren ophalen mislukt');

      const colors = data.colors;
      setLocalColors(colors);
      if (selectedCompany) {
        await saveToCompany(colors);
      }
      toast({ title: 'Kleuren opgehaald!', description: 'Huisstijlkleuren zijn automatisch ingevuld.' });
    } catch (err: any) {
      toast({
        title: 'Fout bij ophalen kleuren',
        description: err?.message || 'Er is iets misgegaan.',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingColors(false);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setLocalColors(prev => ({ ...prev, [key]: value }));
    if (!selectedCompany) return;
    if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    colorDebounceRef.current = setTimeout(() => {
      saveToCompany({ [key]: value });
    }, 600);
  };

  const renderTextField = (field: TextFieldKey, label: string, type: 'input' | 'textarea', placeholder: string) => {
    const value = localData[field];
    const isEditing = editingField === field;
    const isExpanded = expandedField === field;

    if (isEditing) {
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-white/50">{label}</Label>
          {type === 'input' ? (
            <Input
              autoFocus
              value={value}
              onChange={(e) => setLocalData(prev => ({ ...prev, [field]: e.target.value }))}
              onBlur={() => handleSaveField(field)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              placeholder={placeholder}
            />
          ) : (
            <Textarea
              autoFocus
              value={value}
              onChange={(e) => setLocalData(prev => ({ ...prev, [field]: e.target.value }))}
              onBlur={() => handleSaveField(field)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
              placeholder={placeholder}
            />
          )}
        </div>
      );
    }

    if (isExpanded) {
      return (
        <div className="space-y-1.5 expanded-field-container">
          <Label className="text-xs font-medium text-white/50">{label}</Label>
          <div className="relative bg-white/5 border border-white/10 rounded-md px-3 py-2">
            <p className="text-sm text-white/80 whitespace-pre-wrap pr-8">
              {value || <span className="italic text-white/30">{placeholder}</span>}
            </p>
            <button
              onClick={() => { setEditingField(field); setExpandedField(null); }}
              className="absolute top-2 right-2 text-white/30 hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/50">{label}</Label>
        <div
          onClick={() => setExpandedField(field)}
          className="h-[40px] flex items-center bg-white/5 border border-white/10 rounded-md px-3 cursor-pointer hover:bg-white/10 transition-colors"
        >
          {value ? (
            <span className="text-sm text-white/70 truncate">{value}</span>
          ) : (
            <span className="text-sm text-white/30 italic">{placeholder}</span>
          )}
        </div>
      </div>
    );
  };

  const renderRssFeedItem = (index: number, feedValue: string) => {
    const fieldId = `rss_feed_${index}`;
    const isEditing = editingField === fieldId;
    const isExpanded = expandedField === fieldId;

    if (isEditing) {
      return (
        <Input
          autoFocus
          value={feedValue}
          onChange={(e) => {
            const updated = [...localFeeds];
            updated[index] = e.target.value;
            setLocalFeeds(updated);
          }}
          onBlur={() => handleSaveFeed(index, feedValue)}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveFeed(index, feedValue)}
          placeholder="https://example.com/feed.xml"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono text-sm"
        />
      );
    }

    if (isExpanded) {
      return (
        <div className="expanded-field-container relative px-3 py-2 pr-10 rounded-md bg-white/5 border border-white/10 text-white min-h-[40px]">
          <span className={`font-mono text-sm break-all ${!feedValue ? 'text-white/30' : 'text-white/80'}`}>
            {feedValue || 'https://example.com/feed.xml'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setExpandedField(null); setEditingField(fieldId); }}
            className="absolute top-2 right-2 text-white/30 hover:text-white transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => setExpandedField(fieldId)}
        className="h-[40px] flex items-center bg-white/5 border border-white/10 rounded-md px-3 cursor-pointer hover:bg-white/10 transition-colors overflow-hidden"
      >
        <span className={`text-sm truncate font-mono ${feedValue ? 'text-white/70' : 'text-white/30 italic'}`}>
          {feedValue || 'https://example.com/feed.xml'}
        </span>
      </div>
    );
  };

  const renderRssFeeds = () => (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-white/50">
        RSS feeds
        <span className="ml-1.5 text-white/30">({localFeeds.length}/{MAX_RSS_FEEDS})</span>
      </Label>
      <div className="space-y-2">
        {localFeeds.map((feed, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1">{renderRssFeedItem(i, feed)}</div>
            <button
              onClick={() => handleRemoveFeed(i)}
              className="text-white/30 hover:text-destructive transition-colors flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      {localFeeds.length < MAX_RSS_FEEDS && (
        <Button
          variant="outline"
          onClick={handleAddFeed}
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Feed toevoegen
        </Button>
      )}
    </div>
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Niet ingelogd');

      const response = await supabase.functions.invoke('trigger-newsletter-webhook', {
        body: {
          bedrijfsnaam: localData.bedrijfsnaam,
          tagline: localData.tagline,
          bedrijfsomschrijving: localData.bedrijfsomschrijving,
          doelgroep: localData.doelgroep,
          toon: localData.toon,
          cta_tekst: localData.cta_tekst,
          cta_url: localData.cta_url,
          website: localData.website,
          rss_feeds: localFeeds,
          primaire_kleur: localColors.primaire_kleur,
          secundaire_kleur: localColors.secundaire_kleur,
          achtergrond_kleur: localColors.achtergrond_kleur,
          kaart_achtergrond: localColors.kaart_achtergrond,
          tekst_kleur: localColors.tekst_kleur,
          subtekst_kleur: localColors.subtekst_kleur,
          accent_kleur: localColors.accent_kleur,
          cta_tekst_kleur: localColors.cta_tekst_kleur,
          footer_achtergrond: localColors.footer_achtergrond,
          footer_tekst_kleur: localColors.footer_tekst_kleur,
          settingsId: selectedCompany.id,
        },
      });

      if (response.error) throw response.error;

      const html = response.data?.html;
      if (html) {
        setGeneratedHtmlLocal(html);
        if (selectedCompany) {
          await saveToCompany({ generated_html: html });
        }
        toast({ title: 'Nieuwsbrief gegenereerd!', description: 'De preview is bijgewerkt.' });
      } else {
        toast({ title: 'Verzonden', description: 'De aanvraag is verstuurd.' });
      }
    } catch (err: any) {
      toast({
        title: 'Fout',
        description: err?.message || 'Er is iets misgegaan.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nieuwsbrief.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative hero-gradient flex flex-col">
      {/* Header bar */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Dashboard
          </Button>
        </Link>
        <NewsletterCompanySelector
          selectedCompany={selectedCompany}
          onSelect={setSelectedCompany}
        />
      </div>

      <div className="w-full flex flex-col items-center justify-start pt-32 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          Nieuwsbrief
        </h1>
        <p className="text-white/50 text-lg mb-8 text-center max-w-lg">
          Genereer een op maat gemaakte nieuwsbrief op basis van RSS feeds en huisstijl
        </p>

        {!selectedCompany ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white/20" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-white/50">Selecteer een bedrijf om te beginnen</p>
              <p className="text-xs text-white/30 max-w-xs">
                Kies een bedrijf via het menu rechtsboven om de nieuwsbrief instellingen te beheren.
              </p>
            </div>
          </div>
        ) : (

        <div className="w-full max-w-7xl 2xl:max-w-[1600px] space-y-6">

          {/* Two equal columns for input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* Column 1: Bedrijfsinfo + RSS */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                {TEXT_FIELDS.slice(0, 4).map(({ key, label, type, placeholder }) =>
                  renderTextField(key, label, type, placeholder)
                )}
                {renderRssFeeds()}
              </CardContent>
            </Card>

            {/* Column 2: Toon/CTA + Kleuren */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                {TEXT_FIELDS.slice(4).map(({ key, label, type, placeholder }) =>
                  renderTextField(key, label, type, placeholder)
                )}

                {/* Kleuren */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-white/50" />
                      <Label className="text-xs font-medium text-white/50">
                        Huisstijl kleuren
                      </Label>
                    </div>
                    {/* Mode toggle */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5 border border-white/10">
                      <button
                        onClick={() => setColorMode('custom')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          colorMode === 'custom'
                            ? 'bg-white/15 text-white'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        <Settings2 className="w-3 h-3" />
                        Custom
                      </button>
                      <button
                        onClick={() => setColorMode('auto')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          colorMode === 'auto'
                            ? 'bg-white/15 text-white'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        <Wand2 className="w-3 h-3" />
                        Automatisch
                      </button>
                    </div>
                  </div>

                  {colorMode === 'auto' && (
                    <div className="space-y-2">
                      {!localData.website && (
                        <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          Vul eerst een website URL in om kleuren automatisch op te halen.
                        </div>
                      )}
                      <Button
                        onClick={handleFetchColors}
                        disabled={isFetchingColors || !localData.website}
                        className="w-full gap-2"
                        variant="outline"
                      >
                        {isFetchingColors ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Kleuren ophalen…
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Kleuren ophalen van website
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className={`grid grid-cols-2 gap-3 ${colorMode === 'auto' ? 'opacity-60 pointer-events-none' : ''}`}>
                    {COLOR_FIELDS.map(({ key, label }) => (
                      <ColorField
                        key={key}
                        label={label}
                        value={localColors[key as string] || '#000000'}
                        onChange={(v) => handleColorChange(key as string, v)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate button full width */}
          <Button className="w-full gap-2 h-11" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Nieuwsbrief genereren…
              </>
            ) : (
              <>
                <Newspaper className="w-4 h-4" />
                Genereer nieuwsbrief
              </>
            )}
          </Button>

          {/* Preview full width */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-lg">HTML Preview</CardTitle>
              {generatedHtml && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Downloaden
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 pb-6 px-6">
              {generatedHtml ? (
                <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: '700px' }}>
                  <iframe
                    srcDoc={generatedHtml}
                    sandbox="allow-same-origin"
                    title="Nieuwsbrief preview"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-center px-8 py-20">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Newspaper className="w-7 h-7 text-white/20" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-white/50">Nog geen preview beschikbaar</p>
                    <p className="text-xs text-white/30 max-w-xs">
                      Vul de gegevens in en klik op{' '}
                      <span className="font-medium text-white/40">Genereer nieuwsbrief</span>{' '}
                      om een preview te zien.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
        )}
      </div>
    </div>
  );
};

export default Nieuwsbrief;
