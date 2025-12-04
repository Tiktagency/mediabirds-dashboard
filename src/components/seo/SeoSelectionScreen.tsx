import { Button } from '@/components/ui/button';
import { Search, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SeoSelectionScreenProps {
  onSelectResearch: () => void;
}

const SeoSelectionScreen = ({ onSelectResearch }: SeoSelectionScreenProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubzoekwoorden = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://tikt.app.n8n.cloud/webhook/c7c16588-ebba-4569-a85b-543fc5bdb4c1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify('GO'),
      });

      if (!response.ok) {
        throw new Error('Webhook request failed');
      }

      const data = await response.json();

      toast({
        title: 'Subzoekwoorden',
        description: data.Output || 'Actie voltooid.',
        duration: 7000,
      });
    } catch (error) {
      console.error('Error triggering subzoekwoorden:', error);
      toast({
        title: 'Er is iets misgegaan',
        description: 'De subzoekwoorden konden niet worden gestart. Probeer het opnieuw.',
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="seo-card p-8 md:p-12 animate-fade-in">
        <div className="space-y-3 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Kies een optie
          </h2>
          <p className="text-white/60 text-lg font-light tracking-wide">
            Wat wil je doen?
          </p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={onSelectResearch}
            className="group p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-orange-500">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Zoekwoord onderzoek
                </h3>
                <p className="text-white/50 text-sm mt-1">
                  Start een nieuw SEO zoekwoordonderzoek
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleSubzoekwoorden}
            disabled={isLoading}
            className="group p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-purple-500">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <GitBranch className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Subzoekwoorden
                </h3>
                <p className="text-white/50 text-sm mt-1">
                  Genereer subzoekwoorden voor bestaande onderzoeken
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeoSelectionScreen;
