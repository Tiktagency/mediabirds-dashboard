import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LeadsGenerator = () => {
  const { toast } = useToast();
  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [locatie, setLocatie] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const isValid = bedrijfsnaam.trim() && locatie.trim() && beschrijving.trim();

  const handleStart = async () => {
    if (!isValid) return;
    setIsStarting(true);
    try {
      // Placeholder - webhook can be connected later
      toast({ title: 'Gestart', description: 'Leads generator is gestart voor ' + bedrijfsnaam });
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
          Genereer automatisch leads op basis van je bedrijfsinformatie en gewenste locatie. Vul de gegevens in en start de zoektocht.
        </p>

        <div className="w-full max-w-lg space-y-4">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Bedrijfsnaam</Label>
              <Input
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
                placeholder="Voer je bedrijfsnaam in..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Locatie</Label>
              <Input
                value={locatie}
                onChange={(e) => setLocatie(e.target.value)}
                placeholder="Bijv. Amsterdam, Noord-Holland..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Bedrijfsbeschrijving</Label>
              <Textarea
                value={beschrijving}
                onChange={(e) => setBeschrijving(e.target.value)}
                placeholder="Beschrijf je bedrijf en de leads die je zoekt..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[120px]"
              />
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
