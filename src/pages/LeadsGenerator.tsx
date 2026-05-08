import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LeadsGenerator = () => {
  const { toast } = useToast();
  const [plaatsnaam, setPlaatsnaam] = useState('');
  const [country, setCountry] = useState('');
  const [zoektermen, setZoektermen] = useState<string[]>(['']);
  const [isStarting, setIsStarting] = useState(false);

  const isValid = plaatsnaam.trim() && country.trim() && zoektermen.some(z => z.trim());

  const updateZoekterm = (index: number, value: string) => {
    const updated = [...zoektermen];
    updated[index] = value;
    setZoektermen(updated);
  };

  const addZoekterm = () => setZoektermen([...zoektermen, '']);

  const removeZoekterm = (index: number) => {
    setZoektermen(zoektermen.filter((_, i) => i !== index));
  };

  const handleStart = async () => {
    if (!isValid) return;
    setIsStarting(true);
    try {
      const searchStringsArray = zoektermen.filter(z => z.trim());
      const { data, error } = await supabase.functions.invoke('trigger-leads-webhook', {
        body: { Plaatsnaam: plaatsnaam, Country: country, searchStringsArray },
      });
      if (error) throw error;
      toast({ title: 'Gestart', description: 'Leads generator is gestart voor ' + plaatsnaam });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Fout', description: 'Er ging iets mis bij het starten', variant: 'destructive' });
    } finally {
      setIsStarting(false);
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

        <div className="w-full max-w-lg space-y-4">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Plaatsnaam</Label>
              <Input
                value={plaatsnaam}
                onChange={(e) => setPlaatsnaam(e.target.value)}
                placeholder="Bijv. Amsterdam"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Country</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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
            disabled={!isValid || isStarting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3"
          >
            {isStarting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Bezig met starten...</>
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
