import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Loader2, Newspaper, Palette, Download, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNewsletterSettings } from '@/hooks/useNewsletterSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MAX_RSS_FEEDS = 5;

type LocalData = { bedrijfsnaam: string; bedrijfsinformatie: string; schrijfstijl: string };
type AnyField = keyof LocalData | 'rss_feeds';

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
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0.5 cursor-pointer shrink-0 bg-white/5 border-white/10"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-white/5 border-white/10 text-white font-mono text-sm placeholder:text-white/30"
        placeholder="#000000"
      />
    </div>
  </div>
);

const Nieuwsbrief = () => {
  const { toast } = useToast();
  const { settings, isLoading, saveSettings, setGeneratedHtml } = useNewsletterSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newFeed, setNewFeed] = useState('');
  const [editingField, setEditingField] = useState<AnyField | null>(null);
  const [expandedField, setExpandedField] = useState<AnyField | null>(null);
  const [localData, setLocalData] = useState<LocalData>({ bedrijfsnaam: '', bedrijfsinformatie: '', schrijfstijl: '' });
  const expandedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings) {
      setLocalData({
        bedrijfsnaam: settings.bedrijfsnaam || '',
        bedrijfsinformatie: settings.bedrijfsinformatie || '',
        schrijfstijl: settings.schrijfstijl || '',
      });
    }
  }, [settings]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (expandedField && expandedRef.current && !expandedRef.current.contains(e.target as Node)) {
        if (expandedField === 'rss_feeds' && editingField === 'rss_feeds') {
          setEditingField(null);
        }
        setExpandedField(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expandedField, editingField]);

  const handleSaveField = (field: keyof LocalData) => {
    setEditingField(null);
    if (!settings) return;
    const current = localData[field];
    const original = settings[field] || '';
    if (current === original) return;
    saveSettings({ [field]: current });
    toast({ title: 'Opgeslagen', description: `${field} is bijgewerkt.` });
  };

  const addFeed = () => {
    const trimmed = newFeed.trim();
    if (!trimmed || !settings || settings.rss_feeds.length >= MAX_RSS_FEEDS) return;
    saveSettings({ rss_feeds: [...settings.rss_feeds, trimmed] });
    setNewFeed('');
  };

  const removeFeed = (index: number) => {
    if (!settings) return;
    saveSettings({ rss_feeds: settings.rss_feeds.filter((_, i) => i !== index) });
  };

  const renderTextField = (
    field: keyof LocalData,
    label: string,
    type: 'input' | 'textarea',
    placeholder: string
  ) => {
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
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] resize-none"
              placeholder={placeholder}
            />
          )}
        </div>
      );
    }

    if (isExpanded) {
      return (
        <div className="space-y-1.5" ref={expandedRef}>
          <Label className="text-xs font-medium text-white/50">{label}</Label>
          <div className="relative bg-white/5 border border-white/10 rounded-md px-3 py-2 group">
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

  const renderRssFeeds = () => {
    if (!settings) return null;
    const isEditing = editingField === 'rss_feeds';
    const isExpanded = expandedField === 'rss_feeds';
    const feedCount = settings.rss_feeds.length;

    // Editing state
    if (isEditing) {
      return (
        <div className="space-y-2" ref={expandedRef}>
          <Label className="text-xs font-medium text-white/50">
            RSS feeds
            <span className="ml-1.5 text-white/30">({feedCount}/{MAX_RSS_FEEDS})</span>
          </Label>
          {feedCount > 0 && (
            <div className="space-y-2">
              {settings.rss_feeds.map((feed, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 group">
                  <span className="flex-1 text-sm text-white/70 truncate font-mono">{feed}</span>
                  <button onClick={() => removeFeed(i)} className="text-white/30 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {feedCount < MAX_RSS_FEEDS && (
            <div className="flex gap-2">
              <Input
                autoFocus={feedCount === 0}
                placeholder="https://example.com/feed.xml"
                value={newFeed}
                onChange={(e) => setNewFeed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFeed()}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={addFeed}
                disabled={!newFeed.trim()}
                className="flex-shrink-0 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Expanded state
    if (isExpanded) {
      return (
        <div className="space-y-2" ref={expandedRef}>
          <Label className="text-xs font-medium text-white/50">
            RSS feeds
            <span className="ml-1.5 text-white/30">({feedCount}/{MAX_RSS_FEEDS})</span>
          </Label>
          <div className="relative bg-white/5 border border-white/10 rounded-md px-3 py-2 group">
            {feedCount > 0 ? (
              <div className="space-y-1 pr-8">
                {settings.rss_feeds.map((feed, i) => (
                  <p key={i} className="text-sm text-white/70 font-mono truncate">{feed}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-white/30 pr-8">Geen feeds toegevoegd</p>
            )}
            <button
              onClick={() => { setEditingField('rss_feeds'); }}
              className="absolute top-2 right-2 text-white/30 hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    // Collapsed state
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/50">RSS feeds</Label>
        <div
          onClick={() => setExpandedField('rss_feeds')}
          className="h-[40px] flex items-center bg-white/5 border border-white/10 rounded-md px-3 cursor-pointer hover:bg-white/10 transition-colors"
        >
          {feedCount > 0 ? (
            <span className="text-sm text-white/70">{feedCount} feed{feedCount !== 1 ? 's' : ''} toegevoegd</span>
          ) : (
            <span className="text-sm text-white/30 italic">Geen feeds toegevoegd</span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          <p className="mt-3 text-sm text-white/50">Laden...</p>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Niet ingelogd');

      const response = await supabase.functions.invoke('trigger-newsletter-webhook', {
        body: {
          bedrijfsnaam: localData.bedrijfsnaam,
          bedrijfsinformatie: localData.bedrijfsinformatie,
          schrijfstijl: localData.schrijfstijl,
          rss_feeds: settings.rss_feeds,
          achtergrond_kleur: settings.achtergrond_kleur,
          primaire_kleur: settings.primaire_kleur,
          accent_kleur: settings.accent_kleur,
          settingsId: settings.id || undefined,
        },
      });

      if (response.error) throw response.error;

      const html = response.data?.html;
      if (html) {
        await setGeneratedHtml(html);
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
    if (!settings.generated_html) return;
    const blob = new Blob([settings.generated_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nieuwsbrief.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
            Dashboard
          </Button>
        </Link>
      </div>

      <div className="w-full flex flex-col items-center justify-start pt-8 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          Nieuwsbrief
        </h1>
        <p className="text-white/50 text-lg mb-8 text-center max-w-lg">
          Genereer een op maat gemaakte nieuwsbrief op basis van RSS feeds en huisstijl
        </p>

        <div className="w-full max-w-7xl 2xl:max-w-[1600px]">
          <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6 items-start">

            {/* Left: Form */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-5">

                {renderTextField('bedrijfsnaam', 'Bedrijfsnaam', 'input', 'bijv. Mediabirds')}
                {renderTextField('bedrijfsinformatie', 'Bedrijfsinformatie', 'textarea', 'Beschrijf je bedrijf, producten of diensten…')}
                {renderTextField('schrijfstijl', 'Schrijfstijl', 'textarea', 'bijv. Professioneel en informatief, of juist speels en toegankelijk…')}

                {renderRssFeeds()}

                {/* Kleuren */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-white/50" />
                    <Label className="text-xs font-medium text-white/50">
                      Huisstijl kleuren
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <ColorField
                      label="Achtergrond"
                      value={settings.achtergrond_kleur}
                      onChange={(v) => saveSettings({ achtergrond_kleur: v })}
                    />
                    <ColorField
                      label="Primaire kleur"
                      value={settings.primaire_kleur}
                      onChange={(v) => saveSettings({ primaire_kleur: v })}
                    />
                    <ColorField
                      label="Accent kleur"
                      value={settings.accent_kleur}
                      onChange={(v) => saveSettings({ accent_kleur: v })}
                    />
                  </div>
                </div>

                {/* Generate button */}
                <div className="pt-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Right: Preview */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-lg">HTML Preview</CardTitle>
                {settings.generated_html && (
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
                {settings.generated_html ? (
                  <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: '600px' }}>
                    <iframe
                      srcDoc={settings.generated_html}
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
        </div>
      </div>
    </div>
  );
};

export default Nieuwsbrief;
