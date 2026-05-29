import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Users, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsDemoUser, DEMO_TOOLTIP } from '@/hooks/useIsDemoUser';
import { supabase } from '@/integrations/supabase/client';

const LeadsGenerator = () => {
  const { toast } = useToast();
  const { isDemo } = useIsDemoUser();
  const [plaatsnaam, setPlaatsnaam] = useState(
    () => localStorage.getItem('leads-generator-plaatsnaam') || ''
  );
  const [country, setCountry] = useState(
    () => localStorage.getItem('leads-generator-country') || ''
  );
  const [zoektermen, setZoektermen] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('leads-generator-zoektermen');
      return saved ? JSON.parse(saved) : [''];
    } catch { return ['']; }
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isValid = plaatsnaam.trim() && country.trim() && zoektermen.some(z => z.trim());

  const handleFieldBlur = (value: string) => {
    if (value.trim()) {
      toast({
        title: 'Opgeslagen',
        duration: 1000,
      });
    }
  };

  const updatePlaatsnaam = (val: string) => {
    setPlaatsnaam(val);
    localStorage.setItem('leads-generator-plaatsnaam', val);
  };

  const updateCountry = (val: string) => {
    setCountry(val);
    localStorage.setItem('leads-generator-country', val);
  };

  const saveZoektermen = (updated: string[]) => {
    setZoektermen(updated);
    localStorage.setItem('leads-generator-zoektermen', JSON.stringify(updated));
  };

  const updateZoekterm = (index: number, value: string) => {
    const updated = [...zoektermen];
    updated[index] = value;
    saveZoektermen(updated);
  };

  const addZoekterm = () => saveZoektermen([...zoektermen, '']);

  const removeZoekterm = (index: number) => {
    saveZoektermen(zoektermen.filter((_, i) => i !== index));
  };

  const stopProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleStart = async () => {
    if (!isValid) return;
    setIsStarting(true);
    setIsRunning(true);
    setProgress(0);

    // Progress: 0→100 over 300s
    intervalRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + 100 / 300, 99.9));
    }, 1000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300_000); // 5 min

    try {
      const searchStringsArray = zoektermen.filter(z => z.trim());
      const { data, error } = await supabase.functions.invoke('trigger-leads-webhook', {
        body: { Plaatsnaam: plaatsnaam, Country: country, searchStringsArray },
      });

      if (error) throw error;

      // Check if the response indicates failure
      if (!data?.success) {
        stopProgress();
        toast({
          title: 'ERROR',
          description: data?.error || 'De webhook heeft geen resultaat teruggestuurd',
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }

      stopProgress();
      setProgress(100);

      // Parse response message
      let message = '';
      try {
        if (data?.data) {
          const d = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
          const parsed = typeof data.data === 'object' ? data.data : JSON.parse(d);
          message = parsed?.message || parsed?.Output || d;
        }
      } catch { /* use default */ }

      if (!message) {
        toast({
          title: 'ERROR',
          description: 'De webhook heeft geen bruikbaar resultaat teruggestuurd',
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }

      localStorage.removeItem('leads-generator-plaatsnaam');
      localStorage.removeItem('leads-generator-country');
      localStorage.removeItem('leads-generator-zoektermen');
      toast({ title: 'Resultaat', description: message, duration: 5000 });
    } catch (error: any) {
      stopProgress();
      const isTimeout = error?.name === 'AbortError' || error?.message?.includes('aborted');
      toast({
        title: 'ERROR',
        description: isTimeout ? 'Timeout: geen antwoord binnen 5 minuten' : 'Er ging iets mis bij het verwerken',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      clearTimeout(timeout);
      setIsStarting(false);
      setTimeout(() => { setIsRunning(false); setProgress(0); }, 1000);
    }
  };

  return (
    <div className="h-screen overflow-hidden relative">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Dashboard
          </Button>
        </Link>
      </div>

      <div className="hero-gradient h-full w-full flex flex-col items-center justify-start pt-32 px-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-foreground" />
          <h1 className="hero-title text-foreground fade-in-up">Leads Generator</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-xl mb-8">
          Genereer automatisch leads op basis van locatie en zoektermen. Vul de gegevens in en start de zoektocht.
        </p>

        {isRunning && (
          <div className="w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl mb-4">
            <Progress value={progress} className="h-2 bg-white/10 [&>div]:bg-primary" />
          </div>
        )}

        <div className="w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl space-y-4">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Plaatsnaam</Label>
              <Input
                value={plaatsnaam}
                onChange={(e) => updatePlaatsnaam(e.target.value)}
                onBlur={() => handleFieldBlur(plaatsnaam)}
                placeholder="Bijv. Amsterdam"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Country</Label>
              <Input
                value={country}
                onChange={(e) => updateCountry(e.target.value)}
                onBlur={() => handleFieldBlur(country)}
                placeholder="e.g. Netherlands"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Zoektermen</Label>
              {zoektermen.map((term, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={term}
                    onChange={(e) => updateZoekterm(index, e.target.value)}
                    onBlur={() => handleFieldBlur(term)}
                    placeholder={`Zoekterm ${index + 1}`}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                  {zoektermen.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeZoekterm(index)}
                      className="text-white/50 hover:text-white hover:bg-white/10 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addZoekterm}
                className="text-white/50 hover:text-white hover:bg-white/10 mt-1 h-8 px-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Extra zoekterm
              </Button>
            </div>
          </div>

          <Button
            onClick={handleStart}
            disabled={!isValid || isStarting || isDemo}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3"
            title={isDemo ? DEMO_TOOLTIP : undefined}
          >
            {isStarting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Bezig met starten...</>
            ) : isDemo ? (
              'Start (demo - uitgeschakeld)'
            ) : (
              'Start'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadsGenerator;
