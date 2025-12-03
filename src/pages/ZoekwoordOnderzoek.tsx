import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const ZoekwoordOnderzoek = () => {
  const { isLoading } = useAdminAuth();

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
    <div className="min-h-screen hero-gradient">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm"
          >
            Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="h-full w-full flex flex-col items-center justify-start pt-32 px-6">
        <h1 className="hero-title text-white mb-12 fade-in-up">
          Zoekwoord onderzoek
        </h1>
        
        {/* Content komt hier later */}
      </div>
    </div>
  );
};

export default ZoekwoordOnderzoek;
