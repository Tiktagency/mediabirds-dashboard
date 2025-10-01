import { Button } from '@/components/ui/button';

const SeoPage = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      {/* Dashboard button */}
      <div className="absolute top-6 left-6 z-50">
        <a href="https://mediabirds-dashboard.lovable.app/" target="_blank" rel="noopener noreferrer">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Dashboard
          </Button>
        </a>
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