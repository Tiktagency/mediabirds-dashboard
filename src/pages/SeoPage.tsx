import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const SeoPage = () => {
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
    <div className="fixed inset-0 w-screen h-screen">
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
      
      {/* Fullscreen iframe */}
      <iframe
        src="https://seo-interface.lovable.app/"
        className="w-full h-full border-0"
        title="Zoekwoord onderzoek"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default SeoPage;