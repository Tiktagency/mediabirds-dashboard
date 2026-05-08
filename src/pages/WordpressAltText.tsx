import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AltTextCompanySelector from '@/components/wordpress-alt-text/AltTextCompanySelector';

const WordpressAltText = () => {
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
    <div className="h-screen overflow-hidden relative">
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Dashboard
          </Button>
        </Link>
        <AltTextCompanySelector />
      </div>
      
      <div className="hero-gradient h-full w-full flex flex-col items-center justify-start pt-32 px-6">
        <h1 className="hero-title text-white mb-12 fade-in-up">
          Alt-tekst wordpress
        </h1>
      </div>
    </div>
  );
};

export default WordpressAltText;
