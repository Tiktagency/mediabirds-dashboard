import { Button } from '@/components/ui/button';
import { Search, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SeoSelectionScreenProps {
  onSelectResearch: () => void;
  subkeywordsWebhook: string;
  companyName: string;
  authTokenSecretName: string | null;
}

const SeoSelectionScreen = ({ onSelectResearch, subkeywordsWebhook, companyName, authTokenSecretName }: SeoSelectionScreenProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubzoekwoorden = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('trigger-seo-webhook', {
        body: {
          webhookUrl: subkeywordsWebhook,
          authTokenSecretName: authTokenSecretName,
          action: 'subkeywords',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Subzoekwoorden',
          description: data.message || 'Actie voltooid.',
          duration: 7000,
        });
      } else {
        throw new Error(data.error || 'Webhook request failed');
      }
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
                  Subzoekwoorden <span className="text-sm font-normal text-white/50">- {companyName}</span>
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
