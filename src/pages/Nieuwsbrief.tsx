import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Loader2, Newspaper, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNewsletterSettings } from '@/hooks/useNewsletterSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MAX_RSS_FEEDS = 5;

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
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    <div className="flex items-center gap-2">
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-background/50 font-mono text-sm"
        placeholder="#000000"
      />
    </div>
  </div>
);

const Nieuwsbrief = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, isLoading, saveSettings, setGeneratedHtml } = useNewsletterSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newFeed, setNewFeed] = useState('');

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  const addFeed = () => {
    const trimmed = newFeed.trim();
    if (!trimmed || settings.rss_feeds.length >= MAX_RSS_FEEDS) return;
    saveSettings({ rss_feeds: [...settings.rss_feeds, trimmed] });
    setNewFeed('');
  };

  const removeFeed = (index: number) => {
    saveSettings({ rss_feeds: settings.rss_feeds.filter((_, i) => i !== index) });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Niet ingelogd');

      const response = await supabase.functions.invoke('trigger-newsletter-webhook', {
        body: {
          bedrijfsnaam: settings.bedrijfsnaam,
          bedrijfsinformatie: settings.bedrijfsinformatie,
          schrijfstijl: settings.schrijfstijl,
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
        toast({ title: 'Verzonden', description: 'De aanvraag is verstuurd naar N8N.' });
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug
        </button>
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Nieuwsbrief</h1>
        </div>
      </header>

      {/* Main two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column — form */}
        <div className="w-[400px] xl:w-[440px] flex-shrink-0 border-r border-border/50 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* Bedrijfsnaam */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bedrijfsnaam
              </Label>
              <Input
                placeholder="bijv. Mediabirds"
                value={settings.bedrijfsnaam}
                onChange={(e) => saveSettings({ bedrijfsnaam: e.target.value })}
                className="bg-input/50"
              />
            </div>

            {/* Bedrijfsinformatie */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bedrijfsinformatie
              </Label>
              <Textarea
                placeholder="Beschrijf je bedrijf, producten of diensten…"
                value={settings.bedrijfsinformatie}
                onChange={(e) => saveSettings({ bedrijfsinformatie: e.target.value })}
                className="bg-input/50 min-h-[100px] resize-none"
              />
            </div>

            {/* Schrijfstijl */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Schrijfstijl
              </Label>
              <Textarea
                placeholder="bijv. Professioneel en informatief, of juist speels en toegankelijk…"
                value={settings.schrijfstijl}
                onChange={(e) => saveSettings({ schrijfstijl: e.target.value })}
                className="bg-input/50 min-h-[80px] resize-none"
              />
            </div>

            {/* RSS Feeds */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                RSS Feeds
                <span className="ml-1.5 text-muted-foreground/50 normal-case tracking-normal">
                  ({settings.rss_feeds.length}/{MAX_RSS_FEEDS})
                </span>
              </Label>

              {settings.rss_feeds.length > 0 && (
                <div className="space-y-2">
                  {settings.rss_feeds.map((feed, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 group"
                    >
                      <span className="flex-1 text-sm text-foreground/80 truncate font-mono">{feed}</span>
                      <button
                        onClick={() => removeFeed(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {settings.rss_feeds.length < MAX_RSS_FEEDS && (
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/feed.xml"
                    value={newFeed}
                    onChange={(e) => setNewFeed(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFeed()}
                    className="bg-input/50 text-sm font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addFeed}
                    disabled={!newFeed.trim()}
                    className="flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Kleuren */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
            <div className="pt-2 pb-6">
              <Button
                className="w-full gap-2 h-11"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
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
          </div>
        </div>

        {/* Right column — HTML preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/10">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-card/30">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              HTML Preview
            </span>
            {settings.generated_html && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const blob = new Blob([settings.generated_html!], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'nieuwsbrief.html';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Downloaden
              </Button>
            )}
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-hidden">
            {settings.generated_html ? (
              <iframe
                srcDoc={settings.generated_html}
                sandbox="allow-same-origin"
                title="Nieuwsbrief preview"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Newspaper className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground/70">Nog geen preview beschikbaar</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Vul de gegevens in en klik op <span className="font-medium text-foreground/60">Genereer nieuwsbrief</span> om een preview te zien.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nieuwsbrief;
