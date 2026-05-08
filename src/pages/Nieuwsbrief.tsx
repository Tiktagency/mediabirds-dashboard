import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Loader2, Newspaper, Palette, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <span className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</span>
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
      {/* Dashboard button */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
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

                {/* Bedrijfsnaam */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/50 uppercase tracking-wide">
                    Bedrijfsnaam
                  </Label>
                  <Input
                    placeholder="bijv. Mediabirds"
                    value={settings.bedrijfsnaam}
                    onChange={(e) => saveSettings({ bedrijfsnaam: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Bedrijfsinformatie */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/50 uppercase tracking-wide">
                    Bedrijfsinformatie
                  </Label>
                  <Textarea
                    placeholder="Beschrijf je bedrijf, producten of diensten…"
                    value={settings.bedrijfsinformatie}
                    onChange={(e) => saveSettings({ bedrijfsinformatie: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] resize-none"
                  />
                </div>

                {/* Schrijfstijl */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-white/50 uppercase tracking-wide">
                    Schrijfstijl
                  </Label>
                  <Textarea
                    placeholder="bijv. Professioneel en informatief, of juist speels en toegankelijk…"
                    value={settings.schrijfstijl}
                    onChange={(e) => saveSettings({ schrijfstijl: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
                  />
                </div>

                {/* RSS Feeds */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-white/50 uppercase tracking-wide">
                    RSS Feeds
                    <span className="ml-1.5 text-white/30 normal-case tracking-normal">
                      ({settings.rss_feeds.length}/{MAX_RSS_FEEDS})
                    </span>
                  </Label>

                  {settings.rss_feeds.length > 0 && (
                    <div className="space-y-2">
                      {settings.rss_feeds.map((feed, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 group"
                        >
                          <span className="flex-1 text-sm text-white/70 truncate font-mono">{feed}</span>
                          <button
                            onClick={() => removeFeed(i)}
                            className="text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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

                {/* Kleuren */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-white/50" />
                    <Label className="text-xs font-medium text-white/50 uppercase tracking-wide">
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
