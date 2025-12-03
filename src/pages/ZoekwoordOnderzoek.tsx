import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import SeoResearchForm from '@/components/seo/SeoResearchForm';

const ZoekwoordOnderzoek = () => {
  const { isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center seo-page-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen seo-page-gradient">
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
      
      <div className="w-full flex flex-col items-center justify-start pt-24 pb-16 px-6">
        <h1 className="hero-title text-white mb-4 fade-in-up text-center">
          Zoekwoord Onderzoek
        </h1>
        <p className="text-white/50 text-lg mb-12 text-center max-w-lg">
          Vul de stappen in om een AI-gestuurd SEO zoekwoordonderzoek te starten
        </p>
        
        <SeoResearchForm />
      </div>
    </div>
  );
};

export default ZoekwoordOnderzoek;
