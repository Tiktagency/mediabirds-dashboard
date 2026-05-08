import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AltTextCompanySelector, { AltTextCompany } from '@/components/wordpress-alt-text/AltTextCompanySelector';

const WordpressAltText = () => {
  const { isLoading } = useAdminAuth();
  const [companies, setCompanies] = useState<AltTextCompany[]>([]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden relative">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="hero-gradient h-full w-full flex flex-col items-center justify-start pt-32 px-6 overflow-y-auto">
        <h1 className="hero-title text-white mb-12 fade-in-up">
          Alt-tekst wordpress
        </h1>
        
        <div className="flex flex-col items-center gap-6 max-w-5xl w-full pb-12">
          <div className="self-end">
            <AltTextCompanySelector onCompaniesChange={setCompanies} />
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white w-full">
            <CardContent className="pt-6">
              <p className="text-base mb-4 leading-relaxed">
                Deze automatisering loopt op de achtergrond en is niet vanaf dit dashboard te besturen. 
                Het genereert automatisch alt-teksten voor alle afbeeldingen op de gekoppelde WordPress-websites.
              </p>
              <div className="mt-4">
                <p className="font-semibold mb-3 text-white/90">Dit is momenteel actief voor de volgende sites:</p>
                {companies.length > 0 ? (
                  <ul className="space-y-2 ml-4">
                    {companies.map((company) => (
                      <li key={company.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span>{company.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50 text-sm ml-4">Nog geen bedrijven toegevoegd.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WordpressAltText;
