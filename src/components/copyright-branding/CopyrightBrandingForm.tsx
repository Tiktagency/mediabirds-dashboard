import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PERSONALITY_TYPES = [
  { id: 'professioneel', label: 'Professioneel' },
  { id: 'informeel', label: 'Informeel' },
  { id: 'enthousiast', label: 'Enthousiast' },
  { id: 'zakelijk', label: 'Zakelijk' },
  { id: 'creatief', label: 'Creatief' },
  { id: 'humoristisch', label: 'Humoristisch' },
  { id: 'empathisch', label: 'Empathisch' },
  { id: 'autoritair', label: 'Autoritair' },
  { id: 'inspirerend', label: 'Inspirerend' },
  { id: 'educatief', label: 'Educatief' },
  { id: 'betrouwbaar', label: 'Betrouwbaar' },
  { id: 'innovatief', label: 'Innovatief' },
];

const POST_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'blogpagina', label: 'Blogpagina' },
  { value: 'socialmedia', label: 'Social media post' },
  { value: 'nieuwsbrief', label: 'Nieuwsbrief' },
  { value: 'advertentie', label: 'Advertentie tekst' },
];

export const CopyrightBrandingForm = () => {
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [postType, setPostType] = useState('');
  const [subject, setSubject] = useState('');
  const [wordCount, setWordCount] = useState([250]);
  const [extraDescription, setExtraDescription] = useState('');
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'generate' | 'rewrite'>('generate');

  const handlePersonalityToggle = (id: string) => {
    setSelectedPersonalities(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      if (prev.length >= 2) {
        toast.error('Je kunt maximaal 2 persoonlijkheidstypes selecteren');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selectedPersonalities.length === 0) {
      toast.error('Selecteer minimaal 1 persoonlijkheidstype');
      return;
    }
    if (!postType) {
      toast.error('Selecteer een type post');
      return;
    }
    if (!subject) {
      toast.error('Vul een onderwerp in');
      return;
    }
    if (mode === 'rewrite' && !oldText) {
      toast.error('Vul de te herschrijven tekst in');
      return;
    }

    setIsLoading(true);
    setNewText('');

    try {
      const response = await supabase.functions.invoke('rewrite-text', {
        body: {
          personalities: selectedPersonalities,
          postType,
          subject,
          wordCount: wordCount[0],
          extraDescription,
          oldText: mode === 'rewrite' ? oldText : undefined,
          mode,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setNewText(response.data.text);
      toast.success('Tekst succesvol gegenereerd!');
    } catch (error) {
      console.error('Error generating text:', error);
      toast.error('Er ging iets mis bij het genereren van de tekst');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(newText);
    setCopied(true);
    toast.success('Tekst gekopieerd naar klembord');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Tekst Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personality Types */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Persoonlijkheidstype <span className="text-muted-foreground text-sm">(max 2)</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {PERSONALITY_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedPersonalities.includes(type.id)
                      ? 'border-accent bg-accent/10'
                      : 'border-border/50 hover:border-border'
                  }`}
                  onClick={() => handlePersonalityToggle(type.id)}
                >
                  <Checkbox
                    id={type.id}
                    checked={selectedPersonalities.includes(type.id)}
                    onCheckedChange={() => handlePersonalityToggle(type.id)}
                  />
                  <Label htmlFor={type.id} className="text-sm cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Post Type */}
          <div className="space-y-2">
            <Label htmlFor="postType">Type post</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer type post" />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Onderwerp</Label>
            <Input
              id="subject"
              placeholder="Bijv. 'Duurzame mode trends'"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Word Count */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Aantal woorden</Label>
              <span className="text-sm text-muted-foreground">{wordCount[0]} woorden</span>
            </div>
            <Slider
              value={wordCount}
              onValueChange={setWordCount}
              min={50}
              max={3000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Extra Description */}
          <div className="space-y-2">
            <Label htmlFor="extraDescription">Extra beschrijving (optioneel)</Label>
            <Textarea
              id="extraDescription"
              placeholder="Eventuele extra instructies of context..."
              value={extraDescription}
              onChange={(e) => setExtraDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mode Tabs */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'generate' | 'rewrite')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Genereer nieuwe tekst</TabsTrigger>
              <TabsTrigger value="rewrite">Herschrijf bestaande tekst</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                variant="primaryCustom"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Genereren...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Genereer tekst
                  </>
                )}
              </Button>

              {newText && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Label>Gegenereerde tekst</Label>
                      <span className="text-xs text-muted-foreground">
                        {newText.trim().split(/\s+/).filter(Boolean).length} woorden
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border/50 min-h-[200px]">
                    <p className="whitespace-pre-wrap">{newText}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rewrite" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Old Text */}
                <div className="space-y-2">
                  <Label htmlFor="oldText">Oude tekst</Label>
                  <Textarea
                    id="oldText"
                    placeholder="Plak hier de tekst die je wilt herschrijven..."
                    value={oldText}
                    onChange={(e) => setOldText(e.target.value)}
                    rows={10}
                    className="min-h-[250px]"
                  />
                </div>

                {/* New Text */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Label>Nieuwe tekst</Label>
                      {newText && (
                        <span className="text-xs text-muted-foreground">
                          {newText.trim().split(/\s+/).filter(Boolean).length} woorden
                        </span>
                      )}
                    </div>
                    {newText && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border/50 min-h-[250px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : newText ? (
                      <p className="whitespace-pre-wrap">{newText}</p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        De herschreven tekst verschijnt hier...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                variant="primaryCustom"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Herschrijven...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Herschrijf tekst
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
